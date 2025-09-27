import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  UserPlus, 
  Trash2,
  Send,
  Edit3
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceMember } from '@/types/workspace';
import { useI18nUI } from '@/contexts/I18nUIContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkspaceMembersManagerProps {
  workspaceId: string;
  workspaceName: string;
}

export const WorkspaceMembersManager: React.FC<WorkspaceMembersManagerProps> = ({
  workspaceId,
  workspaceName
}) => {
  const { t, getLocaleTag } = useI18nUI();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaces();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'contributor' | 'viewer'>('contributor');
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<{id: string, currentRole: string} | null>(null);

  // Load workspace members and pending invitations
  const loadMembers = async () => {
    if (!workspaceId || !currentWorkspace) return;

    try {
      // Load members from workspace_members table
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

      // Always include the workspace owner (admin) even if not in workspace_members table
      const allMemberIds = new Set<string>();
      
      // Add workspace owner
      allMemberIds.add(currentWorkspace.user_id);
      
      // Add other members
      if (membersData && membersData.length > 0) {
        membersData.forEach(member => allMemberIds.add(member.user_id));
      }

      // Get user profiles for all members
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(allMemberIds));

      // Build the complete members list
      const allMembers: any[] = [];

      // Add workspace owner first
      const ownerProfile = profiles?.find(p => p.id === currentWorkspace.user_id);
      allMembers.push({
        id: `owner-${currentWorkspace.user_id}`,
        workspace_id: workspaceId,
        user_id: currentWorkspace.user_id,
        role: 'owner',
        created_at: currentWorkspace.created_at,
        profile: ownerProfile
      });

      // Add other members
      if (membersData && membersData.length > 0) {
        const otherMembers = membersData.map(member => ({
          ...member,
          role: member.role as 'owner' | 'contributor' | 'viewer',
          profile: profiles?.find(p => p.id === member.user_id)
        }));
        allMembers.push(...otherMembers);
      }

      setMembers(allMembers);

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
      // Check if user is already a member (including the owner)
      const existingMember = members.find(
        member => (member as any).profile?.email?.toLowerCase() === inviteEmail.toLowerCase()
      );

      if (existingMember) {
        if (existingMember.role === 'owner') {
          toast.error('Cette personne est déjà l\'administrateur du workspace');
        } else {
          toast.error('Cette personne est déjà membre du workspace');
        }
        return;
      }

      // Check if trying to invite yourself (by email)
      const currentUserEmail = user?.email || (user?.user_metadata?.email);
      if (currentUserEmail && inviteEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
        toast.error('Vous ne pouvez pas vous inviter vous-même');
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
          status: 'pending',
          role: inviteRole
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
      setInviteRole('contributor');
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

  // Update member role
  const updateMemberRole = async (memberId: string, newRole: 'contributor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      // Update local state
      setMembers(members.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole }
          : member
      ));

      toast.success(`Rôle mis à jour vers ${newRole === 'contributor' ? t('settings.members.contributor') : t('settings.members.observer')}`);
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Impossible de mettre à jour le rôle');
    } finally {
      setMemberToEdit(null);
    }
  };

  // Remove member
  const removeMember = async () => {
    if (!memberToRemove) return;

    // Prevent removing the workspace owner
    if (memberToRemove.startsWith('owner-')) {
      toast.error('Impossible de retirer le propriétaire du workspace');
      setMemberToRemove(null);
      return;
    }

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
  }, [workspaceId, currentWorkspace]);

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
              {t('settings.members.invite')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                <div className="w-40">
                  <Select value={inviteRole} onValueChange={(value: 'contributor' | 'viewer') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contributor">{t('settings.members.contributor')}</SelectItem>
                      <SelectItem value="viewer">{t('settings.members.observer')}</SelectItem>
                    </SelectContent>
                  </Select>
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
                      {t('settings.members.invite')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('settings.members.inviteEmailSent')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('settings.members.workspaceMembers')} ({members.length + pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 && pendingInvitations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t('settings.members.noMembers')}
              </p>
            ) : (
              <>
                {/* Pending invitations first */}
                {pendingInvitations.map((invitation) => (
                  <div key={`invitation-${invitation.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invitation.email}</span>
                          <Badge variant="secondary" className="text-xs">
                            {t('settings.members.pending')}
                          </Badge>
                          {invitation.role && (
                            <Badge variant="outline" className="text-xs">
                              {invitation.role === 'contributor' ? t('settings.members.contributor') : t('settings.members.observer')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.members.invitedOn')} {new Date(invitation.created_at).toLocaleDateString(getLocaleTag())}
                          {invitation.expires_at && (
                            <span> • {t('settings.members.expiresOn')} {new Date(invitation.expires_at).toLocaleDateString(getLocaleTag())}</span>
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
                          title={t('settings.members.resendInvitation')}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title={t('settings.members.cancelInvitation')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Actual members */}
                {members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {(member as any).profile?.avatar_url && (
                          <AvatarImage 
                            src={(member as any).profile.avatar_url} 
                            alt="Avatar" 
                            className="object-cover w-full h-full"
                          />
                        )}
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
                          {member.role === 'owner' ? (
                            <Badge variant="secondary" className="text-xs">
                              {t('settings.members.admin')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {member.role === 'contributor' ? t('settings.members.contributor') : t('settings.members.observer')}
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToEdit({id: member.id, currentRole: member.role})}
                          title={t('settings.members.editRole')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToRemove(member.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Retirer du workspace"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit member role dialog */}
      <AlertDialog open={!!memberToEdit} onOpenChange={() => setMemberToEdit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Choisissez le nouveau rôle pour ce membre du workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select 
              value={memberToEdit?.currentRole || 'contributor'} 
              onValueChange={(value: 'contributor' | 'viewer') => {
                if (memberToEdit) {
                  updateMemberRole(memberToEdit.id, value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contributor">{t('settings.members.contributor')} - Peut créer et modifier des décisions</SelectItem>
                <SelectItem value="viewer">{t('settings.members.observer')} - Peut seulement consulter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('settings.workspaces.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogCancel>{t('settings.workspaces.cancel')}</AlertDialogCancel>
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