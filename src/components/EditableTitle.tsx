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
  const [initialHeight, setInitialHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    if (isEditing && textareaRef.current && h1Ref.current && initialHeight !== null) {
      // Fixer la hauteur du h1 pour éviter que les éléments en dessous bougent
      h1Ref.current.style.height = `${initialHeight}px`;
      h1Ref.current.style.minHeight = `${initialHeight}px`;
      h1Ref.current.style.maxHeight = `${initialHeight}px`;
      
      textareaRef.current.focus();
      textareaRef.current.select();
      // Limiter le textarea à la hauteur du h1, avec scroll si nécessaire
      textareaRef.current.style.height = `${initialHeight}px`;
      textareaRef.current.style.maxHeight = `${initialHeight}px`;
    }
  }, [isEditing, initialHeight]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current && initialHeight !== null) {
      // Le textarea garde sa hauteur fixe, le scroll gère le contenu qui dépasse
      // Pas besoin de recalculer la hauteur
    }
  }, [editValue, isEditing, initialHeight]);
  const handleStartEdit = () => {
    if (disabled) return;
    // Mesurer la hauteur avant de passer en mode édition
    if (h1Ref.current) {
      setInitialHeight(h1Ref.current.offsetHeight);
    }
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
    // Réinitialiser les styles du h1
    if (h1Ref.current) {
      h1Ref.current.style.height = '';
      h1Ref.current.style.minHeight = '';
      h1Ref.current.style.maxHeight = '';
    }
    setIsEditing(false);
    setInitialHeight(null);
  };
  const handleCancel = () => {
    setEditValue(title);
    // Réinitialiser les styles du h1
    if (h1Ref.current) {
      h1Ref.current.style.height = '';
      h1Ref.current.style.minHeight = '';
      h1Ref.current.style.maxHeight = '';
    }
    setIsEditing(false);
    setInitialHeight(null);
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
    return <h1 
      ref={h1Ref}
      className={`${className} relative pt-2 pb-2`} 
      style={{ 
        paddingLeft: '0px', 
        paddingRight: '0px',
        overflow: 'hidden'
      }}
    >
      <textarea 
        ref={textareaRef} 
        value={editValue} 
        onChange={e => setEditValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        className="w-full bg-transparent border-0 text-inherit font-inherit resize-none outline-none p-0 m-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0" 
        style={{
          fontSize: 'inherit',
          lineHeight: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          padding: 0,
          margin: 0,
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          outline: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }} 
        rows={1} 
      />
    </h1>;
  }
  
  return <h1 
    ref={h1Ref}
    className={`${className} group pt-2 pb-2`} 
    style={{ paddingLeft: '0px', paddingRight: '0px' }}
  >
      {title}
      {!disabled && <Button variant="ghost" size="sm" onClick={handleStartEdit} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0 ml-4 mt-0 mb-0 align-middle inline-flex items-center justify-center bg-white border border-border rounded-full hover:bg-gray-50">
          <Edit2 className="h-4 w-4" />
        </Button>}
    </h1>;
};