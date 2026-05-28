import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../hooks/useApi';

const CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'Culture', 'Other'];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (search) params.search = search;
        if (category) params.category = category;
        const res = await api.get('/posts', { params });
        setPosts(res.data.posts);
        setTotalPages(res.data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [search, category, page]);

  useEffect(() => {
    api.get('/posts', { params: { featured: 'true', limit: 1 } })
      .then(res => setFeatured(res.data.posts[0] || null))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setCategory(cat === 'All' ? '' : cat);
    setPage(1);
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '64px 0 48px'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'var(--color-accent-dim)', color: 'var(--color-accent)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
            ✦ A place for ideas
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: 20 }}>
            Where great writing<br />
            <em style={{ color: 'var(--color-accent)' }}>comes to life</em>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 18, maxWidth: 520, margin: '0 auto 32px' }}>
            Discover stories on technology, design, and the ideas shaping our world.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
            <input
              className="form-input"
              placeholder="Search articles..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn--primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {/* Featured post */}
        {featured && !search && !category && page === 1 && (
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Featured</span>
              <span className="badge badge--accent">✦ Editor's Pick</span>
            </div>
            <PostCard post={featured} featured />
          </section>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="btn btn--sm"
              style={{
                background: (cat === 'All' ? !category : category === cat) ? 'var(--color-accent)' : 'var(--color-surface-2)',
                color: (cat === 'All' ? !category : category === cat) ? 'white' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                flexShrink: 0
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Posts grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No posts found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {posts.map(post => <PostCard key={post._id} post={post} />)}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className="btn btn--sm"
                    onClick={() => setPage(p)}
                    style={{ background: p === page ? 'var(--color-accent)' : 'var(--color-surface-2)', color: p === page ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >{p}</button>
                ))}
                <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
