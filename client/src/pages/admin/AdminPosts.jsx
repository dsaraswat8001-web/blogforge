import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../hooks/useApi';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/posts/admin/all', { params: { page: p, limit: 20 } });
      setPosts(res.data.posts);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently? All comments will be removed.')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      setTotal(t => t - 1);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/posts/${post._id}`, { status: newStatus });
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, status: newStatus } : p));
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.author?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>All Posts</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{total} total posts</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/admin" className="btn btn--ghost btn--sm">← Dashboard</Link>
            <Link to="/write" className="btn btn--primary btn--sm">✦ New Post</Link>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Search by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                    {['Title', 'Author', 'Category', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post, i) => (
                    <tr key={post._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                        <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                        {post.featured && <span style={{ fontSize: 11, color: 'var(--color-accent)' }}>★ Featured</span>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>{post.author?.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge--muted" style={{ fontSize: 11 }}>{post.category}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge--${post.status === 'published' ? 'success' : 'warning'}`}>{post.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>{post.views}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {post.status === 'published' && (
                            <Link to={`/post/${post.slug}`} className="btn btn--ghost btn--sm" style={{ fontSize: 11, padding: '4px 8px' }}>View</Link>
                          )}
                          <Link to={`/edit/${post._id}`} className="btn btn--secondary btn--sm" style={{ fontSize: 11, padding: '4px 8px' }}>Edit</Link>
                          <button onClick={() => handleToggleStatus(post)} className="btn btn--ghost btn--sm" style={{ fontSize: 11, padding: '4px 8px' }}>
                            {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => handleDelete(post._id)} className="btn btn--danger btn--sm" style={{ fontSize: 11, padding: '4px 8px' }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => load(page - 1)} disabled={page === 1}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>Page {page} of {pages}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => load(page + 1)} disabled={page === pages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
