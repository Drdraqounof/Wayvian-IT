import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const lessons = [
  {
    title: "Introduction to Programming",
    description: "Learn the fundamentals of programming with hands-on exercises and real-world examples.",
    duration: "2h 30m",
    level: "Beginner",
    category: "tech",
    icon: "🖥️",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "Programming Basics",
        url: "https://www.youtube.com/embed/qkFYqY3vr84",
      },
    ],
  },
  {
    title: "Web Development Basics",
    description: "Master HTML, CSS, and JavaScript to build modern, responsive websites.",
    duration: "4h 15m",
    level: "Beginner",
    category: "tech",
    icon: "🌐",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "HTML Basics Guide",
        url: "https://docs.example.com/html-guide",
      },
      {
        type: "worksheet",
        title: "HTML Practice Sheet",
        url: "https://docs.example.com/html-worksheet",
      },
    ],
  },
  {
    title: "Data Analysis Fundamentals",
    description: "Discover how to analyze and visualize data to make informed decisions.",
    duration: "3h 45m",
    level: "Intermediate",
    category: "tech",
    icon: "📊",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Data Analysis Introduction",
        url: "https://docs.example.com/data-analysis",
      },
    ],
  },
  {
    title: "Advanced CSS Techniques",
    description: "Master animations, transitions, and modern CSS frameworks for stunning designs.",
    duration: "3h 00m",
    level: "Intermediate",
    category: "design",
    icon: "✨",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "CSS Animations Tutorial",
        url: "https://www.youtube.com/embed/advanced-css",
      },
    ],
  },
  {
    title: "Communication for Tech Professionals",
    description: "Improve your presentation and communication skills in technical environments.",
    duration: "2h 00m",
    level: "Beginner",
    category: "soft-skills",
    icon: "💬",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Public Speaking Tips",
        url: "https://docs.example.com/speaking",
      },
    ],
  },
  {
    title: "Python for Data Science",
    description: "Use Python libraries like Pandas and NumPy to analyze and manipulate data efficiently.",
    duration: "4h 30m",
    level: "Intermediate",
    category: "tech",
    icon: "🐍",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "Python Data Science Course",
        url: "https://www.youtube.com/embed/python-data",
      },
      {
        type: "worksheet",
        title: "Python Pandas Exercises",
        url: "https://docs.example.com/pandas-worksheet",
      },
    ],
  },
  {
    title: "Project Management Essentials",
    description: "Learn methodologies and tools to manage projects effectively from start to finish.",
    duration: "3h 30m",
    level: "Beginner",
    category: "business",
    icon: "📋",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Agile Methodology Guide",
        url: "https://docs.example.com/agile",
      },
      {
        type: "quiz",
        title: "Project Management Quiz",
        url: "https://forms.example.com/pm-quiz",
      },
    ],
  },
  {
    title: "Interview Preparation",
    description: "Ace your next job interview with proven strategies and practice sessions.",
    duration: "1h 45m",
    level: "Beginner",
    category: "career",
    icon: "🎯",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Interview Tips and Tricks",
        url: "https://docs.example.com/interview-tips",
      },
      {
        type: "survey",
        title: "Interview Feedback Form",
        url: "https://forms.example.com/interview-feedback",
      },
    ],
  },
  {
    title: "Advanced JavaScript",
    description: "Deep dive into advanced JS concepts including async programming and design patterns.",
    duration: "5h 00m",
    level: "Advanced",
    category: "tech",
    icon: "⚡",
    is_locked: true,
    resources: [
      {
        type: "youtube",
        title: "Advanced JavaScript Patterns",
        url: "https://www.youtube.com/embed/advanced-js",
      },
      {
        type: "worksheet",
        title: "Async/Await Practice",
        url: "https://docs.example.com/async-practice",
      },
    ],
  },
  {
    title: "Personal Branding",
    description: "Build a powerful personal brand that sets you apart in your industry.",
    duration: "2h 15m",
    level: "Beginner",
    category: "career",
    icon: "🌟",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Building Your Personal Brand",
        url: "https://docs.example.com/personal-brand",
      },
    ],
  },
  {
    title: "Financial Literacy",
    description: "Understand budgeting, investing, and financial planning for career success.",
    duration: "3h 00m",
    level: "Beginner",
    category: "business",
    icon: "💰",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Budgeting 101",
        url: "https://docs.example.com/budgeting",
      },
      {
        type: "quiz",
        title: "Financial Literacy Assessment",
        url: "https://forms.example.com/finance-quiz",
      },
    ],
  },
  {
    title: "Leadership Skills",
    description: "Develop essential leadership qualities to inspire and guide teams.",
    duration: "2h 30m",
    level: "Intermediate",
    category: "soft-skills",
    icon: "👑",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "Leadership Fundamentals",
        url: "https://www.youtube.com/embed/leadership",
      },
      {
        type: "article",
        title: "Leadership Styles Guide",
        url: "https://docs.example.com/leadership-styles",
      },
    ],
  },
  {
    title: "Graphic Design Basics",
    description: "Learn design principles, color theory, and tools to create visually appealing graphics.",
    duration: "2h 45m",
    level: "Beginner",
    category: "design",
    icon: "🎨",
    is_locked: false,
    resources: [
      {
        type: "article",
        title: "Design Principles Explained",
        url: "https://docs.example.com/design-principles",
      },
      {
        type: "worksheet",
        title: "Design Practice Project",
        url: "https://docs.example.com/design-project",
      },
    ],
  },
  {
    title: "React Advanced Patterns",
    description: "Master hooks, context, and advanced state management in modern React applications.",
    duration: "3h 15m",
    level: "Advanced",
    category: "tech",
    icon: "⚛️",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "React Hooks Deep Dive",
        url: "https://www.youtube.com/embed/react-hooks",
      },
      {
        type: "worksheet",
        title: "React Patterns Exercises",
        url: "https://docs.example.com/react-patterns",
      },
    ],
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Introduction to ML concepts, algorithms, and how to build your first ML model.",
    duration: "4h 00m",
    level: "Intermediate",
    category: "tech",
    icon: "🤖",
    is_locked: false,
    resources: [
      {
        type: "youtube",
        title: "Machine Learning Basics",
        url: "https://www.youtube.com/embed/ml-basics",
      },
      {
        type: "article",
        title: "ML Algorithms Overview",
        url: "https://docs.example.com/ml-algorithms",
      },
      {
        type: "worksheet",
        title: "Build Your First ML Model",
        url: "https://docs.example.com/ml-project",
      },
    ],
  },
];

