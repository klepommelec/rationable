import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommentSection } from './CommentSection';
import { commentService } from '@/services/commentService';

interface CommentableSectionProps {
  children: React.ReactNode;
  decisionId: string | null | undefined;
  sectionId: 'criteria-section' | 'options-section' | 'recommendation-section' | 'comparison-table-section';
  sectionTitle: string;
  className?: string;
}

export const CommentableSection: React.FC<CommentableSectionProps> = ({
  children,
  decisionId,
  sectionId,
  sectionTitle,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPopoverOpenRef = useRef(false);

  const loadCommentsCount = useCallback(async () => {
    if (!decisionId) return;
    
    try {
      const comments = await commentService.getComments(decisionId);
      const filteredComments = comments.filter(
        comment => 
          comment.comment_type === 'general' &&
          comment.step_context === sectionId
      );
      setCommentsCount(filteredComments.length);
    } catch (error) {
      console.error('Error loading comments count:', error);
    }
  }, [decisionId, sectionId]);

  useEffect(() => {
    if (decisionId) {
      loadCommentsCount();
      // Recharger le compteur périodiquement pour voir les nouveaux commentaires
      const interval = setInterval(() => {
        loadCommentsCount();
      }, 5000); // Toutes les 5 secondes
      
      return () => clearInterval(interval);
    }
  }, [decisionId, loadCommentsCount]);

  // S'assurer que le bouton reste visible tant que le popover est ouvert
  useEffect(() => {
    if (isPopoverOpen) {
      setIsHovered(true);
    }
  }, [isPopoverOpen]);

  const handleCommentsChange = useCallback((hasComments: boolean, isAddingComment: boolean, count: number) => {
    setCommentsCount(count);
    // Recharger aussi pour s'assurer que le compteur est à jour
    if (decisionId) {
      loadCommentsCount();
    }
  }, [decisionId, loadCommentsCount]);

  if (!decisionId) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={sectionRef}
      className={`relative rounded-lg ${className}`}
      onMouseEnter={() => {
        // Annuler tout timeout de masquage quand on entre dans la section
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        // Annuler tout timeout précédent
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        
        // Ne JAMAIS cacher si le popover est ouvert
        if (isPopoverOpenRef.current) {
          return;
        }
        
        // Ne pas cacher si on survole le bouton ou le popover
        const relatedTarget = e.relatedTarget as Node;
        const isHoveringButton = buttonContainerRef.current?.contains(relatedTarget);
        const isHoveringPopover = popoverContentRef.current?.contains(relatedTarget);
        
        // Si on survole le bouton, ne JAMAIS cacher
        if (isHoveringButton) {
          return;
        }
        
        if (!isHoveringPopover) {
          // Délai plus long avant de cacher pour permettre de déplacer la souris vers le bouton et cliquer
          hideTimeoutRef.current = setTimeout(() => {
            // Vérifier avec le ref pour avoir la valeur à jour et s'assurer qu'on ne survole pas le bouton
            if (!isPopoverOpenRef.current && !buttonContainerRef.current?.matches(':hover')) {
              setIsHovered(false);
            }
          }, 800); // Augmenté à 800ms pour donner plus de temps
        }
      }}
    >
      {children}
      
      {/* Bouton flottant positionné en haut à gauche de la section */}
      {(isHovered || isPopoverOpen) && (
        <div 
          ref={buttonContainerRef}
          className="absolute top-0 left-0 z-50 -translate-x-full -translate-y-2"
          style={{
            marginLeft: '-0.5rem'
          }}
          onMouseEnter={() => {
            // Annuler tout timeout de masquage quand on survole le bouton
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
            setIsHovered(true);
          }}
          onMouseLeave={(e) => {
            // Annuler tout timeout précédent
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
            
            // Ne JAMAIS cacher si le popover est ouvert
            if (isPopoverOpenRef.current) {
              return;
            }
            
            // Ne pas cacher si on survole le popover
            const relatedTarget = e.relatedTarget as Node;
            const isHoveringPopover = popoverContentRef.current?.contains(relatedTarget);
            
            if (!isHoveringPopover) {
              // Délai plus long avant de cacher pour permettre de cliquer
              hideTimeoutRef.current = setTimeout(() => {
                // Vérifier avec le ref pour avoir la valeur à jour
                if (!isPopoverOpenRef.current) {
                  setIsHovered(false);
                }
              }, 800); // Augmenté à 800ms pour donner plus de temps
            }
          }}
        >
          <Popover open={isPopoverOpen} onOpenChange={(open) => {
            // Mettre à jour le ref immédiatement
            isPopoverOpenRef.current = open;
            
            // Annuler tout timeout de masquage
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
            
            setIsPopoverOpen(open);
            
            // TOUJOURS garder le bouton visible tant que le popover est ouvert
            if (open) {
              setIsHovered(true);
            } else {
              // Seulement cacher après un délai plus long quand le popover se ferme
              hideTimeoutRef.current = setTimeout(() => {
                // Vérifier avec le ref pour avoir la valeur à jour
                if (!isPopoverOpenRef.current) {
                  setIsHovered(false);
                }
              }, 1000); // Augmenté à 1000ms pour donner plus de temps après fermeture
            }
          }}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 backdrop-blur-sm shadow-md hover:bg-white border-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopoverOpen(true);
                  setIsHovered(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                {commentsCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 h-5 min-w-5 px-1.5 text-xs bg-blue-100 text-blue-700"
                  >
                    {commentsCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              ref={popoverContentRef}
              className="w-[500px] max-w-[90vw] max-h-[70vh] overflow-y-auto p-0"
              align="start"
              side="right"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                // Ne pas fermer si on clique sur le bouton
                if (buttonContainerRef.current?.contains(e.target as Node)) {
                  e.preventDefault();
                }
              }}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">{sectionTitle}</h3>
              </div>
              <div className="p-4">
                {decisionId && (
                  <CommentSection
                    decisionId={decisionId}
                    commentType="general"
                    stepContext={sectionId}
                    title={sectionTitle}
                    placeholder={`Ajouter un commentaire sur ${sectionTitle.toLowerCase()}...`}
                    onCommentsChange={handleCommentsChange}
                  />
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

