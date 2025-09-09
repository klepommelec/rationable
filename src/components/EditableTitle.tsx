import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit2, Check, X } from 'lucide-react';
interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onTitleEdit?: (newTitle: string) => void;
  className?: string;
  disabled?: boolean;
}
export const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onTitleChange,
  onTitleEdit,
  className = "",
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, isEditing]);
  const handleStartEdit = () => {
    if (disabled) return;
    setEditValue(title);
    setIsEditing(true);
  };
  const handleSave = () => {
    if (editValue.trim() !== title && editValue.trim()) {
      onTitleChange(editValue.trim());
      // Déclencher une nouvelle analyse si callback fourni
      if (onTitleEdit) {
        onTitleEdit(editValue.trim());
      }
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  if (isEditing) {
    return (
      <h1 className={`${className} relative`}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-inherit font-inherit resize-none outline-none focus:border-border focus:bg-background/80 transition-colors overflow-hidden"
          style={{
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            minHeight: '60px'
          }}
          rows={1}
        />
      </h1>
    );
  }
  return <h1 className={`${className} group`}>
      {title}
      {!disabled && <Button variant="ghost" size="sm" onClick={handleStartEdit} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0 ml-3 -mt-4 inline-flex items-center justify-center bg-white border border-border rounded-full hover:bg-gray-50">
          <Edit2 className="h-4 w-4" />
        </Button>}
    </h1>;
};