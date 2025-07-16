
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AnimatedPlaceholderProps {
  placeholders?: string[];
  interval?: number;
}

export const AnimatedPlaceholder: React.FC<AnimatedPlaceholderProps> = ({
  placeholders,
  interval = 3000
}) => {
  const { profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const personalPlaceholders = [
    "Choisir mon prochain smartphone",
    "Planifier mes vacances d'été",
    "Décider de mon prochain investissement",
    "Choisir ma nouvelle voiture",
    "Sélectionner une formation personnelle"
  ];

  const professionalPlaceholders = [
    "Choisir notre stack technique",
    "Définir notre stratégie marketing Q2",
    "Sélectionner un nouveau fournisseur",
    "Planifier notre roadmap produit",
    "Décider de notre stratégie de recrutement"
  ];

  const contextPlaceholders = profile?.use_context === 'professional' 
    ? professionalPlaceholders 
    : personalPlaceholders;

  const finalPlaceholders = placeholders || contextPlaceholders;

  useEffect(() => {
    if (finalPlaceholders.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % finalPlaceholders.length
        );
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [finalPlaceholders.length, interval]);

  return (
    <span 
      className={`transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-50'
      }`}
    >
      {finalPlaceholders[currentIndex]}
    </span>
  );
};
