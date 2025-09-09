import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Mail, 
  UserPlus, 
  Crown, 
  Trash2,
  Send
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceMember } from '@/types/workspace';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WorkspaceMembersManagerProps {
  workspaceId: string;
  workspaceName: string;
}

export const WorkspaceMembersManager: React.FC<WorkspaceMembersManagerProps> = ({
  workspaceId,
  workspaceName
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaces();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Load workspace members and pending invitations
  const loadMembers = async () => {
    if (!workspaceId) return;

    try {
      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          id,
          workspace_id,
          user_id,
          role,
          created_at
        `)
        .eq('workspace_id', workspaceId);

      if (membersError) throw membersError;

      // Get user profiles separately to avoid complex joins
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          role: member.role as 'owner' | 'member',
          profile: profiles?.find(p => p.id === member.user_id)
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      setPendingInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  // Generate invitation token
  const generateInvitationToken = async () => {
    const { data, error } = await supabase.rpc('generate_invitation_token');
    if (error) throw error;
    return data;
  };

  // Send invitation
  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Veuillez saisir une adresse email valide');
      return;
    }

    setInviting(true);
    try {
      // Check if user is already a member
      const existingMember = members.find(
        member => (member as any).profile?.email?.toLowerCase() === inviteEmail.toLowerCase()
      );

      if (existingMember) {
        toast.error('Cette personne est déjà membre du workspace');
        return;
      }

      // Check if invitation already exists
      const existingInvitation = pendingInvitations.find(
        inv => inv.email.toLowerCase() === inviteEmail.toLowerCase()
      );

      if (existingInvitation) {
        toast.error('Une invitation est déjà en attente pour cette adresse');
        return;
      }

      // Generate invitation token
      const token = await generateInvitationToken();

      // Create invitation record
      const { data: invitationData, error: invitationError } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          invited_by: user?.id,
          email: inviteEmail,
          token: token,
          status: 'pending'
        })
        .select()
        .single();

      if (invitationError) throw invitationError;

      // Send invitation via edge function
      const { error: emailError } = await supabase.functions.invoke('send-collaboration-invite', {
        body: {
          to: inviteEmail,
          shareUrl: `${window.location.origin}/workspace/join/${token}`,
          decisionTitle: `Invitation au workspace "${workspaceName}"`,
          locale: 'fr'
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw error here, invitation was created successfully
        toast.success(`Invitation créée pour ${inviteEmail} (email en cours d'envoi)`);
      } else {
        toast.success(`Invitation envoyée à ${inviteEmail}`);
      }

      setInviteEmail('');
      setPendingInvitations([invitationData, ...pendingInvitations]);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Impossible d\'envoyer l\'invitation');
    } finally {
      setInviting(false);
    }
  };

  // Cancel invitation
  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
      toast.success('Invitation annulée');
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Impossible d\'annuler l\'invitation');
    }
  };

  // Resend invitation
  const resendInvitation = async (invitation: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-collaboration-invite', {
        body: {
          to: invitation.email,
          shareUrl: `${window.location.origin}/workspace/join/${invitation.token}`,
          decisionTitle: `Invitation au workspace "${workspaceName}"`,
          locale: 'fr'
        }
      });

      if (error) throw error;

      toast.success(`Invitation renvoyée à ${invitation.email}`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Impossible de renvoyer l\'invitation');
    }
  };

  // Remove member
  const removeMember = async () => {
    if (!memberToRemove) return;

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberToRemove)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberToRemove));
      toast.success('Membre retiré du workspace');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Impossible de retirer ce membre');
    } finally {
      setMemberToRemove(null);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const isOwner = currentWorkspace?.user_id === user?.id;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite new member */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Inviter un membre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="sr-only">
                  Adresse email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendInvitation();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={sendInvitation} 
                disabled={inviting}
                className="shrink-0"
              >
                {inviting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Inviter
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Un email d'invitation sera envoyé à cette adresse
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitations en attente ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invitation.email}</span>
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          En attente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invité le {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                        {invitation.expires_at && (
                          <span> • Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInvitation(invitation)}
                        title="Renvoyer l'invitation"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Annuler l'invitation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Membres du workspace ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun membre dans ce workspace
              </p>
            ) : (
              members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(member as any).profile?.full_name?.[0]?.toUpperCase() || 
                         (member as any).profile?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {(member as any).profile?.full_name || (member as any).profile?.email || 'Utilisateur'}
                        </span>
                        {member.role === 'owner' && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Propriétaire
                          </Badge>
                        )}
                      </div>
                      {(member as any).profile?.email && (
                        <p className="text-sm text-muted-foreground">
                          {(member as any).profile.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isOwner && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMemberToRemove(member.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove member confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retirera définitivement ce membre du workspace. 
              Il ne pourra plus accéder aux documents et décisions de ce workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={removeMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};