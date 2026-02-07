
import { useState } from 'react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Import direct des composants de settings (lazy loading désactivé temporairement)
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountsSettings from '@/components/settings/AccountsSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import WorkspacesSettings from '@/components/settings/WorkspacesSettings';
import MembersSettings from '@/components/settings/MembersSettings';
import DocumentsSettings from '@/components/settings/DocumentsSettings';
import AdminSettings from '@/components/settings/AdminSettings';
import AnalysisUsageSettings from '@/components/settings/AnalysisUsageSettings';
import { RealTimeSearchSettings } from '@/components/settings/RealTimeSearchSettings';
import { useRealTimeSearchSettings } from '@/hooks/useRealTimeSearchSettings';

const RealTimeSearchSettingsWrapper = () => {
  const { realTimeSearchEnabled, setRealTimeSearchEnabled } = useRealTimeSearchSettings();
  return (
    <RealTimeSearchSettings
      realTimeSearchEnabled={realTimeSearchEnabled}
      onToggle={setRealTimeSearchEnabled}
    />
  );
};

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] = useState(false);
  const { currentWorkspace, createWorkspace, refreshWorkspaces } = useWorkspaces();
  const { user } = useAuth();
  const { t } = useI18nUI();

  const handleCreateWorkspace = async (name: string, description?: string, image?: File) => {
    try {
      // Créer le workspace d'abord
      const workspace = await createWorkspace(name, description);
      
      // Si une image est fournie, l'uploader
      if (image && workspace) {
        const fileExt = image.name.split('.').pop();
        const fileName = `workspace-${workspace.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        let bucketName = 'workspace-images';
        let uploadError;

        // Essayer d'abord le bucket workspace-images
        const { error: workspaceImagesError } = await supabase.storage
          .from('workspace-images')
          .upload(filePath, image);

        if (workspaceImagesError) {
          console.log('workspace-images bucket not available, using avatars bucket');
          bucketName = 'avatars';
          const { error: avatarsError } = await supabase.storage
            .from('avatars')
            .upload(filePath, image);
          uploadError = avatarsError;
        } else {
          uploadError = workspaceImagesError;
        }

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        }

        // Mettre à jour l'URL de l'image
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const { error: imageError } = await supabase
          .from('workspaces')
          .update({ image_url: publicUrl })
          .eq('id', workspace.id)
          .eq('user_id', user?.id);

        if (imageError) {
          console.error('Database update error:', imageError);
          throw new Error(`Erreur de mise à jour: ${imageError.message}`);
        }
      }

      await refreshWorkspaces();
      toast.success(t('workspaces.createSuccess', { name }));
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(t('workspaces.createError'));
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'accounts':
        return <AccountsSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'members':
        return <MembersSettings />;
      case 'documents':
        return <DocumentsSettings />;
          case 'preferences':
            return (
              <div className="space-y-6">
                <AppearanceSettings />
                <RealTimeSearchSettingsWrapper />
              </div>
            );
      case 'usage':
        return <AnalysisUsageSettings />;
      case 'admin':
        return <AdminSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const getSectionTitle = () => {
        const titleKeys = {
          profile: 'settings.sidebar.profile',
          accounts: 'settings.sidebar.accounts',
          workspaces: 'settings.sidebar.workspaces',
          members: 'Membres',
          documents: 'settings.sidebar.documents',
          preferences: 'settings.sidebar.preferences',
          usage: 'Usage & coût',
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{getSectionTitle()}</h1>
                <p className="text-muted-foreground">
                  {t('settings.header.subtitle')}
                </p>
              </div>
                  {activeSection === 'workspaces' && (
                    <Button variant="outline" onClick={() => setShowCreateWorkspaceDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('workspaces.createNew')}
                    </Button>
                  )}
            </div>
          </div>
          
          {renderActiveSection()}
        </div>
      </div>

      <CreateWorkspaceDialog
        open={showCreateWorkspaceDialog}
        onOpenChange={setShowCreateWorkspaceDialog}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
};

export default Settings;
