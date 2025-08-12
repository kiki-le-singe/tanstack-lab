import dotenv from 'dotenv';

dotenv.config();

import { logger, withTiming } from '../lib/logger.js';
import { getDatabase } from './index.js';

async function seed() {
  logger.info('Starting database seed operation');

  try {
    // Get database adapter
    const adapter = await getDatabase();
    const db = adapter.db; // Database instance from adapter
    const { users, categories, posts, comments } = adapter.schema;

    logger.info(
      { database: { type: adapter.type, dialect: adapter.dialect } },
      'Database ready for seeding',
    );

    // Clear existing data (in reverse order due to foreign keys)
    await withTiming(logger, 'clear-existing-data', async () => {
      await db.delete(comments);
      await db.delete(posts);
      await db.delete(categories);
      await db.delete(users);
    });

    // Seed users
    const userResults = await withTiming(logger, 'seed-users', async () => {
      return await db
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
          {
            name: 'Diana Chen',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
          },
          {
            name: 'Erik Martinez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=erik',
          },
          {
            name: 'Fatima Ali',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
          },
          {
            name: 'George Kim',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=george',
          },
          {
            name: 'Hannah Wilson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hannah',
          },
          {
            name: 'Isaac Thompson',
            avatarUrl: null,
          },
          {
            name: 'Julia Rodriguez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia',
          },
          {
            name: 'Kevin Park',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin',
          },
          {
            name: 'Luna Nakamura',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
          },
        ])
        .returning();
    });

    const [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12] = userResults;

    // Seed categories
    const categoryResults = await withTiming(logger, 'seed-categories', async () => {
      return await db
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
    });

    const [devCategory, designCategory, lifeCategory] = categoryResults;

    // Seed posts
    const postResults = await withTiming(logger, 'seed-posts', async () => {
      return await db
        .insert(posts)
        .values([
          // User 1 posts (3 posts)
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
          // User 4 posts (2 posts)
          {
            title: 'Mastering CSS Grid Layout',
            content:
              "CSS Grid has revolutionized web layouts. Here's a comprehensive guide to creating complex, responsive designs with minimal code.",
            published: true,
            authorId: user4.id,
            categoryId: designCategory.id,
          },
          {
            title: 'Docker for Frontend Developers',
            content:
              'Containerization has become essential for modern development workflows. Learn how to leverage Docker for consistent development environments.',
            published: true,
            authorId: user4.id,
            categoryId: devCategory.id,
          },
          // User 5 posts (2 posts)
          {
            title: 'Remote Work Productivity Tips',
            content:
              'Working from home effectively requires discipline and good habits. Here are proven strategies to stay productive while working remotely.',
            published: true,
            authorId: user5.id,
            categoryId: lifeCategory.id,
          },
          {
            title: 'Understanding Microservices Architecture',
            content:
              'Microservices can solve scalability challenges but introduce complexity. Learn when and how to implement microservices effectively.',
            published: true,
            authorId: user5.id,
            categoryId: devCategory.id,
          },
          // User 6 posts (1 post)
          {
            title: 'Color Theory for Web Developers',
            content:
              'Good color choices can make or break a design. Understand the psychology of colors and how to create harmonious palettes.',
            published: true,
            authorId: user6.id,
            categoryId: designCategory.id,
          },
          // User 7 posts (2 posts)
          {
            title: 'Database Optimization Techniques',
            content:
              'Slow queries killing your app performance? Learn practical techniques to optimize database queries and improve response times.',
            published: true,
            authorId: user7.id,
            categoryId: devCategory.id,
          },
          {
            title: 'Finding Your Design Voice',
            content:
              'Developing a unique design style takes time and practice. Explore techniques to discover and refine your creative voice.',
            published: false,
            authorId: user7.id,
            categoryId: designCategory.id,
          },
          // User 8 posts (1 post)
          {
            title: 'The Importance of Mental Health in Tech',
            content:
              'The tech industry can be stressful and demanding. Learn to prioritize mental health and build sustainable career practices.',
            published: true,
            authorId: user8.id,
            categoryId: lifeCategory.id,
          },
          // User 9 posts (2 posts)
          {
            title: 'JavaScript Testing Best Practices',
            content:
              'Writing reliable tests is crucial for maintainable code. Explore modern testing strategies and tools for JavaScript applications.',
            published: true,
            authorId: user9.id,
            categoryId: devCategory.id,
          },
          {
            title: 'Typography in Digital Design',
            content:
              'Good typography is invisible but powerful. Master the art of choosing and pairing fonts for digital interfaces.',
            published: true,
            authorId: user9.id,
            categoryId: designCategory.id,
          },
          // User 10 posts (1 post)
          {
            title: 'Building Habits That Stick',
            content:
              'Whether learning to code or staying fit, building lasting habits is key to long-term success. Here are science-backed strategies.',
            published: true,
            authorId: user10.id,
            categoryId: lifeCategory.id,
          },
          // User 11 posts (1 post)
          {
            title: 'API Security Fundamentals',
            content:
              'Securing APIs is critical in modern applications. Learn essential security practices to protect your services from common vulnerabilities.',
            published: true,
            authorId: user11.id,
            categoryId: devCategory.id,
          },
          // User 12 posts (2 posts)
          {
            title: 'Accessibility in Web Design',
            content:
              'Creating inclusive web experiences benefits everyone. Learn practical accessibility techniques that improve usability for all users.',
            published: true,
            authorId: user12.id,
            categoryId: designCategory.id,
          },
          {
            title: 'Career Growth in Tech',
            content:
              'Advancing your tech career requires more than technical skills. Explore strategies for professional development and leadership.',
            published: false,
            authorId: user12.id,
            categoryId: lifeCategory.id,
          },
        ])
        .returning();
    });

    // Extract posts for comments (first few posts)
    const [post1, post2, post3, post4, post5, post6, post7, post8, post9, post10, post11, post12, post13, post14, post15, post16, post17, post18, post19, post20] = postResults;

    // Seed comments
    await withTiming(logger, 'seed-comments', async () => {
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
        {
          content: 'Looking forward to more TypeScript content!',
          postId: post1.id,
          authorId: user5.id,
        },
        // Comments on post 2 (React Server Components)
        {
          content:
            "Server Components are indeed fascinating. Can't wait to use them in production.",
          postId: post2.id,
          authorId: user4.id,
        },
        {
          content: 'The mental model shift is significant but worth it.',
          postId: post2.id,
          authorId: user6.id,
        },
        {
          content: 'Great explanation of the rendering pipeline!',
          postId: post2.id,
          authorId: user8.id,
        },
        // Comments on post 4 (Work-Life Balance)
        {
          content: 'This resonates with me so much. Thank you for sharing your experience.',
          postId: post4.id,
          authorId: user1.id,
        },
        {
          content: 'Setting boundaries has been the most important lesson for me.',
          postId: post4.id,
          authorId: user7.id,
        },
        {
          content: 'Remote work definitely changed how I think about balance.',
          postId: post4.id,
          authorId: user9.id,
        },
        // Comments on post 5 (Minimalist UI Design)
        {
          content: 'Less is definitely more when done right. Great examples!',
          postId: post5.id,
          authorId: user10.id,
        },
        {
          content: 'The psychology behind minimalism in design is fascinating.',
          postId: post5.id,
          authorId: user12.id,
        },
        // Comments on post 6 (Learning Journey)
        {
          content: "Inspiring story! It's never too late to start coding.",
          postId: post6.id,
          authorId: user1.id,
        },
        {
          content: 'The persistence really pays off in the long run.',
          postId: post6.id,
          authorId: user2.id,
        },
        {
          content: 'Your journey gives me motivation to keep learning!',
          postId: post6.id,
          authorId: user11.id,
        },
        // Comments on post 7 (CSS Grid)
        {
          content: 'CSS Grid changed my life as a frontend developer!',
          postId: post7.id,
          authorId: user3.id,
        },
        {
          content: 'The examples are super clear. Bookmarking this!',
          postId: post7.id,
          authorId: user5.id,
        },
        // Comments on post 8 (Docker)
        {
          content: 'Docker was intimidating at first, but this makes it approachable.',
          postId: post8.id,
          authorId: user6.id,
        },
        {
          content: 'Container orchestration is the next step to learn.',
          postId: post8.id,
          authorId: user7.id,
        },
        // Comments on post 9 (Remote Work)
        {
          content: 'These tips are gold! Especially the morning routine advice.',
          postId: post9.id,
          authorId: user8.id,
        },
        {
          content: 'Working from home is an art form that needs practice.',
          postId: post9.id,
          authorId: user10.id,
        },
        // Comments on post 10 (Microservices)
        {
          content: 'Microservices solved our scaling issues but introduced new complexities.',
          postId: post10.id,
          authorId: user11.id,
        },
        {
          content: 'The trade-offs are important to understand before diving in.',
          postId: post10.id,
          authorId: user12.id,
        },
        // Comments on post 11 (Color Theory)
        {
          content: 'Color psychology in web design is often overlooked. Great post!',
          postId: post11.id,
          authorId: user1.id,
        },
        {
          content: 'The accessibility aspects of color choice are crucial.',
          postId: post11.id,
          authorId: user4.id,
        },
        // Comments on post 13 (Mental Health)
        {
          content: 'Thank you for addressing this important topic in our industry.',
          postId: post13.id,
          authorId: user2.id,
        },
        {
          content: 'Burnout is real. Mental health should be a priority.',
          postId: post13.id,
          authorId: user5.id,
        },
        {
          content: 'Seeking help was the best decision I ever made.',
          postId: post13.id,
          authorId: user9.id,
        },
        // Comments on post 14 (JavaScript Testing)
        {
          content: 'Testing saved my project more times than I can count.',
          postId: post14.id,
          authorId: user3.id,
        },
        {
          content: 'TDD changed how I approach problem-solving.',
          postId: post14.id,
          authorId: user7.id,
        },
        // Comments on post 15 (Typography)
        {
          content: 'Typography is the unsung hero of good design.',
          postId: post15.id,
          authorId: user6.id,
        },
        {
          content: 'Font pairing is an art that takes years to master.',
          postId: post15.id,
          authorId: user8.id,
        },
        // Comments on post 16 (Building Habits)
        {
          content: 'Atomic Habits methodology really works for coding practice.',
          postId: post16.id,
          authorId: user11.id,
        },
        {
          content: 'Small consistent efforts beat large sporadic ones.',
          postId: post16.id,
          authorId: user12.id,
        },
        // Comments on post 17 (API Security)
        {
          content: 'Security should be built in from day one, not bolted on later.',
          postId: post17.id,
          authorId: user1.id,
        },
        {
          content: 'Rate limiting and authentication are just the beginning.',
          postId: post17.id,
          authorId: user4.id,
        },
        // Comments on post 18 (Accessibility)
        {
          content: 'Accessibility benefits everyone, not just users with disabilities.',
          postId: post18.id,
          authorId: user2.id,
        },
        {
          content: 'Screen reader testing opened my eyes to so many issues.',
          postId: post18.id,
          authorId: user7.id,
        },
        {
          content: 'ARIA attributes are powerful when used correctly.',
          postId: post18.id,
          authorId: user10.id,
        },
      ]);
    });

    logger.info(
      {
        counts: {
          users: userResults.length,
          categories: categoryResults.length,
          posts: postResults.length,
          comments: 37,
        },
      },
      'Database seeded successfully',
    );
  } catch (error) {
    logger.fatal({ err: error }, 'Database seeding failed');
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => {
    logger.info('Seed operation completed successfully');
    process.exit(0);
  });
}
