import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthForm from '@/components/AuthForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup';
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  open, 
  onOpenChange, 
  defaultTab = 'signin',
  onSuccess 
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AuthForm
          onSuccess={handleSuccess}
          defaultTab={defaultTab}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;