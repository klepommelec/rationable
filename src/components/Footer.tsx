import { useI18nUI } from '@/contexts/I18nUIContext';
import { Link } from 'react-router-dom';
const Footer = () => {
  const {
    t
  } = useI18nUI();
  return <footer className="border-t">
      <div className="px-[20px] py-[15px]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable" className="h-6 w-6 rounded-none" />
            <span className="text-gray-900 font-semibold text-lg">Rationable</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/templates" className="text-muted-foreground hover:text-primary transition-colors">
              {t('navbar.templates')}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;