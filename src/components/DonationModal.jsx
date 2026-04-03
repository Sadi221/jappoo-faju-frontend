import React, { useState } from 'react';
import { X, Heart, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '../services/api';

const DonationModal = ({ isOpen, onClose, medicalRequest }) => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  // Montants suggérés
  const suggestedAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  if (!isOpen || !medicalRequest) return null;

  const handleAmountSelect = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Seulement des chiffres
    setCustomAmount(value);
    setAmount(value);
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!amount || amount < 1000) {
      setError('Le montant minimum est de 1,000 FCFA');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Créer la donation
      const donationData = {
        medical_request_id: medicalRequest.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod
      };

      const donation = await paymentsAPI.createDonation(donationData);

      // 2. Initier le paiement Wave
      const paymentData = {
        donation_id: donation.donation_id,
        amount: parseFloat(amount),
        payer_phone: phoneNumber.startsWith('+221') ? phoneNumber : `+221${phoneNumber}`,
        payer_name: donorName || 'Donateur anonyme'
      };

      const paymentResponse = await paymentsAPI.initiateWavePayment(paymentData);

      // 3. Rediriger vers Wave (vraie URL) ou afficher succès (mode MOCK)
      const isMockUrl = paymentResponse.checkout_url?.includes('mock_');
      if (paymentResponse.checkout_url && !isMockUrl) {
        // Production : rediriger vers Wave
        window.location.href = paymentResponse.checkout_url;
      } else {
        // Mock ou pas d'URL : afficher l'écran succès
        setCheckoutUrl(paymentResponse.checkout_url || null);
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
      setError(null);
      setSuccess(false);
      setCheckoutUrl(null);
      onClose();
    }
  };

  // Vue succès
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-scale-in">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={40} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Don initié avec succès !</h3>
              <p className="text-slate-600">
                Merci pour votre générosité ! Votre don de <span className="font-bold text-blue-600">{formatAmount(amount)} FCFA</span> a été initié.
              </p>
            </div>

            {checkoutUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 mb-3">
                  🌊 <strong>Mode MOCK :</strong> En production, vous seriez redirigé vers Wave pour finaliser le paiement.
                </p>
                <p className="text-xs text-blue-600 break-all">
                  URL: {checkoutUrl}
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-t-3xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Heart size={32} fill="white" />
            <h2 className="text-2xl font-bold">Faire un don</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations demande */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Patient:</span>
              <span className="font-semibold text-slate-800">{medicalRequest.patient_pseudonym}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Besoin:</span>
              <span className="font-semibold text-slate-800">{medicalRequest.medical_need}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Objectif:</span>
              <span className="font-semibold text-blue-600">{formatAmount(medicalRequest.amount_needed)} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Collecté:</span>
              <span className="font-semibold text-green-600">{formatAmount(medicalRequest.amount_raised)} FCFA</span>
            </div>
          </div>

          {/* Montants suggérés */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Choisir un montant
            </label>
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ou entrez un montant personnalisé
            </label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Ex: 75000"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                FCFA
              </span>
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Moyen de paiement
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('WAVE')}
                className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                  paymentMethod === 'WAVE'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🌊 Wave
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                disabled
                className="py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
              >
                🍊 Orange
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('STRIPE')}
                disabled
                className="py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
              >
                💳 Stripe
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Orange Money et Stripe seront bientôt disponibles
            </p>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Numéro de téléphone Wave
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                +221
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="77 123 45 67"
                maxLength={9}
                className="w-full pl-16 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Nom (optionnel) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Votre nom <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Ex: Fatou Diop"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
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
              disabled={loading || !amount || !phoneNumber}
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
                  <span>Confirmer le don</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonationModal;
