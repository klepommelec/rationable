
import { useState } from 'react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppPreferencesSettings from '@/components/settings/AppPreferencesSettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'preferences':
        return <AppPreferencesSettings />;
      case 'data':
        return <DataManagementSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      profile: 'Profil',
      appearance: 'Apparence',
      notifications: 'Notifications',
      preferences: 'Préférences de l\'application',
      data: 'Gestion des données'
    };
    return titles[activeSection as keyof typeof titles] || 'Paramètres';
  };

  return (
    <div className="flex min-h-screen border-t">
      <SettingsSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{getSectionTitle()}</h1>
            <p className="text-muted-foreground">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
