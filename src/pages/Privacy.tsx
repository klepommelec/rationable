import { useI18nUI } from '@/contexts/I18nUIContext';

const Privacy = () => {
  const { t } = useI18nUI();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
            <p className="text-muted-foreground text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Collecte des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Rationable collecte uniquement les données nécessaires au fonctionnement de l'application :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Adresse email (pour l'authentification)</li>
                <li>Nom d'utilisateur (pour personnaliser l'expérience)</li>
                <li>Décisions et analyses créées (stockées de manière sécurisée)</li>
                <li>Données d'usage anonymisées (pour améliorer le service)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Utilisation des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Fournir nos services d'aide à la décision</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Améliorer nos services (données anonymisées)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Partage des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Rationable ne partage jamais vos données personnelles avec des tiers, sauf :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour se conformer à des obligations légales</li>
                <li>Pour protéger nos droits et la sécurité des utilisateurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Sécurité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des mesures de sécurité industry-standard pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Chiffrement en transit et au repos</li>
                <li>Authentification sécurisée via Supabase</li>
                <li>Accès limité aux données par notre équipe</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Vos Droits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au RGPD, vous avez le droit de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier ou supprimer vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies et Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Rationable utilise des cookies techniques nécessaires au fonctionnement de l'application et des cookies d'analyse anonymisés pour améliorer nos services. Aucun cookie publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Conservation des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont conservées aussi longtemps que votre compte est actif. Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant cette politique de confidentialité, contactez-nous à :
              </p>
              <p className="text-primary font-medium">
                Email : contact@rationable.fr
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cette politique peut être mise à jour occasionnellement. Les changements significatifs vous seront notifiés par email ou via l'application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;