import React, { useState } from 'react';
import { X, Heart, Phone, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { MEDICAL_NEED_LABELS, t } from '../utils/translations';

const PAYMENT_METHODS = [
  { id: 'WAVE', label: 'Wave', emoji: '🌊', needsPhone: true, phonePrefix: '+221', color: 'blue' },
  { id: 'ORANGE_MONEY', label: 'Orange Money', emoji: '🍊', needsPhone: true, phonePrefix: '+221', color: 'orange' },
  { id: 'STRIPE', label: 'Carte bancaire', emoji: '💳', needsPhone: false, color: 'purple' },
];

const DonationModal = ({ isOpen, onClose, medicalRequest, request }) => {
  medicalRequest = medicalRequest || request;
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const suggestedAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  if (isOpen === false || !medicalRequest) return null;

  const handleAmountSelect = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setAmount(value);
  };

  const formatAmount = (value) => new Intl.NumberFormat('fr-FR').format(value);

  // Conversion FCFA → EUR pour l'affichage (Stripe)
  const toEur = (fcfa) => (fcfa / 655.957).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || amount < 1000) {
      setError('Le montant minimum est de 1 000 FCFA');
      return;
    }

    if (selectedMethod.needsPhone && (!phoneNumber || phoneNumber.length < 8)) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Étape 1 : créer la donation
      const donation = await paymentsAPI.createDonation({
        medical_request_id: medicalRequest.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod
      });

      const fullPhone = phoneNumber.startsWith('+221')
        ? phoneNumber
        : `+221${phoneNumber}`;

      let paymentResponse;

      if (paymentMethod === 'WAVE') {
        paymentResponse = await paymentsAPI.initiateWavePayment({
          donation_id: donation.donation_id,
          amount: parseFloat(amount),
          payer_phone: fullPhone,
          payer_name: donorName || 'Donateur anonyme'
        });
      } else if (paymentMethod === 'ORANGE_MONEY') {
        paymentResponse = await paymentsAPI.initiateOrangeMoneyPayment({
          donation_id: donation.donation_id,
          amount: parseFloat(amount),
          payer_phone: fullPhone,
          payer_name: donorName || 'Donateur anonyme'
        });
      } else {
        // STRIPE
        paymentResponse = await paymentsAPI.createStripeCheckout({
          donation_id: donation.donation_id,
          amount: parseFloat(amount),
          payer_name: donorName || undefined,
          payer_email: donorEmail || undefined
        });
      }

      const mock = paymentResponse.checkout_url?.includes('mock') ||
                   paymentResponse.checkout_url?.includes('localhost');

      if (paymentResponse.checkout_url && !mock) {
        // Production → rediriger vers le prestataire
        window.location.href = paymentResponse.checkout_url;
      } else {
        setCheckoutUrl(paymentResponse.checkout_url || null);
        setIsMock(mock);
        setSuccess(true);
      }

    } catch (err) {
      console.error('Erreur donation:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'initiation du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setCustomAmount('');
      setPhoneNumber('');
      setDonorName('');
      setDonorEmail('');
      setError(null);
      setSuccess(false);
      setCheckoutUrl(null);
      setIsMock(false);
      onClose();
    }
  };

  // ── Vue succès ──────────────────────────────────────────
  if (success) {
    const providerLabel = selectedMethod?.label || 'paiement';
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-scale-in">
          <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Don initié !</h3>
              <p className="text-slate-600">
                Merci pour votre générosité ! Votre don de{' '}
                <span className="font-bold text-blue-600">{formatAmount(amount)} FCFA</span>{' '}
                via <strong>{providerLabel}</strong> a été initié.
              </p>
            </div>
            {isMock && checkoutUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-sm text-amber-800 font-semibold mb-1">Mode développement (MOCK)</p>
                <p className="text-xs text-amber-700">
                  En production, vous seriez redirigé vers {providerLabel} pour finaliser le paiement.
                </p>
              </div>
            )}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire principal ─────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-t-3xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white disabled:opacity-50"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Heart size={32} fill="white" />
            <h2 className="text-2xl font-bold">Faire un don</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Résumé demande */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Patient :</span>
              <span className="font-semibold text-slate-800">{medicalRequest.patient_pseudonym}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Besoin :</span>
              <span className="font-semibold text-slate-800">{t(MEDICAL_NEED_LABELS, medicalRequest.medical_need)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Objectif :</span>
              <span className="font-semibold text-blue-600">{formatAmount(medicalRequest.amount_needed)} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Collecté :</span>
              <span className="font-semibold text-green-600">{formatAmount(medicalRequest.amount_raised)} FCFA</span>
            </div>
          </div>

          {/* Montants suggérés */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Choisir un montant</label>
            <div className="grid grid-cols-3 gap-3">
              {suggestedAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAmountSelect(value)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    amount == value
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {value >= 1000 ? `${value / 1000}K` : value}
                </button>
              ))}
            </div>
          </div>

          {/* Montant personnalisé */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ou entrez un montant</label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Ex : 75000"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">FCFA</span>
            </div>
            {paymentMethod === 'STRIPE' && amount >= 1000 && (
              <p className="text-xs text-slate-400 mt-1">
                ≈ {toEur(amount)} EUR (conversion au taux fixe XOF/EUR)
              </p>
            )}
          </div>

          {/* Moyen de paiement */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Moyen de paiement</label>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                    paymentMethod === method.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="block text-lg">{method.emoji}</span>
                  <span className="block text-xs mt-0.5">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Numéro de téléphone (Wave / Orange Money) */}
          {selectedMethod?.needsPhone && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone size={15} className="inline mr-1" />
                Numéro {selectedMethod.label}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">+221</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="77 123 45 67"
                  maxLength={9}
                  className="w-full pl-16 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required={selectedMethod.needsPhone}
                />
              </div>
            </div>
          )}

          {/* Email (Stripe uniquement) */}
          {paymentMethod === 'STRIPE' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Votre e-mail <span className="text-slate-400 font-normal">(optionnel — pour votre reçu)</span>
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <CreditCard size={12} />
                Paiement sécurisé par Stripe — vous serez redirigé vers la page de paiement.
              </p>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Votre nom <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Ex : Fatou Diop"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !amount || (selectedMethod?.needsPhone && !phoneNumber)}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Heart size={20} fill="white" />
                  <span>
                    {paymentMethod === 'STRIPE' ? 'Payer par carte' : 'Confirmer le don'}
                  </span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Paiement sécurisé · 100% reversé au patient · 0% de frais
          </p>
        </form>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default DonationModal;
