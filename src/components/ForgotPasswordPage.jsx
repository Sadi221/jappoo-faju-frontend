import { useState } from 'react';
import { Heart, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
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
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-black text-slate-800 mb-2">Email envoyé !</h2>
              <p className="text-slate-600 mb-6">
                Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link to="/auth" className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Mot de passe oublié ?</h2>
              <p className="text-slate-500 mb-6 text-sm">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/auth" className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;