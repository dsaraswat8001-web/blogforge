import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../hooks/useApi';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/posts/my')
      .then(res => setPosts(res.data))
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post and all its comments?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete post'); }
  };

  return (
    <div className="page-enter" style={{ padding: '48px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>My Posts</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{posts.length} posts</p>
          </div>
          <Link to="/write" className="btn btn--primary">✦ Write New Post</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Nothing published yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Share your first story with the world</p>
            <Link to="/write" className="btn btn--primary">Write Your First Post</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map(post => (
              <div key={post._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span className={`badge badge--${post.status === 'published' ? 'success' : 'warning'}`}>{post.status}</span>
                    <span className="badge badge--muted">{post.category}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>{post.title}</h3>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span style={{ margin: '0 8px' }}>·</span>{post.views} views
                    <span style={{ margin: '0 8px' }}>·</span>{post.readTime} min read
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {post.status === 'published' && (
                    <Link to={`/post/${post.slug}`} className="btn btn--ghost btn--sm">View</Link>
                  )}
                  <Link to={`/edit/${post._id}`} className="btn btn--secondary btn--sm">Edit</Link>
                  <button onClick={() => handleDelete(post._id)} className="btn btn--danger btn--sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
