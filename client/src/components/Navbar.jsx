import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`;

  return (
    <nav style={{
      background: 'rgba(10,10,18,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky', top: 0, zIndex: 100, height: 64
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 24 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--color-accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontFamily: 'var(--font-display)'
          }}>B</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text)' }}>
            BlogForge
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
          {[['/', 'Home'], ['/my-posts', 'My Posts']].map(([path, label]) => (
            user || path === '/' ? (
              <Link key={path} to={path} style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                fontSize: 14, color: location.pathname === path ? 'var(--color-text)' : 'var(--color-text-muted)',
                background: location.pathname === path ? 'var(--color-surface-3)' : 'transparent',
                transition: 'all 0.2s'
              }}>{label}</Link>
            ) : null
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 14, color: location.pathname.startsWith('/admin') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              transition: 'all 0.2s'
            }}>Admin</Link>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link to="/write" className="btn btn--primary btn--sm">
                ✦ Write
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                    border: '2px solid var(--color-border)', background: 'var(--color-surface-3)',
                    cursor: 'pointer', padding: 0
                  }}
                >
                  <img src={avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: '8px', minWidth: 180,
                    boxShadow: 'var(--shadow-lg)', zIndex: 200
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </div>
                    {[
                      ['/my-posts', '📝 My Posts'],
                      [`/profile/${user._id}`, '👤 Profile'],
                      ...(isAdmin ? [['/admin', '⚙️ Admin Panel']] : [])
                    ].map(([path, label]) => (
                      <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--color-text)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.target.style.background = 'var(--color-surface-3)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >{label}</Link>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
                    <button onClick={handleLogout}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >🚪 Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Sign In</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
