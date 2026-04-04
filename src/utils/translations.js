/**
 * Traductions centralisées pour JAPPOO FAJU
 */

export const MEDICAL_NEED_LABELS = {
  SURGERY: 'Chirurgie',
  MEDICATION: 'Médicaments',
  EXAM: 'Examens médicaux',
  KIT: 'Kit médical',
};

export const URGENCY_LABELS = {
  CRITICAL: 'Critique',
  HIGH: 'Élevé',
  MEDIUM: 'Moyen',
  LOW: 'Faible',
};

export const REQUEST_STATUS_LABELS = {
  PENDING: 'En attente',
  ACTIVE: 'Active',
  COMPLETED: 'Complétée',
  REJECTED: 'Rejetée',
  EXPIRED: 'Expirée',
  CLOSED: 'Clôturée',
};

export const DONATION_STATUS_LABELS = {
  PENDING: 'En attente',
  COMPLETED: 'Confirmé',
  CANCELLED: 'Annulé',
};

export const t = (dict, key) => dict[key] || key;
