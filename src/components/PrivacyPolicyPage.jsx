import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={18} fill="white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              JAPPOO FAJU
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-12 space-y-8">

          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Politique de confidentialité</h1>
            <p className="text-slate-500 text-sm">Dernière mise à jour : 1er avril 2026</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
            <strong>JAPPOO FAJU</strong> est une initiative de l'association <strong>Développement Solidaire et Santé (DSS)</strong>,
            association française loi 1901, engagée dans l'amélioration de l'accès aux soins en Afrique de l'Ouest.{' '}
            <a href="https://www.dss-france.org" target="_blank" rel="noopener noreferrer" className="underline font-semibold">www.dss-france.org</a>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">1. Responsable du traitement</h2>
            <p className="text-slate-600 leading-relaxed">
              Le responsable du traitement des données collectées via la plateforme JAPPOO FAJU est l'association
              <strong> Développement Solidaire et Santé (DSS)</strong>, dont le siège social est situé en France.
            </p>
            <p className="text-slate-600">
              Contact : <a href="mailto:contact@jappoofaju.org" className="text-blue-600 hover:underline">contact@jappoofaju.org</a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">2. Données collectées</h2>
            <p className="text-slate-600 leading-relaxed">Dans le cadre de l'utilisation de la plateforme JAPPOO FAJU, nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Donateurs :</strong> adresse e-mail, prénom (optionnel), historique des dons</li>
              <li><strong>Hôpitaux et agents :</strong> adresse e-mail, nom de l'établissement, documents médicaux justificatifs</li>
              <li><strong>Paiements :</strong> transactions Wave Money (numéro de téléphone via Wave), montants, statuts</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages consultées (via logs serveur)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Les données des patients sont strictement pseudonymisées. Aucune information permettant d'identifier
              directement un patient n'est publiée sur la plateforme.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">3. Finalités du traitement</h2>
            <p className="text-slate-600 leading-relaxed">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Gérer votre compte utilisateur et l'accès à la plateforme</li>
              <li>Traiter et suivre vos dons</li>
              <li>Vous envoyer des confirmations de paiement et reçus de don par e-mail</li>
              <li>Vérifier l'authenticité des demandes médicales publiées</li>
              <li>Assurer la sécurité et le bon fonctionnement de la plateforme</li>
              <li>Répondre à vos demandes de support</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">4. Base légale du traitement</h2>
            <p className="text-slate-600 leading-relaxed">
              Le traitement de vos données repose sur les bases légales suivantes (RGPD) :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Exécution du contrat</strong> : traitement des dons, gestion des comptes</li>
              <li><strong>Intérêt légitime</strong> : sécurité de la plateforme, lutte contre la fraude</li>
              <li><strong>Consentement</strong> : communications optionnelles par e-mail</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">5. Destinataires des données</h2>
            <p className="text-slate-600 leading-relaxed">Vos données peuvent être partagées avec :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Wave</strong> : prestataire de paiement mobile (traitement des transactions)</li>
              <li><strong>Resend</strong> : prestataire d'envoi d'e-mails transactionnels</li>
              <li><strong>Railway</strong> : hébergeur du backend (serveurs en Europe/USA)</li>
              <li><strong>Vercel</strong> : hébergeur du frontend (CDN mondial)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Ces prestataires sont contractuellement engagés à protéger vos données conformément au RGPD.
              Aucune donnée personnelle n'est vendue à des tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">6. Durée de conservation</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Données de compte : conservées tant que le compte est actif + 3 ans après suppression</li>
              <li>Données de transaction : 10 ans (obligation légale comptable)</li>
              <li>Logs de navigation : 12 mois maximum</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">7. Vos droits</h2>
            <p className="text-slate-600 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : supprimer vos données (sous réserve des obligations légales)</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
              <li><strong>Droit à la limitation</strong> : limiter temporairement le traitement</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:contact@jappoofaju.org" className="text-blue-600 hover:underline">contact@jappoofaju.org</a>.
              Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de
              l'Informatique et des Libertés) : <span className="text-blue-600">www.cnil.fr</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">8. Sécurité</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement HTTPS, mots de passe hashés (bcrypt), accès restreints aux données sensibles, sauvegardes régulières.
              Les paiements sont traités exclusivement par Wave — nous ne stockons jamais vos coordonnées bancaires.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">9. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              JAPPOO FAJU utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              de la plateforme (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">10. Modifications</h2>
            <p className="text-slate-600 leading-relaxed">
              Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée par e-mail
              ou via une bannière sur la plateforme. La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Pour toute question : <a href="mailto:contact@jappoofaju.org" className="text-blue-600 hover:underline font-medium">contact@jappoofaju.org</a>
              {' '}·{' '}+221 78 376 70 08{' '}·{' '}Dakar, Sénégal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
