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
  MoreHorizontal, 
  Trash2,
  Send
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceMember } from '@/types/workspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Load workspace members
  const loadMembers = async () => {
    if (!workspaceId) return;

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          workspace_id,
          user_id,
          role,
          created_at
        `)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      // Get user profiles separately to avoid complex joins
      if (data && data.length > 0) {
        const userIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const membersWithProfiles = data.map(member => ({
          ...member,
          role: member.role as 'owner' | 'member',
          profile: profiles?.find(p => p.id === member.user_id)
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
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
      // First, check if user is already a member
      const { data: existingMembers } = await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', workspaceId);

      if (existingMembers && existingMembers.length > 0) {
        const userIds = existingMembers.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const isAlreadyMember = profiles?.some(
          profile => profile.email?.toLowerCase() === inviteEmail.toLowerCase()
        );

        if (isAlreadyMember) {
          toast.error('Cette personne est déjà membre du workspace');
          return;
        }
      }

      // Send invitation via edge function
      const { data, error } = await supabase.functions.invoke('send-collaboration-invite', {
        body: {
          to: inviteEmail,
          shareUrl: `${window.location.origin}/workspace/join/${workspaceId}`,
          decisionTitle: `Invitation au workspace "${workspaceName}"`,
          locale: 'fr'
        }
      });

      if (error) throw error;

      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Impossible d\'envoyer l\'invitation');
    } finally {
      setInviting(false);
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setMemberToRemove(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Retirer du workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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