import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../hooks/useApi';

const CATEGORIES = ['Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'Culture', 'Other'];

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/posts/my`).then(res => {
      const post = res.data.find(p => p._id === id);
      if (!post && !isAdmin) return navigate('/my-posts');
      if (post) {
        setForm({ ...post, tags: post.tags?.join(', ') || '' });
      } else {
        // admin fetching others' posts
        api.get('/posts/admin/all').then(r => {
          const p = r.data.posts.find(x => x._id === id);
          if (!p) return navigate('/admin/posts');
          setForm({ ...p, tags: p.tags?.join(', ') || '' });
        });
      }
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const res = await api.put(`/posts/${id}`, {
        ...form,
        status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      toast.success('Post updated!');
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (loading || !form) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div className="page-enter" style={{ padding: '40px 0 80px' }}>
      <div className="container--wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Edit Post</h1>
            <span className={`badge badge--${form.status === 'published' ? 'success' : 'warning'}`} style={{ marginTop: 6 }}>{form.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--secondary btn--sm" onClick={() => handleSave('draft')} disabled={saving}>Save Draft</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleSave('published')} disabled={saving}>
              {saving ? 'Saving...' : '🚀 Publish'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="form-input" value={form.title} onChange={set('title')} style={{ fontSize: 20, fontFamily: 'var(--font-display)', padding: '16px', height: 'auto' }} />
            <textarea className="form-textarea" value={form.excerpt} onChange={set('excerpt')} style={{ minHeight: 80 }} maxLength={300} />
            <textarea className="form-textarea" value={form.content} onChange={set('content')} style={{ minHeight: 500, fontSize: 15, lineHeight: 1.7 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Settings</h3>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input className="form-input" value={form.tags} onChange={set('tags')} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-input" value={form.coverImage} onChange={set('coverImage')} />
              </div>
              {form.coverImage && (
                <img src={form.coverImage} alt="Cover" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }} onError={e => e.target.style.display = 'none'} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                <span style={{ color: 'var(--color-text-muted)' }}>Featured post</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
