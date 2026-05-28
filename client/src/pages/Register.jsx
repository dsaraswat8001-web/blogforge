import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to BlogForge.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'var(--color-accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontFamily: 'var(--font-display)', margin: '0 auto 20px', color: 'white' }}>B</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 8 }}>Start writing</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Create your free BlogForge account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          {[
            ['name', 'Full Name', 'text', 'Jane Doe'],
            ['email', 'Email', 'email', 'you@example.com'],
            ['password', 'Password', 'password', '••••••••'],
            ['confirm', 'Confirm Password', 'password', '••••••••']
          ].map(([key, label, type, placeholder]) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
