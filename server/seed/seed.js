require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@blogforge.com',
    password: 'admin123',
    role: 'admin',
    bio: 'Platform administrator and lead editor.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  });

  const alice = await User.create({
    name: 'Alice Chen',
    email: 'alice@blogforge.com',
    password: 'user123',
    role: 'user',
    bio: 'Full-stack developer and tech writer. Passionate about React and Node.js.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
  });

  const bob = await User.create({
    name: 'Bob Martinez',
    email: 'bob@blogforge.com',
    password: 'user123',
    role: 'user',
    bio: 'UX designer and creative thinker. I write about design systems and accessibility.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
  });

  // Create posts
  const posts = await Post.create([
    {
      title: 'The Future of React: What Server Components Mean for Frontend Development',
      excerpt: 'React Server Components are reshaping how we think about rendering, data fetching, and the client-server boundary. Here\'s what every developer needs to know.',
      content: `React Server Components (RSC) represent the most significant architectural shift in React\'s history. After years of client-side rendering dominance, we\'re witnessing a renaissance of server-side thinking — but with all the compositional power of React.

## What Are Server Components?

Server Components run exclusively on the server. They have direct access to your database, file system, and backend services. They never ship JavaScript to the client. This means zero bundle size impact for complex data-fetching logic.

\`\`\`jsx
// This runs only on the server
async function BlogPost({ slug }) {
  const post = await db.posts.findOne({ slug }); // Direct DB access!
  return <article>{post.content}</article>;
}
\`\`\`

## The Mental Model Shift

The old mental model: components live on the client, fetch data via APIs.

The new mental model: components can live anywhere. Server components fetch data directly. Client components handle interactivity. The boundary is explicit and intentional.

## Performance Implications

The numbers are compelling. Applications using RSC have seen:
- 40-60% reduction in JavaScript bundle size
- Faster Time to First Byte (TTFB)
- Better Core Web Vitals scores
- Reduced database query waterfalls

## The Tradeoffs

Nothing comes free. Server Components cannot:
- Use useState or useEffect
- Access browser APIs
- Use event handlers
- Use most third-party libraries that expect client context

The "use client" directive becomes your boundary marker — a deliberate decision about where the client-server divide lives.

## What This Means for You

If you\'re building with Next.js 14+, you\'re already using RSC by default. The ecosystem is catching up fast. Component libraries are shipping server-compatible versions. State management solutions are adapting.

The frontend developer of 2025 needs to think in two environments simultaneously. It\'s a skill worth developing now.`,
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
      author: alice._id,
      category: 'Technology',
      tags: ['react', 'javascript', 'frontend', 'server-components'],
      status: 'published',
      featured: true,
      views: 1247
    },
    {
      title: 'Design Systems at Scale: Lessons from Building Tokens-First',
      excerpt: 'After rebuilding three design systems from scratch, I\'ve learned that the biggest mistake teams make is building components before establishing their token architecture.',
      content: `Design systems fail for predictable reasons. They start with components, not foundations. Teams build beautiful buttons before defining spacing scales. Engineers implement colors before tokens exist. The result is a system that looks unified but breaks at scale.

## The Tokens-First Philosophy

Design tokens are the atoms of your design system. Before a single component is built, you should have a complete, documented, and version-controlled token set covering:

- **Color**: primitives (raw values) and semantics (purpose-based aliases)
- **Typography**: scales, weights, line heights, letter spacing
- **Spacing**: a consistent mathematical scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- **Elevation**: shadow and depth tokens
- **Animation**: duration and easing tokens

## The Two-Layer Color Model

The single biggest improvement to any design system is separating primitive colors from semantic colors.

\`\`\`css
/* Layer 1: Primitives — never used directly in components */
--color-purple-500: #6c63ff;
--color-gray-900: #0f0f1a;

/* Layer 2: Semantics — these are what components reference */
--color-brand-primary: var(--color-purple-500);
--color-surface-default: var(--color-gray-900);
\`\`\`

When you rebrand, you update semantic tokens. Primitives never change. Components never break.

## Spacing That Makes Sense

Stop using arbitrary values. A 4px base scale with a multiplier creates harmony across every component. 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Nothing else.

## The Documentation Problem

A design system without documentation is just a component library. Document the "why" not just the "what." Why is the button height 40px? Why do we use border-radius 6px? These decisions have reasons. Capture them.

## Real-World Adoption

The hardest part of any design system is adoption. Technical excellence means nothing if engineers bypass your system to ship faster. Invest in DX: excellent IntelliSense, Figma integration, migration codemods, and a changelog that celebrates contributions.`,
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
      author: bob._id,
      category: 'Design',
      tags: ['design-systems', 'ux', 'css', 'tokens'],
      status: 'published',
      featured: true,
      views: 893
    },
    {
      title: 'MongoDB Atlas vs. Supabase: Choosing the Right Database for Your SaaS',
      excerpt: 'After migrating two production applications between these platforms, I have strong opinions about which one belongs in your stack — and it depends heavily on your data model.',
      content: `The "MongoDB vs PostgreSQL" debate is tired. The real question modern SaaS teams should be asking is: MongoDB Atlas or Supabase? Both are managed cloud offerings with generous free tiers, excellent SDKs, and growing ecosystems.

## Where MongoDB Atlas Wins

**Flexible schema evolution**: When your data model is actively changing — and at early stage it always is — document stores let you ship without migrations. Adding a new field is a one-liner. Removing fields is safe. Nested objects don't require JOIN tables.

**Aggregation pipeline**: MongoDB's aggregation framework is genuinely powerful. Complex analytics queries that require multiple CTEs in SQL become readable pipeline stages.

**Horizontal scaling**: Atlas's sharding is production-proven at enormous scale. If you're building something that might need to handle millions of documents, the scaling story is strong.

## Where Supabase Wins

**Relational integrity**: If your data is inherently relational — and most business data is — PostgreSQL's foreign keys, transactions, and referential integrity save you from entire categories of bugs.

**Real-time subscriptions**: Supabase's real-time engine is built into the platform. Row-level subscriptions that sync to your frontend are a literal 3-line implementation.

**Auth out of the box**: Supabase Auth handles email, OAuth, and magic links without additional services. MongoDB Atlas requires a separate auth provider.

**SQL**: You already know SQL. Your team already knows SQL. The learning curve is a flat line.

## My Recommendation

Building a content platform, CMS, or catalog? MongoDB Atlas. Building a SaaS with users, subscriptions, and relational business objects? Supabase.

Neither is wrong. Both are excellent. The mistake is picking one for religious reasons rather than matching the tool to the problem.`,
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&q=80',
      author: alice._id,
      category: 'Technology',
      tags: ['mongodb', 'database', 'supabase', 'backend'],
      status: 'published',
      views: 654
    },
    {
      title: 'The Attention Economy and Why Your App Might Be Making People Miserable',
      excerpt: 'As developers, we build systems that shape behavior. It\'s time we thought seriously about the ethical implications of the engagement patterns we optimize for.',
      content: `I want to talk about something uncomfortable: the possibility that the software we build — the notification systems, the infinite scrolls, the streak mechanics, the red badge counts — might be actively harming the people who use it.

## The Engagement Trap

Every product metric we're taught to optimize — DAU, session length, retention, push notification CTR — is a proxy for attention. And attention, unlike revenue, isn't infinite. When your app captures it, something else doesn't.

This isn't a new observation. Tristan Harris has been making it for years. But what's changed is the sophistication of the techniques. Variable reward schedules (borrowed directly from slot machine design). Social obligation loops. FOMO mechanics. Streak penalties. The average product team now has access to behavioral psychology research that would make BF Skinner nervous.

## What We're Actually Optimizing For

When a product manager says "we need to improve 7-day retention," they're saying: we need more people to come back. But come back to what? If the product isn't delivering genuine value on day 7, we have two choices: improve the value, or improve the manipulation.

The latter is easier to A/B test.

## The Developer's Responsibility

We implement these systems. We build the notification scheduler. We write the code that fires the "Your friend just posted!" push at 11pm. We're not absolved of responsibility because a PM wrote the spec.

## Designing Differently

Some teams are pushing back. Tools that tell you how long you've been scrolling. Notification batching that respects focus time. Explicit "I'm done for the day" signals that the system respects. Session summaries that show actual time spent.

These features don't optimize for engagement. They optimize for user wellbeing. And counterintuitively, they often improve long-term retention because trust compounds.

## A Simple Question to Ask

Before shipping any engagement feature, ask: "Is this helping the user accomplish their goal, or is it helping us accomplish ours?" If it's the latter, have a harder conversation before you ship.`,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
      author: admin._id,
      category: 'Culture',
      tags: ['ethics', 'product', 'ux', 'attention'],
      status: 'published',
      views: 2103,
      featured: true
    },
    {
      title: 'TypeScript Generics: From Confused to Confident',
      excerpt: 'Generics are the feature TypeScript developers avoid the longest and regret avoiding the most. This guide will take you from copy-pasting Stack Overflow to writing your own generic utilities.',
      content: `If you've been writing TypeScript for more than a few months, you've copy-pasted a generic type from Stack Overflow without fully understanding it. We all have. Generics are the syntax that looks like math homework and the concept that unlocks TypeScript's real power.

## What Generics Actually Are

Generics are type variables. Instead of writing a function that works on strings, or numbers, or a specific object shape — you write a function that works on *T*, whatever T turns out to be.

\`\`\`typescript
// Without generics: you'd need a version of this for every type
function identity(arg: string): string { return arg; }

// With generics: works for any type, and TypeScript tracks the specific type
function identity<T>(arg: T): T { return arg; }

const str = identity("hello"); // TypeScript knows: str is string
const num = identity(42);      // TypeScript knows: num is number
\`\`\`

## Constraints: Making Generics Useful

Raw generics are too flexible. \`T\` could be anything, so you can't call methods on it. Constraints let you say "T must have at least these properties."

\`\`\`typescript
interface HasLength { length: number; }

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length); // Safe! We know T has .length
  return arg;
}

logLength("hello");   // ✓ strings have .length
logLength([1, 2, 3]); // ✓ arrays have .length
logLength(42);        // ✗ TypeScript error: number has no .length
\`\`\`

## Real-World Utility Types

Once you understand generics, TypeScript's built-in utility types make sense:

- \`Partial<T>\` — makes all properties optional
- \`Required<T>\` — makes all properties required
- \`Pick<T, K>\` — creates a type with only the specified keys
- \`Omit<T, K>\` — creates a type without the specified keys
- \`ReturnType<F>\` — extracts the return type of a function

## The ApiResponse Pattern

Here's a generic pattern I use in every project:

\`\`\`typescript
type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

// Now every API response is typed correctly:
type UserResponse = ApiResponse<User>;
type PostsResponse = ApiResponse<Post[]>;
\`\`\`

This is the pattern that makes TypeScript genuinely save you from runtime bugs. Once you see it, you'll use it everywhere.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      author: alice._id,
      category: 'Technology',
      tags: ['typescript', 'javascript', 'programming', 'types'],
      status: 'published',
      views: 788
    },
    {
      title: 'Draft: Accessibility in 2026 — The State of Inclusive Web',
      excerpt: 'A look at how far we\'ve come and how far we still have to go in building web experiences that work for everyone.',
      content: 'Draft content for upcoming post about web accessibility...',
      coverImage: '',
      author: bob._id,
      category: 'Design',
      tags: ['accessibility', 'a11y', 'inclusive-design'],
      status: 'draft',
      views: 0
    }
  ]);

  // Seed comments
  await Comment.create([
    {
      post: posts[0]._id,
      author: bob._id,
      content: 'Great breakdown of RSC! The mental model shift is exactly what tripped me up when I first started using Next.js 14. The "use client" boundary took some getting used to, but once it clicked, it changed how I architect everything.'
    },
    {
      post: posts[0]._id,
      author: admin._id,
      content: 'The bundle size reduction numbers are real — we saw similar results at my company when we migrated. The tradeoff is more cognitive overhead during development, but it\'s worth it at scale.'
    },
    {
      post: posts[1]._id,
      author: alice._id,
      content: 'The two-layer color model is something I wish I\'d learned 5 years ago. We\'re in the middle of a rebrand right now and the teams that used semantic tokens are handling it gracefully while the others are in pain.'
    },
    {
      post: posts[3]._id,
      author: alice._id,
      content: 'This needed to be said. I\'ve been in too many sprint planning meetings where the entire discussion is about increasing notification CTR with zero conversation about whether the notifications are useful.'
    },
    {
      post: posts[3]._id,
      author: bob._id,
      content: 'Shared this with my team. The "whose goal are we optimizing for" question is going on our design review checklist.'
    }
  ]);

  console.log('✅ Seed complete!');
  console.log('Admin: admin@blogforge.com / admin123');
  console.log('User 1: alice@blogforge.com / user123');
  console.log('User 2: bob@blogforge.com / user123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
