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
      <div className="flex items-center gap-2 flex-1 min-w-0">
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
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
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
          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 shrink-0 ml-1 -mb-0.5 inline-flex items-center justify-center"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </h1>
  );
};