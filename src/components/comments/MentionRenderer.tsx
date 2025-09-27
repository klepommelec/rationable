import React from 'react';
import { AtSign } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface MentionRendererProps {
  text: string;
  members?: Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  }>;
}

export const MentionRenderer: React.FC<MentionRendererProps> = ({ text, members = [] }) => {
  const { t } = useI18nUI();
  
  // Fonction pour nettoyer les entités HTML
  const cleanText = (text: string) => {
    return text
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  };
  
  const renderTextWithMentions = (text: string) => {
    const cleanTextContent = cleanText(text);
    const mentionRegex = /@([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+)*)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(cleanTextContent)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(cleanTextContent.substring(lastIndex, match.index));
      }
      
      // Ajouter la mention stylée
      const mentionText = match[0];
      const memberName = match[1];
      const member = members.find(m => 
        m.full_name === memberName || m.email === memberName
      );
      
      if (member) {
        parts.push(
          <span 
            key={match.index} 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
            title={`${t('comments.mentions.owner')} ${member.full_name || member.email}`}
          >
            <AtSign className="h-3 w-3" />
            {member.full_name || member.email}
          </span>
        );
      } else {
        // Mention non reconnue
        parts.push(
          <span 
            key={match.index} 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm"
          >
            <AtSign className="h-3 w-3" />
            {memberName}
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le texte restant
    if (lastIndex < cleanTextContent.length) {
      parts.push(cleanTextContent.substring(lastIndex));
    }
    
    return parts;
  };

  return (
    <span className="whitespace-pre-wrap">
      {renderTextWithMentions(text)}
    </span>
  );
};
