import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Crown, Eye } from 'lucide-react';
import { votingService, DecisionParticipant, ParticipantRole } from '@/services/votingService';
import { useAuth } from '@/hooks/useAuth';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface ParticipantManagerProps {
  decisionId: string;
  onParticipantChange?: () => void;
  className?: string;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  decisionId,
  onParticipantChange,
  className = ""
}) => {
  const { user } = useAuth();
  const { t } = useI18nUI();
  const [participants, setParticipants] = useState<DecisionParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadParticipants();
  }, [decisionId]);

  const loadParticipants = async () => {
    try {
      const data = await votingService.getDecisionParticipants(decisionId);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (participantId: string, newRole: ParticipantRole) => {
    if (!user) return;

    setIsUpdating(participantId);
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      await votingService.updateUserRole(decisionId, participant.user_id, newRole);
      await loadParticipants();
      onParticipantChange?.();
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!user) return;

    setIsUpdating(participantId);
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      await votingService.removeParticipant(decisionId, participant.user_id);
      await loadParticipants();
      onParticipantChange?.();
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleIcon = (role: ParticipantRole) => {
    return role === 'contributor' ? <Crown className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
  };

  const getRoleColor = (role: ParticipantRole) => {
    return role === 'contributor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun participant</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRoleIcon(participant.role)}
                  <span className="font-medium">
                    {participant.user_id === user?.id ? 'Vous' : `Utilisateur ${participant.user_id.slice(0, 8)}`}
                  </span>
                </div>
                <Badge className={getRoleColor(participant.role)}>
                  {participant.role === 'contributor' ? 'Contributeur' : 'Observateur'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={participant.role}
                  onValueChange={(value: ParticipantRole) => handleRoleChange(participant.id, value)}
                  disabled={isUpdating === participant.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Observateur
                      </div>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Contributeur
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {participant.user_id !== user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveParticipant(participant.id)}
                    disabled={isUpdating === participant.id}
                  >
                    Retirer
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        <div className="pt-3 border-t">
          <Button variant="outline" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un participant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
