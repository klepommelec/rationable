
import { useI18nUI } from '@/contexts/I18nUIContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useI18nUI();
  
  return (
    <footer className="border-t">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rationable. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a 
              href="/privacy" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.privacyPolicy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
