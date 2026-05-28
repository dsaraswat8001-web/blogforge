import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@blogforge.com'); setPassword('admin123'); }
    else if (type === 'alice') { setEmail('alice@blogforge.com'); setPassword('user123'); }
    else { setEmail('bob@blogforge.com'); setPassword('user123'); }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'var(--color-accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontFamily: 'var(--font-display)', margin: '0 auto 20px' }}>B</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Sign in to your BlogForge account</p>
        </div>

        {/* Demo buttons */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10, textAlign: 'center' }}>Demo Credentials</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[['admin', '🔑 Admin'], ['alice', '👩 Alice'], ['bob', '👨 Bob']].map(([key, label]) => (
              <button key={key} onClick={() => fillDemo(key)} className="btn btn--ghost btn--sm" style={{ fontSize: 12 }}>{label}</button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent)' }}>Get started free</Link>
        </p>
      </div>
    </div>
  );
}
