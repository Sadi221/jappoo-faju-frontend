import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-12 space-y-8">

          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Politique de confidentialité</h1>
            <p className="text-slate-500 text-sm">Version 1.0 — Dernière mise à jour : Mai 2026</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
            <strong>JAPPOO FAJU</strong> est une initiative de l'association{' '}
            <strong>Développement Solidaire et Santé (DSS)</strong>, association française loi 1901,
            engagée dans l'amélioration de l'accès aux soins en Afrique de l'Ouest.{' '}
            <a href="https://www.dss-france.org" target="_blank" rel="noopener noreferrer" className="underline font-semibold">www.dss-france.org</a>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">1. Responsable du traitement</h2>
            <p className="text-slate-600 leading-relaxed">Le responsable du traitement des données collectées via la plateforme JAPPOO FAJU est :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Association :</strong> Développement Solidaire &amp; Santé (DSS)</li>
              <li><strong>Représentant légal :</strong> Cheikh Mbaye</li>
              <li><strong>Adresse :</strong> SC MBAYE, 8 rue du Cirque, 75008 Paris, France</li>
              <li><strong>Email :</strong> <a href="mailto:cmbaye@dss-france.org" className="text-blue-600 hover:underline">cmbaye@dss-france.org</a></li>
              <li><strong>Site :</strong> <a href="https://jappoo-faju.org" className="text-blue-600 hover:underline">jappoo-faju.org</a></li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              DSS est soumise au <strong>Règlement Général sur la Protection des Données (RGPD — UE 2016/679)</strong> et,
              pour ses activités au Sénégal, à la <strong>loi n° 2008-12 du 25 janvier 2008</strong> sur la protection des données à caractère personnel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">2. Données collectées</h2>
            <p className="text-slate-600 leading-relaxed">Dans le cadre de l'utilisation de la plateforme JAPPOO FAJU, nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Donateurs :</strong> nom, prénom, adresse e-mail, numéro de téléphone, données de paiement (traitées par Stripe ou Wave), historique des dons</li>
              <li><strong>Agents hospitaliers :</strong> nom, prénom, email professionnel, téléphone professionnel, hôpital d'appartenance</li>
              <li><strong>Patients :</strong> pseudonyme uniquement (ex : Patient DK-2026-045), type de besoin médical, copies anonymisées de prescriptions fournies par les services sociaux hospitaliers</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages consultées (via logs serveur)</li>
            </ul>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
              <strong>Anonymisation des patients :</strong> Les données d'identification réelles des patients restent
              exclusivement dans les systèmes d'information des hôpitaux partenaires. DSS n'y a pas accès.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">3. Finalités du traitement</h2>
            <p className="text-slate-600 leading-relaxed">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Gérer votre compte utilisateur et l'accès à la plateforme</li>
              <li>Traiter et suivre vos dons</li>
              <li>Vous envoyer des confirmations de paiement et reçus de don</li>
              <li>Publier des demandes de financement médical anonymisées</li>
              <li>Assurer la sécurité et le bon fonctionnement de la plateforme</li>
              <li>Respecter nos obligations légales et comptables</li>
              <li>Communiquer sur l'impact des dons (rapports anonymisés)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">4. Base légale du traitement</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Exécution du contrat :</strong> gestion des dons et des comptes</li>
              <li><strong>Consentement explicite :</strong> communications marketing, publication de rapports d'impact</li>
              <li><strong>Intérêt légitime :</strong> sécurité de la plateforme, prévention des abus</li>
              <li><strong>Obligation légale :</strong> obligations comptables et fiscales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">5. Destinataires des données</h2>
            <p className="text-slate-600 leading-relaxed">Vos données peuvent être traitées par les sous-traitants suivants :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Stripe Inc.</strong> : paiements par carte bancaire (Europe, Amériques, Asie)</li>
              <li><strong>Wave</strong> : paiements mobile money (Afrique de l'Ouest)</li>
              <li><strong>Railway</strong> : hébergement du backend (serveurs en Europe)</li>
              <li><strong>Vercel</strong> : hébergement du frontend (CDN mondial)</li>
            </ul>
            <p className="text-slate-600 font-medium">Aucune donnée personnelle n'est vendue, louée ou cédée à des tiers à des fins commerciales.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">6. Transferts internationaux</h2>
            <p className="text-slate-600 leading-relaxed">
              Dans le cadre de ses activités entre la France et le Sénégal, DSS peut transférer des données vers des pays tiers.
              Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne (RGPD) et la loi sénégalaise n° 2008-12
              et les directives de la <strong>Commission de Protection des Données personnelles (CDP) du Sénégal</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">7. Durée de conservation</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Données de compte : durée du compte + 3 ans après clôture</li>
              <li>Données de paiement : 5 ans (obligation légale comptable)</li>
              <li>Prescriptions anonymisées : durée de la campagne + 1 an</li>
              <li>Logs de connexion : 12 mois (sécurité)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">8. Vos droits</h2>
            <p className="text-slate-600 leading-relaxed">Conformément au RGPD et à la loi sénégalaise 2008-12, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
              <li><strong>Droit à la limitation :</strong> restreindre le traitement</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Pour exercer ces droits :{' '}
              <a href="mailto:cmbaye@dss-france.org" className="text-blue-600 hover:underline">cmbaye@dss-france.org</a>
            </p>
            <p className="text-slate-600 leading-relaxed">
              Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (France) :{' '}
              <span className="text-blue-600">www.cnil.fr</span> ou auprès de la <strong>CDP</strong> (Sénégal)
              pour les traitements relatifs à des résidents sénégalais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">9. Sécurité des données</h2>
            <p className="text-slate-600 leading-relaxed">Nous mettons en œuvre les mesures techniques suivantes :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Chiffrement des communications (HTTPS / TLS 1.3)</li>
              <li>Hachage des mots de passe (bcrypt)</li>
              <li>Authentification par token JWT à durée limitée</li>
              <li>Limitation du nombre de tentatives de connexion (protection brute force)</li>
              <li>Accès aux données restreint par rôle (donateur, agent hospitalier, administrateur)</li>
              <li>Aucune interface d'administration publiquement accessible</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">10. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              JAPPOO FAJU utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              de la plateforme (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">11. Modifications</h2>
            <p className="text-slate-600 leading-relaxed">
              Cette politique peut être mise à jour. En cas de modification substantielle, les utilisateurs
              seront informés par email au moins 30 jours avant l'entrée en vigueur. La date de dernière
              mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Contact RGPD :{' '}
              <a href="mailto:cmbaye@dss-france.org" className="text-blue-600 hover:underline font-medium">cmbaye@dss-france.org</a>
              {' '}·{' '}DSS, 8 rue du Cirque, 75008 Paris, France
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;