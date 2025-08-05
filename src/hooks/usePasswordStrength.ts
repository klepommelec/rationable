import { useState, useEffect } from 'react';

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export const usePasswordStrength = (password: string): PasswordStrength => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false
  });

  useEffect(() => {
    const calculateStrength = (pwd: string): PasswordStrength => {
      if (!pwd) {
        return {
          score: 0,
          feedback: ['Password is required'],
          isValid: false
        };
      }

      let score = 0;
      const feedback: string[] = [];

      // Length check
      if (pwd.length >= 8) {
        score += 1;
      } else {
        feedback.push('Password must be at least 8 characters long');
      }

      // Uppercase check
      if (/[A-Z]/.test(pwd)) {
        score += 1;
      } else {
        feedback.push('Add uppercase letters');
      }

      // Lowercase check
      if (/[a-z]/.test(pwd)) {
        score += 1;
      } else {
        feedback.push('Add lowercase letters');
      }

      // Number check
      if (/\d/.test(pwd)) {
        score += 1;
      } else {
        feedback.push('Add numbers');
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
        score += 1;
      } else {
        feedback.push('Add special characters');
      }

      // Bonus for length
      if (pwd.length >= 12) {
        score += 1;
      }

      // Common patterns penalty
      if (/(.)\1{2,}/.test(pwd)) {
        score -= 1;
        feedback.push('Avoid repeated characters');
      }

      if (/123|abc|password|qwerty/i.test(pwd)) {
        score -= 1;
        feedback.push('Avoid common patterns');
      }

      const finalScore = Math.max(0, Math.min(4, score));
      const isValid = finalScore >= 3 && pwd.length >= 8;

      if (feedback.length === 0) {
        if (finalScore === 4) {
          feedback.push('Strong password!');
        } else if (finalScore === 3) {
          feedback.push('Good password');
        }
      }

      return {
        score: finalScore,
        feedback,
        isValid
      };
    };

    setStrength(calculateStrength(password));
  }, [password]);

  return strength;
};