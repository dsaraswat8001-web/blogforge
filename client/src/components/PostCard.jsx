import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  Technology: '#6c63ff',
  Design: '#ec4899',
  Business: '#f59e0b',
  Lifestyle: '#34d399',
  Science: '#06b6d4',
  Culture: '#f87171',
  Other: '#8888a8'
};

export default function PostCard({ post, featured = false }) {
  const avatarUrl = post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`;
  const categoryColor = CATEGORY_COLORS[post.category] || '#8888a8';

  if (featured) {
    return (
      <Link to={`/post/${post.slug}`} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textDecoration: 'none' }}>
        {post.coverImage && (
          <div style={{ height: 360, overflow: 'hidden' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          </div>
        )}
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span className="badge" style={{ background: `${categoryColor}20`, color: categoryColor }}>{post.category}</span>
            <span className="badge badge--muted">{post.readTime} min read</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', lineHeight: 1.25, marginBottom: 16 }}>{post.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{post.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={avatarUrl} alt={post.author?.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{post.author?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
      {post.coverImage && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        </div>
      )}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: `${categoryColor}20`, color: categoryColor, fontSize: 11 }}>{post.category}</span>
          <span className="badge badge--muted" style={{ fontSize: 11 }}>{post.readTime} min read</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', lineHeight: 1.35 }}>{post.title}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, flex: 1 }}>
          {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '…' : post.excerpt}
        </p>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={avatarUrl} alt={post.author?.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{post.author?.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, color: 'var(--color-text-dim)', fontSize: 12 }}>
            <span>👁 {post.views}</span>
            <span>💬 {post.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
