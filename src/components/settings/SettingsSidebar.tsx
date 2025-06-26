
import { User, Lightbulb, Bell, Shield, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const settingsSections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'appearance', label: 'Apparence', icon: Lightbulb },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Préférences', icon: Shield },
  { id: 'data', label: 'Gestion des données', icon: Database },
];

const SettingsSidebar = ({ activeSection, onSectionChange }: SettingsSidebarProps) => {
  return (
    <div className="w-64 bg-muted/20 border-r p-6">
      <nav className="space-y-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
