
import { useState } from 'react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { useI18nUI } from '@/contexts/I18nUIContext';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import { WorkspacesSettings } from '@/components/settings/WorkspacesSettings';
import { MembersSettings } from '@/components/settings/MembersSettings';
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
      case 'members':
        return <MembersSettings />;
      case 'documents':
        return currentWorkspace ? <DocumentsSettings workspaceId={currentWorkspace.id} /> : <div>{t('settings.header.selectWorkspace')}</div>;
      case 'appearance':
        return <AppearanceSettings />;
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
      members: 'Membres',
      documents: 'settings.sidebar.documents',
      appearance: 'settings.sidebar.appearance',
      admin: 'settings.sidebar.admin'
    };
    const titleKey = titleKeys[activeSection as keyof typeof titleKeys];
    return titleKey ? (titleKey.startsWith('settings.') ? t(titleKey) : titleKey) : t('settings.sidebar.profile');
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
