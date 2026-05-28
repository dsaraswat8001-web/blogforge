import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../hooks/useApi';

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>{label}</p>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{value ?? '—'}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/posts/admin/stats'),
      api.get('/posts/admin/all', { params: { limit: 8 } })
    ]).then(([statsRes, postsRes]) => {
      setStats(statsRes.data);
      setRecentPosts(postsRes.data.posts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Platform overview</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard label="Total Posts" value={stats?.total} icon="📝" color="#6c63ff" />
          <StatCard label="Published" value={stats?.published} icon="🚀" color="#34d399" />
          <StatCard label="Drafts" value={stats?.drafts} icon="✏️" color="#fbbf24" />
          <StatCard label="Total Views" value={stats?.totalViews?.toLocaleString()} icon="👁" color="#06b6d4" />
          <StatCard label="Comments" value={stats?.totalComments} icon="💬" color="#ec4899" />
          <StatCard label="Users" value={stats?.totalUsers} icon="👥" color="#f59e0b" />
        </div>

        {/* Quick nav */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            ['/admin/posts', '📝 Manage Posts'],
            ['/admin/users', '👥 Manage Users'],
            ['/write', '✦ Write New Post']
          ].map(([path, label]) => (
            <Link key={path} to={path} className="btn btn--secondary">{label}</Link>
          ))}
        </div>

        {/* Recent posts */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 16 }}>Recent Posts</h2>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Title', 'Author', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, maxWidth: 240 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>{post.author?.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge--${post.status === 'published' ? 'success' : 'warning'}`}>{post.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-muted)' }}>{post.views}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link to={`/edit/${post._id}`} className="btn btn--ghost btn--sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
