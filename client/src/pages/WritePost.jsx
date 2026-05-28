import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../hooks/useApi';

const CATEGORIES = ['Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'Culture', 'Other'];

export default function WritePost() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', coverImage: '', category: 'Technology',
    tags: '', status: 'draft', featured: false
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (status) => {
    if (!form.title || !form.excerpt || !form.content) return toast.error('Title, excerpt, and content are required');
    setLoading(true);
    try {
      const res = await api.post('/posts', {
        ...form,
        status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="page-enter" style={{ padding: '40px 0 80px' }}>
      <div className="container--wide">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Write a Post</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>Share your ideas with the world</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => setPreview(!preview)}>
              {preview ? '✏️ Edit' : '👁 Preview'}
            </button>
            <button className="btn btn--secondary btn--sm" onClick={() => handleSubmit('draft')} disabled={loading}>Save Draft</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleSubmit('published')} disabled={loading}>
              {loading ? 'Publishing...' : '🚀 Publish'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Main editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {preview ? (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 16 }}>{form.title || 'Untitled Post'}</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 18, fontStyle: 'italic', marginBottom: 32 }}>{form.excerpt}</p>
                <div className="prose" dangerouslySetInnerHTML={{ __html: form.content.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <>
                <div>
                  <input
                    className="form-input"
                    placeholder="Post title..."
                    value={form.title}
                    onChange={set('title')}
                    style={{ fontSize: 20, fontFamily: 'var(--font-display)', padding: '16px', height: 'auto' }}
                  />
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Write a compelling excerpt (shown on cards and search results)..."
                  value={form.excerpt}
                  onChange={set('excerpt')}
                  style={{ minHeight: 80, fontSize: 15 }}
                  maxLength={300}
                />
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="form-textarea"
                    placeholder={`Write your post here...\n\nMarkdown supported:\n## Heading\n**bold**, \`code\`\n\`\`\`\ncode blocks\n\`\`\``}
                    value={form.content}
                    onChange={set('content')}
                    style={{ minHeight: 500, fontSize: 15, lineHeight: 1.7 }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Post Settings</h3>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" placeholder="react, javascript, tutorial" value={form.tags} onChange={set('tags')} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-input" placeholder="https://..." value={form.coverImage} onChange={set('coverImage')} />
              </div>
              {form.coverImage && (
                <img src={form.coverImage} alt="Cover" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }} onError={e => e.target.style.display = 'none'} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                <span style={{ color: 'var(--color-text-muted)' }}>Mark as featured</span>
              </label>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12 }}>Unsplash Images</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Paste any Unsplash URL above for a free cover image.</p>
              <a href="https://unsplash.com/s/photos/technology" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--color-accent)' }}>Browse Unsplash →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
