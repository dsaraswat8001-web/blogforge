const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — list published posts with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 9, category, tag, search, author, featured } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured === 'true') query.featured = true;
    if (author) query.author = author;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Add commentCount
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post, commentCount };
    }));

    res.json({ posts: postsWithCounts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/admin — all posts for admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Post.countDocuments();
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/my — current user's posts
router.get('/my', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/stats — admin stats
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, published, drafts, totalViews, totalComments] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Comment.countDocuments()
    ]);
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    res.json({ total, published, drafts, totalViews: totalViews[0]?.total || 0, totalComments, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name avatar bio website');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, status, featured } = req.body;
    const post = await Post.create({
      title, excerpt, content, coverImage, category,
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      author: req.user._id
    });
    await post.populate('author', 'name avatar');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const fields = ['title', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'status', 'featured'];
    fields.forEach(f => { if (req.body[f] !== undefined) post[f] = req.body[f]; });
    await post.save();
    await post.populate('author', 'name avatar');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
