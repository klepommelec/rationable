
import { useState } from 'react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppPreferencesSettings from '@/components/settings/AppPreferencesSettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import { WorkspacesSettings } from '@/components/settings/WorkspacesSettings';
import DocumentsSettings from '@/components/workspace/DocumentsSettings';
import AdminSettings from '@/components/settings/AdminSettings';
import { useWorkspaces } from '@/hooks/useWorkspaces';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const { currentWorkspace } = useWorkspaces();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'documents':
        return currentWorkspace ? <DocumentsSettings workspaceId={currentWorkspace.id} /> : <div>Sélectionnez un workspace</div>;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'preferences':
        return <AppPreferencesSettings />;
      case 'data':
        return <DataManagementSettings />;
      case 'admin':
        return <AdminSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      profile: 'Profil',
      workspaces: 'Workspaces',
      documents: 'Documents',
      appearance: 'Apparence',
      notifications: 'Notifications',
      preferences: 'Préférences de l\'application',
      data: 'Gestion des données',
      admin: 'Administration'
    };
    return titles[activeSection as keyof typeof titles] || 'Paramètres';
  };

  return (
    <div className="flex h-screen">
      <SettingsSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 overflow-y-auto max-h-screen">
        <div className="p-6 max-w-4xl pb-12">
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
