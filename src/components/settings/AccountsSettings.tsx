import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18nUI } from '@/contexts/I18nUIContext';
import GoogleAccountSettings from './GoogleAccountSettings';

const AccountsSettings = () => {
  const { t } = useI18nUI();

  return (
    <div className="space-y-6">
      {/* Section Compte Google */}
      <GoogleAccountSettings />
    </div>
  );
};

export default AccountsSettings;
