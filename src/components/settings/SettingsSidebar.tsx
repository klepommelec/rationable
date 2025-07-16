
import { User, Lightbulb, Bell, Shield, Database, LogOut, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const settingsSections = [{
  id: 'profile',
  label: 'Profil',
  icon: User
}, {
  id: 'workspaces',
  label: 'Workspaces',
  icon: Building2
}, {
  id: 'appearance',
  label: 'Apparence',
  icon: Lightbulb
}, {
  id: 'notifications',
  label: 'Notifications',
  icon: Bell
}, {
  id: 'preferences',
  label: 'Préférences',
  icon: Shield
}, {
  id: 'data',
  label: 'Gestion des données',
  icon: Database
}];

const SettingsSidebar = ({
  activeSection,
  onSectionChange
}: SettingsSidebarProps) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 border-r bg-sidebar border-sidebar-border flex flex-col h-full">
      <div className="flex-1 p-6 px-3 pr-4">
        <nav className="space-y-1">
          {settingsSections.map(section => {
            const Icon = section.icon;
            return (
              <button 
                key={section.id} 
                onClick={() => onSectionChange(section.id)} 
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium",
                  activeSection === section.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
