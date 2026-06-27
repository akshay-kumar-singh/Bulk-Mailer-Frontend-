import { Mail, Shield, Zap } from 'lucide-react';

const API_URL = '';

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`);
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Login error:', err);
      alert('Could not connect to server. Make sure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      {/* Background glow effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MailFlow</h1>
          <p className="text-text-muted">Send personalized bulk emails safely from your Gmail</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-3/50">
              <Shield className="w-5 h-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Safe Sending</p>
                <p className="text-xs text-text-muted">Max 45 emails/day with 3s delays to protect your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-3/50">
              <Zap className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Personalized Emails</p>
                <p className="text-xs text-text-muted">Use {'{name}'}, {'{company}'} placeholders in your templates</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/10 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs text-center text-text-muted">
            We only request permission to send emails on your behalf. Your data stays secure.
          </p>
        </div>
      </div>
    </div>
  );
}
