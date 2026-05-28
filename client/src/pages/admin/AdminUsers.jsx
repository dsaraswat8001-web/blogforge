import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../hooks/useApi';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/users')
      .then(res => { setUsers(res.data.users); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(t => t - 1);
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>All Users</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{total} registered users</p>
          </div>
          <Link to="/admin" className="btn btn--ghost btn--sm">← Dashboard</Link>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const avatarUrl = u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={avatarUrl} alt={u.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{u.name}{isSelf && <span style={{ fontSize: 11, color: 'var(--color-accent)', marginLeft: 6 }}>(you)</span>}</div>
                            {u.bio && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge--${u.role === 'admin' ? 'accent' : 'muted'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/profile/${u._id}`} className="btn btn--ghost btn--sm" style={{ fontSize: 11, padding: '4px 8px' }}>Profile</Link>
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u._id, u.role)}
                                className="btn btn--secondary btn--sm"
                                style={{ fontSize: 11, padding: '4px 8px' }}
                              >{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</button>
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="btn btn--danger btn--sm"
                                style={{ fontSize: 11, padding: '4px 8px' }}
                              >Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
