import { useState, useEffect } from 'react';
import { Heart, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setError(err.response?.data?.detail || 'Lien invalide ou expiré.');
        setStatus('error');
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    try {
      await authAPI.resendVerification(resendEmail);
    } catch {}
    setResendSent(true);
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-4">
            <Heart className="text-white" size={32} fill="white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            JAPPOO FAJU
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Vérification en cours...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-black text-slate-800 mb-2">Email vérifié !</h2>
              <p className="text-slate-600 mb-6">Votre compte est maintenant actif. Vous pouvez vous connecter.</p>
              <Link
                to="/auth"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-center hover:shadow-xl transition-all"
              >
                Se connecter
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'no-token') && (
            <div>
              <div className="text-center mb-6">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <h2 className="text-xl font-black text-slate-800 mb-2">Lien invalide</h2>
                <p className="text-slate-600 text-sm">{error || 'Ce lien de vérification est invalide ou a expiré.'}</p>
              </div>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Recevoir un nouveau lien :</p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {resendLoading ? 'Envoi...' : 'Renvoyer le lien'}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-700 text-sm">
                    Si cet email existe et n'est pas vérifié, un nouveau lien a été envoyé.
                  </p>
                </div>
              )}

              <div className="text-center mt-4">
                <Link to="/auth" className="text-sm text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
