import { useState } from 'react';
import { Heart, Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { useLang, useTranslation } from '../utils/i18n.jsx';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { t } = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUnverifiedEmail('');
    setResendSent(false);
    try {
      await authAPI.login(loginData);
      setSuccess(t('auth_success_login'));
      const user = await authAPI.getCurrentUser();
      setTimeout(() => {
        if (user.role === 'DONOR') {
          navigate('/dashboard-donateur');
        } else if (user.role === 'HOSPITAL_AGENT') {
          navigate('/dashboard-hopital');
        } else if (user.role === 'ADMIN') {
          navigate('/dashboard-admin');
        }
      }, 1500);
    } catch (err) {
      if (err.response?.status === 403) {
        setUnverifiedEmail(loginData.email);
        setError("Votre compte n'est pas encore vérifié. Vérifiez votre boîte email.");
      } else {
        setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.register(registerData);
      setRegisteredEmail(registerData.email);
      setRegisterSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleResendFromLogin = async () => {
    setResendLoading(true);
    try {
      await authAPI.resendVerification(unverifiedEmail);
    } catch {}
    setResendSent(true);
    setResendLoading(false);
  };

  const switchToLogin = () => {
    setActiveTab('login');
    setRegisterSuccess(false);
    setError('');
    setSuccess('');
    setUnverifiedEmail('');
    setResendSent(false);
  };

  const switchToRegister = () => {
    setActiveTab('register');
    setError('');
    setSuccess('');
    setUnverifiedEmail('');
    setResendSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-4">
            <Heart className="text-white" size={32} fill="white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            JAPPOO FAJU
          </h1>
          <p className="text-slate-600">{t('auth_subtitle')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
          <div className="flex border-b border-slate-200">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-4 font-semibold transition-all ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('auth_tab_login')}
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-4 font-semibold transition-all ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('auth_tab_register')}
            </button>
          </div>

          <div className="p-8">
            {registerSuccess ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="text-green-600" size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-2">Vérifiez votre boîte email</h2>
                <p className="text-slate-600 mb-2">Un lien de confirmation a été envoyé à :</p>
                <p className="font-semibold text-blue-600 mb-4">{registeredEmail}</p>
                <p className="text-sm text-slate-500 mb-6">
                  Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez aussi vos spams.
                </p>
                <button
                  onClick={() => {
                    switchToLogin();
                    setLoginData({ email: registeredEmail, password: '' });
                  }}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    {unverifiedEmail && (
                      <div className="mt-3 pl-7">
                        {resendSent ? (
                          <p className="text-sm text-green-700">Lien renvoyé ! Vérifiez votre boîte email.</p>
                        ) : (
                          <button
                            onClick={handleResendFromLogin}
                            disabled={resendLoading}
                            className="text-sm text-blue-600 hover:underline font-medium disabled:opacity-50"
                          >
                            {resendLoading ? 'Envoi...' : 'Renvoyer le lien de vérification'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                )}

                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="email"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={t('auth_placeholder_email')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <Link to="/mot-de-passe-oublie" className="text-sm text-blue-600 hover:underline font-medium">
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <span>{t('auth_login_loading')}</span>
                      ) : (
                        <>
                          <span>{t('auth_login_btn')}</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {activeTab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_name')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          required
                          value={registerData.full_name}
                          onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={t('auth_placeholder_name')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="email"
                          required
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={t('auth_placeholder_email')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_phone')}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="tel"
                          required
                          value={registerData.phone_number}
                          onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={t('auth_placeholder_phone')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('auth_label_password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          onInvalid={(e) => e.target.setCustomValidity(t('auth_required'))}
                          onInput={(e) => e.target.setCustomValidity('')}
                          className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{t('auth_password_hint')}</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <span>{t('auth_register_loading')}</span>
                      ) : (
                        <>
                          <span>{t('auth_register_btn')}</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
            {t('auth_back')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
