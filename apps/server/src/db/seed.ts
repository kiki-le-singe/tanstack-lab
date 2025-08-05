import dotenv from 'dotenv';

dotenv.config();

import { getDatabase } from './index.js';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Get database adapter
    const adapter = await getDatabase();
    const db = adapter.db; // Database instance from adapter
    const { users, categories, posts, comments } = adapter.schema;

    console.log(`🔧 Using ${adapter.type} database (${adapter.dialect})`);

    // Clear existing data (in reverse order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(categories);
    await db.delete(users);

    // Seed users
    console.log('👥 Seeding users...');
    const [user1, user2, user3] = await db
      .insert(users)
      .values([
        {
          name: 'Alice Johnson',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        },
        {
          name: 'Bob Smith',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        },
        {
          name: 'Charlie Davis',
          avatarUrl: null,
        },
      ])
      .returning();

    // Seed categories
    console.log('📁 Seeding categories...');
    const [devCategory, designCategory, lifeCategory] = await db
      .insert(categories)
      .values([
        {
          name: 'Development',
          slug: 'dev',
        },
        {
          name: 'Design',
          slug: 'design',
        },
        {
          name: 'Life',
          slug: 'life',
        },
      ])
      .returning();

    // Seed posts
    console.log('📝 Seeding posts...');
    const [post1, post2, post3, post4, post5, post6, post7] = await db
      .insert(posts)
      .values([
        // User 1 posts (4 posts)
        {
          title: 'Getting Started with TypeScript in 2025',
          content:
            'TypeScript continues to evolve with powerful new features. In this post, we explore the latest additions and best practices for modern TypeScript development.',
          published: true,
          authorId: user1.id,
          categoryId: devCategory.id,
        },
        {
          title: 'The Future of React Server Components',
          content:
            "React Server Components are changing how we think about data fetching and rendering. Let's dive into what this means for frontend development.",
          published: true,
          authorId: user1.id,
          categoryId: devCategory.id,
        },
        {
          title: 'Mastering CSS Grid Layout',
          content:
            "CSS Grid has revolutionized web layouts. Here's a comprehensive guide to creating complex, responsive designs with minimal code.",
          published: true,
          authorId: user1.id,
          categoryId: designCategory.id,
        },
        {
          title: 'Building Scalable GraphQL APIs',
          content:
            'Learn how to design and implement GraphQL APIs that can grow with your application while maintaining performance and developer experience.',
          published: false,
          authorId: user1.id,
          categoryId: devCategory.id,
        },
        // User 2 posts (2 posts)
        {
          title: 'Work-Life Balance in Tech',
          content:
            'Maintaining a healthy work-life balance is crucial in the fast-paced tech industry. Here are strategies that have worked for me over the years.',
          published: true,
          authorId: user2.id,
          categoryId: lifeCategory.id,
        },
        {
          title: 'The Art of Minimalist UI Design',
          content:
            'Less is more when it comes to user interface design. Discover how to create beautiful, functional interfaces with minimal elements.',
          published: true,
          authorId: user2.id,
          categoryId: designCategory.id,
        },
        // User 3 posts (1 post)
        {
          title: 'My Journey Learning to Code',
          content:
            "From complete beginner to professional developer - here's what I learned along the way and advice for others starting their coding journey.",
          published: true,
          authorId: user3.id,
          categoryId: lifeCategory.id,
        },
      ])
      .returning();

    // Seed comments
    console.log('💬 Seeding comments...');
    await db.insert(comments).values([
      // Comments on post 1 (TypeScript post)
      {
        content: "Great post! TypeScript's type inference has really improved over the years.",
        postId: post1.id,
        authorId: user2.id,
      },
      {
        content: 'I agree! The new satisfies operator is a game-changer.',
        postId: post1.id,
        authorId: user3.id,
      },
      {
        content: "Thanks for the feedback! I'll cover the satisfies operator in my next post.",
        postId: post1.id,
        authorId: user1.id,
      },
      // Comments on post 2 (React Server Components)
      {
        content: "Server Components are indeed fascinating. Can't wait to use them in production.",
        postId: post2.id,
        authorId: user3.id,
      },
      {
        content: 'The mental model shift is significant but worth it.',
        postId: post2.id,
        authorId: user2.id,
      },
      // Comments on post 5 (Work-Life Balance)
      {
        content: 'This resonates with me so much. Thank you for sharing your experience.',
        postId: post5.id,
        authorId: user1.id,
      },
      {
        content: 'Setting boundaries has been the most important lesson for me.',
        postId: post5.id,
        authorId: user3.id,
      },
      // Comments on post 7 (Learning Journey)
      {
        content: "Inspiring story! It's never too late to start coding.",
        postId: post7.id,
        authorId: user1.id,
      },
      {
        content: 'The persistence really pays off in the long run.',
        postId: post7.id,
        authorId: user2.id,
      },
      // Note: post3, post4, and post6 have no comments (as requested)
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`Created:
    - ${[user1, user2, user3].length} users
    - ${[devCategory, designCategory, lifeCategory].length} categories  
    - ${[post1, post2, post3, post4, post5, post6, post7].length} posts
    - 9 comments`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  });
}
