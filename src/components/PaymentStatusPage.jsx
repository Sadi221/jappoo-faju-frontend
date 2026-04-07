import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';
import { paymentsAPI } from '../services/api';

const PaymentStatusPage = ({ status: pageStatus }) => {
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = searchParams.get('provider');
  const paymentId = searchParams.get('payment_id');
  const sessionId = searchParams.get('session_id'); // Stripe

  const isSuccess = pageStatus === 'success';

  useEffect(() => {
    const fetchStatus = async () => {
      if (paymentId) {
        try {
          const data = await paymentsAPI.getPaymentStatus(paymentId);
          setPaymentInfo(data);
        } catch {
          // non bloquant
        }
      }
      setLoading(false);
    };
    fetchStatus();
  }, [paymentId]);

  const providerLabel = {
    wave: 'Wave',
    orange_money: 'Orange Money',
    stripe: 'carte bancaire',
  }[provider] || 'paiement';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
          <Heart className="text-white" size={20} fill="white" />
        </div>
        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          JAPPOO FAJU
        </span>
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 max-w-md w-full text-center space-y-6">

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-600 font-medium">Vérification du paiement...</p>
          </div>
        ) : isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={44} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 mb-2">Don confirmé !</h1>
              <p className="text-slate-600">
                Votre paiement via <strong>{providerLabel}</strong> a bien été reçu.
                Merci pour votre générosité — vous contribuez à sauver une vie.
              </p>
            </div>
            {paymentInfo && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant :</span>
                  <span className="font-semibold text-slate-800">
                    {Number(paymentInfo.amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut :</span>
                  <span className="font-semibold text-green-700">Confirmé</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="text-red-500" size={44} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 mb-2">Paiement annulé</h1>
              <p className="text-slate-600">
                Le paiement a été annulé ou n'a pas abouti. Vous pouvez réessayer depuis la page de la demande.
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link
            to="/"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center"
          >
            Retour à l'accueil
          </Link>
          {!isSuccess && (
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
