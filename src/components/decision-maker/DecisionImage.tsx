
import React from 'react';

interface DecisionImageProps {
  imageQuery?: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  option?: string;
  dilemma?: string;
  index?: number;
}

// Composant désactivé - ne rend rien pour économiser les crédits
export const DecisionImage: React.FC<DecisionImageProps> = () => {
  // Génération d'images désactivée pour économiser les crédits
  return null;
};
