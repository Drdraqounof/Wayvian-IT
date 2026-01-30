import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Skip table creation - assume tables exist or will be created via migrations
    console.log('✓ Proceeding with data insertion...');

    // Clear existing data
    try {
      await prisma.userProgress.deleteMany({});
      console.log('✓ Cleared user_progress');
    } catch (e) {
      console.log('Note: Could not clear user_progress (may not exist yet)');
    }

    try {
      await prisma.lesson.deleteMany({});
      console.log('✓ Cleared lessons');
    } catch (e) {
      console.log('Note: Could not clear lessons (may not exist yet)');
    }

    try {
      await prisma.category.deleteMany({});
      console.log('✓ Cleared categories');
    } catch (e) {
      console.log('Note: Could not clear categories (may not exist yet)');
    }

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "All Lessons",
        icon: "📚",
        color: "#667eea",
      },
    }),
    prisma.category.create({
      data: {
        name: "Technology",
        icon: "💻",
        color: "#3b82f6",
      },
    }),
    prisma.category.create({
      data: {
        name: "Business",
        icon: "📈",
        color: "#10b981",
      },
    }),
    prisma.category.create({
      data: {
        name: "Design",
        icon: "🎨",
        color: "#f59e0b",
      },
    }),
    prisma.category.create({
      data: {
        name: "Soft Skills",
        icon: "🗣️",
        color: "#ec4899",
      },
    }),
    prisma.category.create({
      data: {
        name: "Career Growth",
        icon: "🚀",
        color: "#8b5cf6",
      },
    }),
  ]);

  // Create lessons
  const lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: "Introduction to Programming",
        description: "Learn the fundamentals of programming with hands-on exercises and real-world examples.",
        duration: "2h 30m",
        level: "Beginner",
        category: "tech",
        icon: "🖥️",
        progress: 75,
        isLocked: false,
        videoUrl: "https://www.youtube.com/embed/qkFYqY3vr84",
        content: `# Introduction to Programming

## What is Programming?
Programming is the process of creating a set of instructions that tell a computer how to perform a task.

## Key Concepts
- Variables
- Data Types
- Control Flow
- Functions
- Loops

## Lesson Overview
In this lesson, you will learn:
1. What programming is and why it matters
2. How computers understand instructions
3. Your first program
4. Basic syntax and structure`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Web Development Basics",
        description: "Master HTML, CSS, and JavaScript to build modern, responsive websites.",
        duration: "4h 15m",
        level: "Beginner",
        category: "tech",
        icon: "🌐",
        progress: 45,
        isLocked: false,
        content: `# Web Development Basics

## The Three Pillars of Web Development
1. HTML - Structure
2. CSS - Styling
3. JavaScript - Interactivity

## What You'll Learn
- Creating semantic HTML structures
- Styling with CSS Grid and Flexbox
- Making interactive pages with JavaScript
- Responsive design principles
- Best practices for modern web development`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Data Analysis Fundamentals",
        description: "Discover how to analyze and visualize data to make informed decisions.",
        duration: "3h 45m",
        level: "Intermediate",
        category: "tech",
        icon: "📊",
        progress: 20,
        isLocked: false,
        content: `# Data Analysis Fundamentals

## Why Data Analysis Matters
- Drive business decisions
- Identify trends and patterns
- Solve problems with data

## Topics Covered
1. Data Collection
2. Data Cleaning
3. Exploratory Data Analysis (EDA)
4. Visualization Techniques
5. Statistical Basics
6. Tools: Python, Excel, Tableau`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Advanced CSS Techniques",
        description: "Master animations, transitions, and modern CSS frameworks for stunning designs.",
        duration: "3h 00m",
        level: "Intermediate",
        category: "design",
        icon: "✨",
        progress: 55,
        isLocked: false,
        content: `# Advanced CSS Techniques

## What You'll Master
- CSS Grid and Flexbox advanced layouts
- Animations and Transitions
- Media Queries for responsive design
- CSS Custom Properties (Variables)
- Modern CSS frameworks
- Performance optimization

## Projects
- Build a responsive portfolio
- Create animated UI components
- Design a complete website layout`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Communication for Tech Professionals",
        description: "Improve your presentation and communication skills in technical environments.",
        duration: "2h 00m",
        level: "Beginner",
        category: "soft-skills",
        icon: "💬",
        progress: 40,
        isLocked: false,
        content: `# Communication for Tech Professionals

## Key Skills
- Explaining technical concepts simply
- Presenting to non-technical audiences
- Writing clear documentation
- Giving and receiving feedback
- Email communication best practices
- Presentation techniques

## Why This Matters
- Career advancement
- Team collaboration
- Project success
- Stakeholder management`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Python for Data Science",
        description: "Use Python libraries like Pandas and NumPy to analyze and manipulate data efficiently.",
        duration: "4h 30m",
        level: "Intermediate",
        category: "tech",
        icon: "🐍",
        progress: 30,
        isLocked: false,
        content: `# Python for Data Science

## Libraries You'll Learn
- NumPy - Numerical computing
- Pandas - Data manipulation
- Matplotlib - Visualization
- Scikit-learn - Machine learning basics

## Topics
1. Data structures in Python
2. Working with DataFrames
3. Data cleaning and preprocessing
4. Exploratory analysis
5. Creating visualizations
6. Introduction to machine learning`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Project Management Essentials",
        description: "Learn methodologies and tools to manage projects effectively from start to finish.",
        duration: "3h 30m",
        level: "Beginner",
        category: "business",
        icon: "📋",
        progress: 60,
        isLocked: false,
        content: `# Project Management Essentials

## Methodologies
- Waterfall
- Agile
- Scrum
- Kanban

## Core Competencies
- Planning and scheduling
- Resource allocation
- Risk management
- Stakeholder communication
- Quality assurance
- Project closure

## Tools
- Jira
- Asana
- Monday.com
- Trello`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Interview Preparation",
        description: "Ace your next job interview with proven strategies and practice sessions.",
        duration: "1h 45m",
        level: "Beginner",
        category: "career",
        icon: "🎯",
        progress: 30,
        isLocked: false,
        content: `# Interview Preparation

## Preparation Steps
1. Research the company
2. Understand the role
3. Practice common questions
4. Prepare your stories (STAR method)
5. Mock interviews

## Common Questions
- Tell me about yourself
- Why do you want this job?
- Describe a challenge you overcame
- Where do you see yourself in 5 years?

## Technical Interview Tips
- Explain your thought process
- Ask clarifying questions
- Write clean code
- Test your solution`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Advanced JavaScript",
        description: "Deep dive into advanced JS concepts including async programming and design patterns.",
        duration: "5h 00m",
        level: "Advanced",
        category: "tech",
        icon: "⚡",
        progress: 0,
        isLocked: true,
        content: `# Advanced JavaScript

## Topics
- Closures and Scope
- Prototypal Inheritance
- Async/Await and Promises
- Design Patterns
- Performance Optimization
- Memory Management

## Prerequisites
- Solid understanding of JavaScript basics
- Experience with ES6+
- Familiarity with DOM manipulation

## Projects
- Build a complex application
- Implement design patterns
- Optimize performance`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Personal Branding",
        description: "Build a powerful personal brand that sets you apart in your industry.",
        duration: "2h 15m",
        level: "Beginner",
        category: "career",
        icon: "🌟",
        progress: 0,
        isLocked: false,
        content: `# Personal Branding

## Components of Personal Branding
- Your unique value proposition
- Online presence and social media
- Portfolio and projects
- Thought leadership
- Networking and relationships

## Action Steps
1. Define your brand
2. Create a portfolio
3. Establish online presence
4. Share your knowledge
5. Build relationships
6. Maintain consistency

## Tools
- LinkedIn
- GitHub
- Personal website
- Medium or blog`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Financial Literacy",
        description: "Understand budgeting, investing, and financial planning for career success.",
        duration: "3h 00m",
        level: "Beginner",
        category: "business",
        icon: "💰",
        progress: 15,
        isLocked: false,
        content: `# Financial Literacy

## Core Topics
- Budgeting and saving
- Understanding credit
- Investing basics
- Retirement planning
- Insurance and risk management
- Tax basics

## Investment Types
- Stocks
- Bonds
- Mutual funds
- ETFs
- Real estate

## Career-Related Finance
- Salary negotiation
- Equity and stocks
- 401(k) plans
- Benefits evaluation`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Leadership Skills",
        description: "Develop essential leadership qualities to inspire and guide teams.",
        duration: "2h 30m",
        level: "Intermediate",
        category: "soft-skills",
        icon: "👑",
        progress: 0,
        isLocked: false,
        content: `# Leadership Skills

## Core Competencies
- Vision and strategy
- Decision-making
- Delegation
- Motivation
- Conflict resolution
- Emotional intelligence
- Team development

## Leadership Styles
- Transformational
- Servant leadership
- Democratic
- Situational

## Practical Applications
- Managing remote teams
- Giving feedback
- Handling difficult situations
- Building trust
- Developing others`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Graphic Design Basics",
        description: "Learn design principles, color theory, and tools to create visually appealing graphics.",
        duration: "2h 45m",
        level: "Beginner",
        category: "design",
        icon: "🎨",
        progress: 10,
        isLocked: false,
        content: `# Graphic Design Basics

## Design Principles
- Balance and symmetry
- Contrast
- Emphasis
- Movement
- White space
- Typography

## Color Theory
- Color wheel
- Complementary colors
- Color psychology
- Creating palettes

## Tools
- Figma
- Adobe Creative Suite
- Canva
- Sketch

## Projects
- Design a poster
- Create a brand identity
- Make social media graphics`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "React Advanced Patterns",
        description: "Master hooks, context, and advanced state management in modern React applications.",
        duration: "3h 15m",
        level: "Advanced",
        category: "tech",
        icon: "⚛️",
        progress: 0,
        isLocked: false,
        content: `# React Advanced Patterns

## Advanced Concepts
- Custom Hooks
- Context API
- Reducer pattern
- Performance optimization
- Code splitting
- Error boundaries
- Suspense

## State Management
- Redux vs Context
- Zustand
- Recoil
- MobX

## Performance
- Memoization
- Lazy loading
- Code splitting
- Bundle optimization

## Best Practices
- Component architecture
- Testing strategies
- Accessibility
- SEO for React apps`,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Machine Learning Fundamentals",
        description: "Introduction to ML concepts, algorithms, and how to build your first ML model.",
        duration: "4h 00m",
        level: "Intermediate",
        category: "tech",
        icon: "🤖",
        progress: 0,
        isLocked: false,
        content: `# Machine Learning Fundamentals

## Core Concepts
- Supervised vs Unsupervised learning
- Classification and Regression
- Training and testing data
- Model evaluation metrics
- Overfitting and underfitting

## Algorithms
- Linear Regression
- Logistic Regression
- Decision Trees
- K-Means Clustering
- Neural Networks basics

## Libraries
- Scikit-learn
- TensorFlow
- PyTorch

## Workflow
1. Problem definition
2. Data collection
3. Data preprocessing
4. Feature engineering
5. Model training
6. Evaluation
7. Deployment`,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${lessons.length} lessons`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed successfully!');
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
