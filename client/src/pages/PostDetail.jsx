import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../hooks/useApi';

const CATEGORY_COLORS = {
  Technology: '#6c63ff', Design: '#ec4899', Business: '#f59e0b',
  Lifestyle: '#34d399', Science: '#06b6d4', Culture: '#f87171', Other: '#8888a8'
};

function CommentItem({ comment, postId, user, onDelete, onReply, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const toast = useToast();

  const avatarUrl = comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`;
  const isOwner = user?._id === comment.author?._id;

  const handleEdit = async () => {
    try {
      const res = await api.put(`/comments/${comment._id}`, { content });
      onUpdate(res.data);
      setEditing(false);
      toast.success('Comment updated');
    } catch { toast.error('Failed to update comment'); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post('/comments', { postId, content: replyText, parentComment: comment._id });
      onReply(comment._id, res.data);
      setReplyText('');
      setShowReply(false);
      toast.success('Reply posted');
    } catch { toast.error('Failed to post reply'); }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={avatarUrl} alt={comment.author?.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{comment.author?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {comment.isEdited && <span style={{ marginLeft: 6, opacity: 0.6 }}>(edited)</span>}
              </div>
            </div>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(!editing)} className="btn btn--ghost btn--sm">Edit</button>
              <button onClick={() => onDelete(comment._id)} className="btn btn--danger btn--sm">Delete</button>
            </div>
          )}
        </div>

        {editing ? (
          <div>
            <textarea className="form-textarea" value={content} onChange={e => setContent(e.target.value)} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--primary btn--sm" onClick={handleEdit}>Save</button>
              <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.7 }}>{comment.content}</p>
        )}

        {user && (
          <button onClick={() => setShowReply(!showReply)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
            ↩ Reply
          </button>
        )}
        {showReply && (
          <div style={{ marginTop: 12 }}>
            <textarea className="form-textarea" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ minHeight: 80, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--primary btn--sm" onClick={handleReply}>Post Reply</button>
              <button className="btn btn--ghost btn--sm" onClick={() => setShowReply(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div style={{ marginLeft: 32, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {comment.replies.map(reply => (
            <div key={reply._id} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={reply.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.name}`} alt={reply.author?.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{reply.author?.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                {user?._id === reply.author?._id && (
                  <button onClick={() => onDelete(reply._id)} className="btn btn--danger btn--sm" style={{ fontSize: 11, padding: '3px 8px' }}>Delete</button>
                )}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${slug}`),
          api.get(`/comments/post/placeholder`) // we'll update after post loads
        ]);
        setPost(postRes.data);
        const cr = await api.get(`/comments/post/${postRes.data._id}`);
        setComments(cr.data);
      } catch (err) {
        if (err.response?.status === 404) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/comments', { postId: post._id, content: newComment });
      setComments(prev => [...prev, { ...res.data, replies: [] }]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId && c.replies?.every(r => r._id !== commentId))
        .map(c => ({ ...c, replies: c.replies?.filter(r => r._id !== commentId) || [] })));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleReply = (parentId, reply) => {
    setComments(prev => prev.map(c => c._id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c));
  };

  const handleUpdateComment = (updated) => {
    setComments(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      navigate('/');
    } catch { toast.error('Failed to delete post'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!post) return null;

  const avatarUrl = post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`;
  const isOwner = user?._id === post.author?._id;
  const catColor = CATEGORY_COLORS[post.category] || '#8888a8';

  return (
    <div className="page-enter">
      {/* Cover image */}
      {post.coverImage && (
        <div style={{ height: 480, overflow: 'hidden', position: 'relative' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--color-bg) 100%)' }} />
        </div>
      )}

      <div className="container--narrow" style={{ padding: '48px 24px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: `${catColor}20`, color: catColor }}>{post.category}</span>
          <span className="badge badge--muted">{post.readTime} min read</span>
          <span className="badge badge--muted">👁 {post.views} views</span>
          <span className="badge badge--muted">💬 {comments.length} comments</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, marginBottom: 24 }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 32, fontStyle: 'italic' }}>{post.excerpt}</p>

        {/* Author bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: 48 }}>
          <Link to={`/profile/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={avatarUrl} alt={post.author?.name} style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{post.author?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {new Date(post.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </Link>
          {(isOwner || isAdmin) && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/edit/${post._id}`} className="btn btn--secondary btn--sm">✏️ Edit</Link>
              <button onClick={handleDeletePost} className="btn btn--danger btn--sm">🗑 Delete</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>').replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
            {post.tags.map(tag => (
              <span key={tag} className="badge badge--muted">#{tag}</span>
            ))}
          </div>
        )}

        {/* Comments section */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 32 }}>
            {comments.length} Comments
          </h2>

          {user ? (
            <form onSubmit={handleComment} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ minHeight: 100, marginBottom: 12 }}
                  />
                  <button type="submit" className="btn btn--primary btn--sm" disabled={!newComment.trim()}>Post Comment</button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 32, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>Sign in to join the conversation</p>
              <Link to="/login" className="btn btn--primary btn--sm">Sign In</Link>
            </div>
          )}

          <div>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p>Be the first to comment!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  user={user}
                  onDelete={handleDeleteComment}
                  onReply={handleReply}
                  onUpdate={handleUpdateComment}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
