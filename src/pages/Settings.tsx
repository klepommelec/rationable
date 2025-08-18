
import { useState } from 'react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { useI18nUI } from '@/contexts/I18nUIContext';
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
  const { t } = useI18nUI();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'documents':
        return currentWorkspace ? <DocumentsSettings workspaceId={currentWorkspace.id} /> : <div>{t('settings.header.selectWorkspace')}</div>;
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
    const titleKeys = {
      profile: 'settings.sidebar.profile',
      workspaces: 'settings.sidebar.workspaces',
      documents: 'settings.sidebar.documents',
      appearance: 'settings.sidebar.appearance',
      notifications: 'settings.sidebar.notifications',
      preferences: 'settings.sidebar.preferences',
      data: 'settings.sidebar.data',
      admin: 'settings.sidebar.admin'
    };
    const titleKey = titleKeys[activeSection as keyof typeof titleKeys];
    return titleKey ? t(titleKey) : t('settings.sidebar.profile');
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
              {t('settings.header.subtitle')}
            </p>
          </div>
          
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
