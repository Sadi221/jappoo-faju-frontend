import { useState } from 'react';
import { X, Heart, Loader2, AlertCircle, User, Mail } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { useLang, useTranslation, useCurrencyRates } from '../utils/i18n.jsx';
import { formatConversion } from '../utils/currency';

const HELLOASSO_RATE = 655.957; // 1 EUR = 655.957 XOF (taux fixe CFA)
const SUGGESTED_AMOUNTS_EUR = [10, 20, 50];

const DonationModal = ({ isOpen, onClose, medicalRequest, request }) => {
  medicalRequest = medicalRequest || request;
  const { lang } = useLang();
  const { t } = useTranslation(lang);
  const { usdRate } = useCurrencyRates();
  const conv = (fcfa) => formatConversion(fcfa, lang, usdRate);

  const needLabel = (need) => {
    const map = { SURGERY: 'need_surgery', MEDICATION: 'need_medication', EXAM: 'need_exam', KIT: 'need_kit', DIALYSIS: 'need_dialysis', MEDICAMENTS: 'need_medication', EXAMENS: 'need_exam' };
    return t(map[need] || need);
  };

  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatAmount = (value) => new Intl.NumberFormat('fr-FR').format(value);
  const goal = medicalRequest?.amount_needed || medicalRequest?.amount_requested || 0;

  if (isOpen === false || !medicalRequest) return null;

  const handleAmountSelect = (value) => {
    setAmount(value);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    setCustomAmount(value);
    setAmount(value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountEur = parseFloat(amount);
    if (!amountEur || amountEur < 1) {
      setError('Montant minimum : 1 €');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await paymentsAPI.createHelloAssoCheckout(
        medicalRequest.id,
        amountEur,
        donorEmail || undefined,
      );
      window.location.href = result.redirect_url;
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur HelloAsso — réessayez plus tard');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setCustomAmount('');
      setDonorName('');
      setDonorEmail('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-t-3xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white disabled:opacity-50"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Heart size={32} fill="white" />
            <div>
              <h2 className="text-2xl font-bold">{t('donate_title')}</h2>
              <p className="text-white/80 text-sm mt-0.5">🌍 Via HelloAsso · Paiement en euros</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Résumé demande */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('donate_patient')} :</span>
              <span className="font-semibold text-slate-800">{medicalRequest.patient_pseudonym}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('donate_need')} :</span>
              <span className="font-semibold text-slate-800">
                {needLabel(medicalRequest.care_type || medicalRequest.medical_need)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('donate_goal')} :</span>
              <span className="font-semibold text-blue-600">
                {formatAmount(goal)} FCFA
                {conv(goal) && <span className="text-slate-400 font-normal ml-1 text-xs">{conv(goal)}</span>}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('donate_collected')} :</span>
              <span className="font-semibold text-green-600">
                {formatAmount(medicalRequest.amount_raised)} FCFA
                {conv(medicalRequest.amount_raised) && (
                  <span className="text-slate-400 font-normal ml-1 text-xs">{conv(medicalRequest.amount_raised)}</span>
                )}
              </span>
            </div>
          </div>

          {/* Montants suggérés */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Montant du don</label>
            <div className="grid grid-cols-3 gap-3">
              {SUGGESTED_AMOUNTS_EUR.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAmountSelect(value)}
                  className={`py-4 px-2 rounded-xl font-semibold transition-all leading-tight ${
                    amount == value
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="block text-lg">{value} €</span>
                  <span className={`block text-xs font-normal mt-0.5 ${amount == value ? 'text-white/70' : 'text-slate-400'}`}>
                    ≈ {Math.round(value * HELLOASSO_RATE).toLocaleString('fr-FR')} F
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Montant libre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Autre montant</label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Ex : 35"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">€</span>
            </div>
            {parseFloat(amount) >= 1 && !SUGGESTED_AMOUNTS_EUR.includes(parseFloat(amount)) && (
              <p className="text-xs text-slate-400 mt-1">
                ≈ {Math.round(parseFloat(amount) * HELLOASSO_RATE).toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          {/* Infos donateur (optionnel pour tous) */}
          <div className="space-y-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Vos informations <span className="font-normal normal-case text-slate-400">— optionnel</span>
            </p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <User size={13} className="inline mr-1" />
                {t('donate_name_label')}
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre nom' : 'Your name'}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Mail size={13} className="inline mr-1" />
                {t('donate_email_label')}
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre email' : 'Your email'}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-white"
              />
              <p className="text-xs text-slate-400 mt-1.5">{t('donate_fiscal_hint')}</p>
            </div>
          </div>

          {/* Info redirection */}
          <div className="p-3 bg-green-50 rounded-xl flex gap-2 text-xs text-green-700">
            <span>🔒</span>
            <span>Vous serez redirigé vers la page de paiement sécurisée HelloAsso pour finaliser votre don — aucune information bancaire n'est transmise à JAPPOO FAJU.</span>
          </div>

          {/* Mention rassurante */}
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            💡 Après votre paiement, vous recevrez un email de confirmation de HelloAsso.
            Si une page de chargement s'affiche, votre don est bien enregistré.
          </p>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              {t('donate_cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Redirection...</span>
                </>
              ) : (
                <>
                  <Heart size={20} fill="white" />
                  <span>Continuer vers HelloAsso</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            {t('donate_footer')}
          </p>
        </form>
      </div>
    </div>
  );
};

export default DonationModal;
