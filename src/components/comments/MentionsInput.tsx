import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WorkspaceMemberProfile } from '@/services/workspaceMembersService';
import { AtSign } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  workspaceId: string;
}

interface MentionMatch {
  start: number;
  end: number;
  query: string;
}

export const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder = "Partagez votre commentaire, note ou réflexion...",
  disabled = false,
  className = "",
  workspaceId
}) => {
  const { t } = useI18nUI();
  const [members, setMembers] = useState<WorkspaceMemberProfile[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [filteredMembers, setFilteredMembers] = useState<WorkspaceMemberProfile[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Charger les membres du workspace
  useEffect(() => {
    const loadMembers = async () => {
      if (!workspaceId) return;
      
      setIsLoadingMembers(true);
      try {
        const { workspaceMembersService } = await import('@/services/workspaceMembersService');
        const membersData = await workspaceMembersService.getWorkspaceMembers(workspaceId);
        setMembers(membersData);
      } catch (error) {
        console.error('Error loading workspace members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [workspaceId]);

  // Détecter les mentions dans le texte
  const findMentionMatch = useCallback((text: string, cursorPos: number): MentionMatch | null => {
    const beforeCursor = text.substring(0, cursorPos);
    const mentionRegex = /@([a-zA-Z0-9]*)$/;
    const match = beforeCursor.match(mentionRegex);
    
    if (match) {
      return {
        start: cursorPos - match[0].length,
        end: cursorPos,
        query: match[1]
      };
    }
    
    return null;
  }, []);

  // Gérer les changements dans le textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPos);
    
    // Vérifier s'il y a une mention en cours
    const mentionMatch = findMentionMatch(newValue, newCursorPos);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch.query);
      setMentionPosition(mentionMatch.start);
      setShowMentions(true);
      
      // Filtrer les membres selon la requête
      const filtered = members.filter(member => 
        member.full_name?.toLowerCase().includes(mentionMatch.query.toLowerCase()) ||
        member.email?.toLowerCase().includes(mentionMatch.query.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setShowMentions(false);
    }
  };

  // Insérer une mention
  const insertMention = (member: WorkspaceMemberProfile) => {
    const beforeMention = value.substring(0, mentionPosition);
    const afterMention = value.substring(cursorPosition);
    const mentionText = `@${member.full_name || member.email}`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange(newValue);
    setShowMentions(false);
    
    // Repositionner le curseur après la mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false);
        e.preventDefault();
      }
    }
  };

  // Rendre le texte avec les mentions stylées
  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Ajouter la mention stylée
      const mentionText = match[0];
      const memberName = match[1];
      const member = members.find(m => 
        m.full_name === memberName || m.email === memberName
      );
      
      if (member) {
        parts.push(
          <span key={match.index} className="inline-flex items-center gap-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
            <AtSign className="h-3 w-3" />
            {member.full_name || member.email}
          </span>
        );
      } else {
        parts.push(mentionText);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le texte restant
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      
      {/* Popover pour les suggestions de mentions */}
      <Popover open={showMentions} onOpenChange={setShowMentions}>
        <PopoverTrigger asChild>
          <div className="absolute" style={{ 
            left: 0, 
            top: 0, 
            width: 0, 
            height: 0,
            pointerEvents: 'none'
          }} />
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="start"
          side="top"
        >
          <Command>
            <CommandInput 
              placeholder={t('comments.mentions.searchPlaceholder')} 
              value={mentionQuery}
              onValueChange={setMentionQuery}
              className="border-0 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <CommandList>
              <CommandEmpty>
                {isLoadingMembers ? t('comments.mentions.loading') : t('comments.mentions.noMembersFound')}
              </CommandEmpty>
              <CommandGroup>
                {filteredMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => insertMention(member)}
                    className="flex items-center gap-2 p-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={member.avatar_url || undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.full_name || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {member.role === 'owner' ? t('comments.mentions.owner') : 
                       member.role === 'contributor' ? t('comments.mentions.contributor') : t('comments.mentions.viewer')}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
