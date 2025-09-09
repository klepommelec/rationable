import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  className?: string;
  disabled?: boolean;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onTitleChange,
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
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl font-bold h-auto py-2 border-2 border-primary"
          style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-2 flex-1 min-w-0 group">
      <h1 className={className}>
        {title}
      </h1>
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};