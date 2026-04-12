// Traductions FR/EN pour Jappoo Faju
export const translations = {
  fr: {
    // Navbar
    nav_home: 'Accueil',
    nav_about: 'Notre impact',
    nav_login: 'Connexion',
    nav_signup: 'S\'inscrire',

    // Hero
    hero_badge: 'Solidarité médicale instantanée',
    hero_title_1: 'Chaque vie mérite',
    hero_title_2: 'd\'être sauvée',
    hero_subtitle: 'Connectez-vous aux patients sénégalais qui ont besoin d\'une aide médicale urgente. Votre don, aussi petit soit-il, peut changer une vie.',
    hero_cta_donate: 'Faire un don maintenant',
    hero_cta_cases: 'Voir les cas urgents',
    hero_cta_hospital: 'Vous êtes un hôpital ?',
    hero_stat_raised: 'Collectés',
    hero_stat_patients: 'Patients aidés',
    hero_stat_hospitals: 'Hôpitaux partenaires',
    hero_stat_donors: 'Donateurs actifs',

    // Cases section
    cases_title: 'Cas urgents',
    cases_subtitle: 'Ces patients ont besoin de votre aide maintenant',
    cases_filter_all: 'Tous',
    cases_donate_btn: 'Faire un don',
    cases_days_left: 'jours restants',
    cases_collected: 'collectés',
    cases_goal: 'objectif',
    cases_no_results: 'Aucun cas pour ce filtre.',
    cases_loading: 'Chargement...',

    // Impact section
    impact_title: 'Notre impact',
    impact_subtitle: 'Ensemble, nous faisons la différence',

    // How it works
    how_title: 'Comment ça marche ?',
    how_step1_title: 'Choisissez un cas',
    how_step1_desc: 'Parcourez les demandes validées par nos équipes médicales partenaires.',
    how_step2_title: 'Faites un don',
    how_step2_desc: 'Donnez via Wave, Orange Money ou carte bancaire en quelques secondes.',
    how_step3_title: 'Sauvez une vie',
    how_step3_desc: 'Votre don est directement utilisé pour les soins du patient.',

    // CTA
    cta_title: 'Rejoignez le mouvement',
    cta_subtitle: 'Des milliers de Sénégalais comptent sur votre générosité.',
    cta_btn: 'Commencer à donner',

    // Footer
    footer_rights: 'Tous droits réservés',
    footer_privacy: 'Politique de confidentialité',
    footer_org: 'Une initiative de',

    // Urgency labels
    urgency_critical: 'Critique',
    urgency_high: 'Élevé',
    urgency_medium: 'Moyen',
    urgency_low: 'Faible',

    // Medical need labels
    need_surgery: 'Chirurgie',
    need_medication: 'Médicaments',
    need_exam: 'Examens',
    need_kit: 'Kit médical',
    need_dialysis: 'Dialyse',
    need_other: 'Autre',
  },

  en: {
    // Navbar
    nav_home: 'Home',
    nav_about: 'Our impact',
    nav_login: 'Login',
    nav_signup: 'Sign up',

    // Hero
    hero_badge: 'Instant medical solidarity',
    hero_title_1: 'Every life deserves',
    hero_title_2: 'to be saved',
    hero_subtitle: 'Connect with Senegalese patients in urgent need of medical help. Your donation, no matter how small, can change a life.',
    hero_cta_donate: 'Donate now',
    hero_cta_cases: 'See urgent cases',
    hero_cta_hospital: 'Are you a hospital?',
    hero_stat_raised: 'Raised',
    hero_stat_patients: 'Patients helped',
    hero_stat_hospitals: 'Partner hospitals',
    hero_stat_donors: 'Active donors',

    // Cases section
    cases_title: 'Urgent cases',
    cases_subtitle: 'These patients need your help now',
    cases_filter_all: 'All',
    cases_donate_btn: 'Donate',
    cases_days_left: 'days left',
    cases_collected: 'raised',
    cases_goal: 'goal',
    cases_no_results: 'No cases for this filter.',
    cases_loading: 'Loading...',

    // Impact section
    impact_title: 'Our impact',
    impact_subtitle: 'Together, we make a difference',

    // How it works
    how_title: 'How does it work?',
    how_step1_title: 'Choose a case',
    how_step1_desc: 'Browse requests validated by our partner medical teams.',
    how_step2_title: 'Make a donation',
    how_step2_desc: 'Give via Wave, Orange Money or bank card in seconds.',
    how_step3_title: 'Save a life',
    how_step3_desc: 'Your donation is directly used for the patient\'s care.',

    // CTA
    cta_title: 'Join the movement',
    cta_subtitle: 'Thousands of Senegalese people count on your generosity.',
    cta_btn: 'Start giving',

    // Footer
    footer_rights: 'All rights reserved',
    footer_privacy: 'Privacy Policy',
    footer_org: 'An initiative by',

    // Urgency labels
    urgency_critical: 'Critical',
    urgency_high: 'High',
    urgency_medium: 'Medium',
    urgency_low: 'Low',

    // Medical need labels
    need_surgery: 'Surgery',
    need_medication: 'Medication',
    need_exam: 'Medical exams',
    need_kit: 'Medical kit',
    need_dialysis: 'Dialysis',
    need_other: 'Other',
  }
}

// Hook simple pour utiliser les traductions
export const useTranslation = (lang) => {
  const t = (key) => translations[lang]?.[key] || translations['fr'][key] || key
  return { t }
}

// Contexte global de langue
import { createContext, useContext, useState } from 'react'

export const LangContext = createContext('fr')

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr')

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, switchLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
