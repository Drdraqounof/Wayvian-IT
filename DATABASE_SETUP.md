# Database Setup & Seed Instructions

## Overview
This project now uses Prisma ORM with PostgreSQL (Neon) to manage lessons data.

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@prisma/client` - Database client
- `prisma` - CLI for database management
- `ts-node` - TypeScript execution for seed scripts

### 2. Set Up Environment Variables
Ensure your `.env` file contains:
```
DATABASE_URL='postgresql://database:npg_6vdfIZYPatN8@ep-empty-king-ahy87uef-pooler.c-3.us-east-1.aws.neon.tech/schooler?sslmode=require&channel_binding=require'
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Create Database Schema
```bash
npm run prisma:migrate
```

When prompted, give your migration a name like "init" or "create_lessons_schema".

### 5. Seed Database with Lesson Data
```bash
npm run seed
```

This will populate your database with:
- **6 Categories**: Technology, Business, Design, Soft Skills, Career Growth
- **15 Lessons**: Complete lessons covering:
  - Web Development
  - Data Science
  - Python & Machine Learning
  - React Advanced Patterns
  - Communication & Leadership
  - Financial Literacy
  - And more!

## Lessons Data

### Categories
1. **Technology** (💻) - Programming, web dev, data science
2. **Business** (📈) - Project management, finance
3. **Design** (🎨) - Graphic design, advanced CSS
4. **Soft Skills** (🗣️) - Communication, leadership
5. **Career Growth** (🚀) - Interview prep, personal branding

### Sample Lessons

| Title | Level | Duration | Category | Progress |
|-------|-------|----------|----------|----------|
| Introduction to Programming | Beginner | 2h 30m | Technology | 75% |
| Web Development Basics | Beginner | 4h 15m | Technology | 45% |
| Data Analysis Fundamentals | Intermediate | 3h 45m | Technology | 20% |
| Advanced CSS Techniques | Intermediate | 3h | Design | 55% |
| Communication for Tech | Beginner | 2h | Soft Skills | 40% |
| Python for Data Science | Intermediate | 4h 30m | Technology | 30% |
| Project Management | Beginner | 3h 30m | Business | 60% |
| Interview Preparation | Beginner | 1h 45m | Career Growth | 30% |
| Advanced JavaScript | Advanced | 5h | Technology | 0% (Locked) |
| Personal Branding | Beginner | 2h 15m | Career Growth | 0% |
| Financial Literacy | Beginner | 3h | Business | 15% |
| Leadership Skills | Intermediate | 2h 30m | Soft Skills | 0% |
| Graphic Design Basics | Beginner | 2h 45m | Design | 10% |
| React Advanced Patterns | Advanced | 3h 15m | Technology | 0% |
| Machine Learning Fundamentals | Intermediate | 4h | Technology | 0% |

## API Endpoints

### Get All Lessons
```bash
GET /api/lessons
```

Query Parameters:
- `category` - Filter by category (e.g., "tech", "design")
- `search` - Search by title or description

Example:
```bash
GET /api/lessons?category=tech&search=programming
```

### Get Single Lesson
```bash
GET /api/lessons/:id
```

### Get All Categories
```bash
GET /api/categories
```

## Using Lessons in Your App

### Fetch Lessons from API
```typescript
// In your component
const [lessons, setLessons] = useState([]);

useEffect(() => {
  fetch('/api/lessons?category=tech')
    .then(res => res.json())
    .then(data => setLessons(data));
}, []);
```

### Database Schema
```prisma
model Lesson {
  id        Int     @id @default(autoincrement())
  title     String
  description String
  duration  String
  level     String  // "Beginner" | "Intermediate" | "Advanced"
  category  String
  icon      String
  progress  Int     @default(0)
  isLocked  Boolean @default(false)
  videoUrl  String?
  content   String? // Lesson content/markdown
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Useful Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run seed

# Open Prisma Studio (GUI to view database)
npx prisma studio

# Reset database (deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull
```

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check internet connection to Neon
- Ensure SSL mode is set to `require`

### Migration Issues
```bash
# Reset and start fresh
npx prisma migrate reset
npm run seed
```

### Prisma Studio Not Loading
```bash
npx prisma studio --browser chrome
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Generate Prisma: `npm run prisma:generate`
3. ✅ Run migrations: `npm run prisma:migrate`
4. ✅ Seed data: `npm run seed`
5. ✅ Update lessons page to use API
6. Start dev server: `npm run dev`

Then update your [lessons/page.tsx](../app/lessons/page.tsx) to fetch data from the API instead of using hardcoded data.
