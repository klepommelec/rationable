import { User, Lightbulb, Bell, Shield, Database, LogOut, Building2, FileText, Settings, Users } from 'lucide-react';
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
  id: 'workspaces',
  label: t('settings.sidebar.workspaces'),
  icon: Building2
}, {
  id: 'members',
  label: 'Membres',
  icon: Users
}, {
  id: 'appearance',
  label: t('settings.sidebar.appearance'),
  icon: Lightbulb
}, {
  id: 'documents',
  label: t('settings.sidebar.documents'),
  icon: FileText
}, {
  id: 'admin',
  label: t('settings.sidebar.admin'),
  icon: Settings
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
      <div className="flex-1 p-6 px-3 pr-4 py-[12px]">
        <nav className="">
          {settingsSections.map(section => {
          const Icon = section.icon;
          return <button key={section.id} onClick={() => onSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium", activeSection === section.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>;
        })}
        </nav>
      </div>
      
      <div className="p-6 px-3 pr-4 border-sidebar-border">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
          <LogOut className="h-4 w-4" />
          <span>{t('auth.signOut')}</span>
        </button>
      </div>
    </div>;
};
export default SettingsSidebar;