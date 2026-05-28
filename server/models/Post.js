const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  excerpt: { type: String, required: true, maxlength: 300 },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'Culture', 'Other'],
    default: 'Other'
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readTime: { type: Number, default: 1 }, // minutes
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-generate slug from title
postSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 0;
    while (await mongoose.model('Post').findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    this.slug = slug;
  }
  // Auto-calculate read time (~200 words per minute)
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }
  next();
});

postSchema.index({ slug: 1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
