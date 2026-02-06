import { LogOut, User, Settings, Building2, Users, FileText, Shield, Cog, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useI18nUI } from '@/contexts/I18nUIContext';
interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}
const getSettingsSections = (t: (key: string) => string) => [{
  id: 'profile',
  label: t('settings.sidebar.profile'),
  icon: User
}, {
  id: 'accounts',
  label: t('settings.sidebar.accounts'),
  icon: Shield
}, {
  id: 'preferences',
  label: t('settings.sidebar.preferences'),
  icon: Settings
}, {
  id: 'workspaces',
  label: t('settings.sidebar.workspaces'),
  icon: Building2
}, {
  id: 'members',
  label: t('settings.sidebar.members'),
  icon: Users
}, {
  id: 'documents',
  label: t('settings.sidebar.documents'),
  icon: FileText
}, {
  id: 'usage',
  label: 'Usage & coût',
  icon: BarChart3
}, {
  id: 'admin',
  label: t('settings.sidebar.admin'),
  icon: Cog
}];
const SettingsSidebar = ({
  activeSection,
  onSectionChange
}: SettingsSidebarProps) => {
  const {
    signOut
  } = useAuth();
  const {
    t
  } = useI18nUI();
  const settingsSections = getSettingsSections(t);
  const handleSignOut = async () => {
    await signOut();
  };
  return <div className="w-64 border-r bg-sidebar border-sidebar-border flex flex-col h-full">
      <div className="flex-1 p-6 pr-4 py-[12px] px-[16px]">
        <nav className="space-y-4">
          {/* Section Personal */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-2 pl-2">
              {t('settings.sidebar.personal')}
            </h3>
            <div className="space-y-0.5">
                  {settingsSections.filter(section => ['profile', 'accounts', 'preferences'].includes(section.id)).map(section => {
                const IconComponent = section.icon;
                return <button key={section.id} onClick={() => onSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-3 h-8 text-left rounded-lg transition-colors text-sm font-medium", activeSection === section.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
                      <IconComponent className="h-4 w-4" />
                      <span>{section.label}</span>
                    </button>;
              })}
            </div>
          </div>

          {/* Section Organization */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-2 pl-2">
              {t('settings.sidebar.organization')}
            </h3>
            <div className="space-y-0.5">
              {settingsSections.filter(section => ['workspaces', 'members', 'documents'].includes(section.id)).map(section => {
                const IconComponent = section.icon;
                return <button key={section.id} onClick={() => onSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-3 h-8 text-left rounded-lg transition-colors text-sm font-medium", activeSection === section.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
                      <IconComponent className="h-4 w-4" />
                      <span>{section.label}</span>
                    </button>;
              })}
            </div>
          </div>

          {/* Section Admin */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-2 pl-2">
              {t('settings.sidebar.system')}
            </h3>
            <div className="space-y-0.5">
              {settingsSections.filter(section => ['usage', 'admin'].includes(section.id)).map(section => {
                const IconComponent = section.icon;
                return <button key={section.id} onClick={() => onSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-3 h-8 text-left rounded-lg transition-colors text-sm font-medium", activeSection === section.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
                      <IconComponent className="h-4 w-4" />
                      <span>{section.label}</span>
                    </button>;
              })}
            </div>
          </div>
        </nav>
      </div>
      
      <div className="p-6 px-3 pr-4 border-sidebar-border">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 h-8 text-left rounded-lg transition-colors text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
          <LogOut className="h-4 w-4" />
          <span>{t('auth.signOut')}</span>
        </button>
      </div>
    </div>;
};
export default SettingsSidebar;