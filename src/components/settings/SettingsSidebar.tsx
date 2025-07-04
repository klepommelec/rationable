import { User, Lightbulb, Bell, Shield, Database, LogOut } from 'lucide-react';
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
  const {
    signOut
  } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  return <div className="w-64 border-r bg-white flex flex-col h-full">
      <div className="flex-1 p-6 px-3 pr-4 bg-inherit">
        <nav className="space-y-1">
          {settingsSections.map(section => {
          const Icon = section.icon;
          return <button key={section.id} onClick={() => onSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium", activeSection === section.id ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>;
        })}
        </nav>
      </div>
      
      <div className="p-6 px-3 pr-4 border-t">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>;
};
export default SettingsSidebar;