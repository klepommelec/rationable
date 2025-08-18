
import { useI18nUI } from '@/contexts/I18nUIContext';

const Footer = () => {
  const { t } = useI18nUI();
  
  return (
    <footer className="border-t">
      <div className="container py-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rationable. {t('footer.allRightsReserved')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
