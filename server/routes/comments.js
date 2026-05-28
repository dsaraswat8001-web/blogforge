const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/comments/post/:postId
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });

    const replies = await Comment.find({ post: req.params.postId, parentComment: { $ne: null } })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });

    // Nest replies under parent comments
    const commentMap = {};
    comments.forEach(c => {
      commentMap[c._id] = { ...c.toObject(), replies: [] };
    });
    replies.forEach(r => {
      if (commentMap[r.parentComment]) {
        commentMap[r.parentComment].replies.push(r);
      }
    });

    res.json(Object.values(commentMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments
router.post('/', protect, async (req, res) => {
  try {
    const { postId, content, parentComment } = req.body;
    if (!postId || !content) return res.status(400).json({ message: 'Post ID and content required' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: postId,
      content,
      author: req.user._id,
      parentComment: parentComment || null
    });
    await comment.populate('author', 'name avatar');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/comments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', 'name avatar');
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // Delete replies too
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) comment.likes.push(req.user._id);
    else comment.likes.splice(idx, 1);
    await comment.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
