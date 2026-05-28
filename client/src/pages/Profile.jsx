import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/PostCard';
import api from '../hooks/useApi';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const isOwnProfile = user?._id === id;

  useEffect(() => {
    api.get(`/users/${id}/profile`)
      .then(res => {
        setProfileData(res.data);
        setForm({ name: res.data.user.name, bio: res.data.user.bio, website: res.data.user.website, avatar: res.data.user.avatar });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(form);
      setProfileData(prev => ({ ...prev, user: { ...prev.user, ...form } }));
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!profileData) return null;

  const { user: profileUser, posts } = profileData;
  const avatarUrl = profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.name}`;

  return (
    <div className="page-enter" style={{ padding: '48px 0' }}>
      <div className="container">
        {/* Profile header */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '40px', marginBottom: 40, display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <img src={avatarUrl} alt={profileUser.name} style={{ width: 88, height: 88, borderRadius: '50%', border: '3px solid var(--color-accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['name', 'Name', 'text'], ['bio', 'Bio', 'text'], ['website', 'Website', 'url'], ['avatar', 'Avatar URL', 'url']].map(([key, label, type]) => (
                  <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 4 }}>{profileUser.name}</h1>
                    {profileUser.role === 'admin' && <span className="badge badge--accent" style={{ marginBottom: 8 }}>Admin</span>}
                  </div>
                  {isOwnProfile && (
                    <button className="btn btn--secondary btn--sm" onClick={() => setEditing(true)}>Edit Profile</button>
                  )}
                </div>
                {profileUser.bio && <p style={{ color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.6 }}>{profileUser.bio}</p>}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: 14, marginTop: 8, display: 'inline-block' }}>
                    🔗 {profileUser.website}
                  </a>
                )}
                <div style={{ display: 'flex', gap: 20, marginTop: 16, color: 'var(--color-text-muted)', fontSize: 14 }}>
                  <span>📝 <strong style={{ color: 'var(--color-text)' }}>{posts.length}</strong> posts</span>
                  <span>📅 Joined {new Date(profileUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Posts */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 24 }}>Published Posts</h2>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
            <p>No published posts yet.</p>
            {isOwnProfile && <Link to="/write" className="btn btn--primary btn--sm" style={{ marginTop: 12 }}>Write your first post</Link>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