async function seed() {
  try {
    await client.connect();
    console.log("✓ Connected to Neon database");

    // Create tables first
    console.log("📋 Creating database schema...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        duration TEXT,
        level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
        category TEXT,
        icon TEXT,
        is_locked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_resources (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('youtube', 'survey', 'worksheet', 'article', 'quiz')),
        title TEXT,
        url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
        completed BOOLEAN DEFAULT false,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      );
    `);
    
    console.log("✓ Schema created");

    let insertedCount = 0;

    for (const lesson of lessons) {
      // Insert lesson
      const lessonResult = await client.query(
        `
        INSERT INTO lessons (title, description, duration, level, category, icon, is_locked)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [
          lesson.title,
          lesson.description,
          lesson.duration,
          lesson.level,
          lesson.category,
          lesson.icon,
          lesson.is_locked,
        ]
      );

      const lessonId = lessonResult.rows[0].id;
      console.log(`✓ Inserted lesson: ${lesson.title} (ID: ${lessonId})`);

      // Insert resources for this lesson
      if (lesson.resources && lesson.resources.length > 0) {
        for (const resource of lesson.resources) {
          await client.query(
            `
            INSERT INTO lesson_resources (lesson_id, type, title, url)
            VALUES ($1, $2, $3, $4)
            `,
            [lessonId, resource.type, resource.title, resource.url]
          );
        }
        console.log(`  └─ Added ${lesson.resources.length} resources`);
      }

      insertedCount++;
    }

    console.log(`\n✅ Successfully seeded ${insertedCount} lessons with resources`);
    console.log("📊 Lessons are now in your Neon database!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
