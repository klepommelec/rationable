import React, { useState, useRef, useLayoutEffect } from 'react';
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
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (isEditing && textareaRef.current && h1Ref.current && initialHeight !== null && contentHeight !== null) {
      textareaRef.current.focus();
      textareaRef.current.select();
      textareaRef.current.style.minHeight = `${contentHeight}px`;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.maxHeight = '';
    }
  }, [isEditing, initialHeight, contentHeight]);

  // Ajuster la hauteur du textarea au contenu pour un surlignage cohérent
  useLayoutEffect(() => {
    if (isEditing && textareaRef.current && contentHeight !== null) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${Math.max(contentHeight, ta.scrollHeight)}px`;
    }
  }, [editValue, isEditing, contentHeight]);

  const handleStartEdit = () => {
    if (disabled) return;
    if (h1Ref.current) {
      const el = h1Ref.current;
      const full = el.offsetHeight;
      const cs = getComputedStyle(el);
      const padT = parseFloat(cs.paddingTop);
      const padB = parseFloat(cs.paddingBottom);
      setInitialHeight(full);
      setContentHeight(full - padT - padB);
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
    if (textareaRef.current) {
      textareaRef.current.style.height = '';
      textareaRef.current.style.minHeight = '';
    }
    setIsEditing(false);
    setInitialHeight(null);
    setContentHeight(null);
  };
  const handleCancel = () => {
    setEditValue(title);
    // Réinitialiser les styles du h1
    if (h1Ref.current) {
      h1Ref.current.style.height = '';
      h1Ref.current.style.minHeight = '';
      h1Ref.current.style.maxHeight = '';
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = '';
      textareaRef.current.style.minHeight = '';
    }
    setIsEditing(false);
    setInitialHeight(null);
    setContentHeight(null);
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
      <h1
        ref={h1Ref}
        className={`${className} relative pt-2 pb-2 w-full`}
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          minHeight: initialHeight !== null ? initialHeight : undefined,
          boxSizing: 'border-box',
        }}
      >
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full min-w-0 bg-transparent border-0 text-inherit font-inherit resize-none outline-none p-0 m-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 block box-border"
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
            overflow: 'hidden',
            overflowWrap: 'break-word',
            minHeight: contentHeight !== null ? `${contentHeight}px` : undefined,
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
          rows={1}
        />
      </h1>
    );
  }

  return (
    <h1
      ref={h1Ref}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      onClick={disabled ? undefined : handleStartEdit}
      onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStartEdit(); } }}
      className={`${className} group pt-2 pb-2 ${!disabled ? 'cursor-pointer hover:bg-muted/30 hover:opacity-[0.64] rounded-sm transition-colors' : ''}`}
      style={{ paddingLeft: 0, paddingRight: 0 }}
    >
      {title}
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0 ml-4 mt-0 mb-0 align-middle inline-flex items-center justify-center bg-white border border-border rounded-full hover:bg-gray-50"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </h1>
  );
};