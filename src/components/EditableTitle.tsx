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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <h1 className={className}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${className} bg-transparent border-none outline-none resize-none w-full ring-0 focus:ring-0 shadow-none`}
          style={{ 
            fontSize: 'inherit', 
            lineHeight: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            border: 'none',
            boxShadow: 'none'
          }}
        />
      </h1>
    );
  }

  return (
    <h1 className={`${className} group`}>
      {title}
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0 ml-3 -mb-1 inline-flex items-center justify-center bg-white border border-border rounded-md hover:bg-gray-50"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </h1>
  );
};