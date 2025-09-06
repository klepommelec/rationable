import { useI18nUI } from '@/contexts/I18nUIContext';

const Privacy = () => {
  const { t, getLocaleTag } = useI18nUI();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('privacy.lastUpdated')} : {new Date().toLocaleDateString(getLocaleTag())}
            </p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.dataCollection.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.dataCollection.description')}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t('privacy.sections.dataCollection.item1')}</li>
                <li>{t('privacy.sections.dataCollection.item2')}</li>
                <li>{t('privacy.sections.dataCollection.item3')}</li>
                <li>{t('privacy.sections.dataCollection.item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.dataUsage.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.dataUsage.description')}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t('privacy.sections.dataUsage.item1')}</li>
                <li>{t('privacy.sections.dataUsage.item2')}</li>
                <li>{t('privacy.sections.dataUsage.item3')}</li>
                <li>{t('privacy.sections.dataUsage.item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.dataSharing.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.dataSharing.description')}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t('privacy.sections.dataSharing.item1')}</li>
                <li>{t('privacy.sections.dataSharing.item2')}</li>
                <li>{t('privacy.sections.dataSharing.item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.security.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.security.description')}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t('privacy.sections.security.item1')}</li>
                <li>{t('privacy.sections.security.item2')}</li>
                <li>{t('privacy.sections.security.item3')}</li>
                <li>{t('privacy.sections.security.item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.rights.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.rights.description')}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t('privacy.sections.rights.item1')}</li>
                <li>{t('privacy.sections.rights.item2')}</li>
                <li>{t('privacy.sections.rights.item3')}</li>
                <li>{t('privacy.sections.rights.item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.cookies.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.cookies.description')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.retention.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.retention.description')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.contact.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.contact.description')}
              </p>
              <p className="text-primary font-medium">
                Email : {t('privacy.sections.contact.email')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('privacy.sections.changes.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.sections.changes.description')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;