# Database Schema & Seeding Guide

## Schema Design ✅

Your database now has a scalable structure:

### 1. **lessons** (core table)
```sql
- id (PRIMARY KEY)
- title
- description
- duration
- level (Beginner, Intermediate, Advanced)
- category
- icon
- is_locked
- created_at
- updated_at
```

### 2. **lesson_resources** (related content)
```sql
- id (PRIMARY KEY)
- lesson_id (FOREIGN KEY → lessons.id)
- type (youtube, survey, worksheet, article, quiz)
- title
- url
- description
- created_at
```

### 3. **user_progress** (tracking)
```sql
- id (PRIMARY KEY)
- user_id
- lesson_id (FOREIGN KEY → lessons.id)
- progress_percent (0-100)
- completed
- started_at
- completed_at
- created_at
- updated_at
```

## Benefits of This Structure

✅ **One-to-Many Relationships**
- One lesson can have multiple resources
- One lesson can have progress tracking for many users

✅ **Scalable**
- Easy to add new lessons
- Easy to add new resource types
- Supports user progress tracking

✅ **Clean Separation**
- Lessons are separate from resources
- Progress is tracked independently
- Easy to query and update

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
npm install pg
```

### Step 2: Set Database URL
Make sure your `.env` has:
```
DATABASE_URL='postgresql://database:npg_6vdfIZYPatN8@ep-empty-king-ahy87uef-pooler.c-3.us-east-1.aws.neon.tech/schooler?sslmode=require&channel_binding=require'
```

### Step 3: Create Tables (run schema)
```bash
psql $DATABASE_URL -f db/schema.sql
```

Or if `psql` isn't installed:
```bash
npm run db:setup
```

### Step 4: Seed the Data
```bash
npm run db:seed
```

This will:
- ✅ Create 15 lessons
- ✅ Add resources for each lesson
- ✅ Initialize user_progress table

## What Gets Seeded

### 15 Lessons with Resources:

**Technology (6)**
1. Introduction to Programming → YouTube video
2. Web Development Basics → Article + Worksheet
3. Data Analysis Fundamentals → Article
4. Python for Data Science → YouTube + Worksheet
5. Advanced JavaScript → YouTube + Worksheet (Advanced, Locked)
6. React Advanced Patterns → YouTube + Worksheet (Advanced)

**Design (2)**
7. Advanced CSS Techniques → YouTube
8. Graphic Design Basics → Article + Worksheet

**Soft Skills (2)**
9. Communication for Tech → Article
10. Leadership Skills → YouTube + Article

**Career (2)**
11. Interview Preparation → Article + Survey
12. Personal Branding → Article

**Business (2)**
13. Project Management → Article + Quiz
14. Financial Literacy → Article + Quiz

**Machine Learning (1)**
15. Machine Learning Fundamentals → YouTube + Article + Worksheet

## Resource Types

Each lesson can have multiple resources:

```json
{
  "type": "youtube",      // Video content
  "type": "article",      // Written guide
  "type": "worksheet",    // Practice exercises
  "type": "survey",       // Feedback form
  "type": "quiz"          // Assessment
}
```

All URLs point to external services:
- 🎥 YouTube videos (embedded)
- 📄 Google Docs/Sheets (worksheets)
- 📋 Google Forms (surveys/quizzes)
- 📖 External articles

## Query Examples

### Get a lesson with all its resources
```sql
SELECT l.*, r.*
FROM lessons l
LEFT JOIN lesson_resources r ON l.id = r.lesson_id
WHERE l.id = 1;
```

### Get user progress
```sql
SELECT l.title, up.progress_percent, up.completed
FROM user_progress up
JOIN lessons l ON up.lesson_id = l.id
WHERE up.user_id = 'user_123';
```

### Get lessons by category
```sql
SELECT * FROM lessons
WHERE category = 'tech'
ORDER BY title;
```

## API Integration

Once seeded, update your API routes:

```typescript
// app/api/lessons/route.ts
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const lessons = await db.query(
    'SELECT * FROM lessons WHERE ($1 IS NULL OR category = $1)',
    [category]
  );

  return Response.json(lessons.rows);
}
```

## Important Notes

⚠️ **Before First Seed:**
- Make sure `.env` DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL -c "SELECT NOW();"`
- Have Neon account access

⚠️ **If Re-seeding:**
- The script checks if data exists and won't duplicate
- To reset: manually delete and re-seed, or comment out the table creation in schema.sql

⚠️ **Production:**
- Don't run seed scripts on production without backup
- Use migrations for schema changes
- Keep seed data in version control

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED
```
→ Check DATABASE_URL is correct and accessible

### Table Already Exists
```
Error: relation "lessons" already exists
```
→ Tables already created. Just run: `npm run db:seed`

### Permission Denied
```
ERROR: permission denied for schema public
```
→ Make sure your Neon user has schema creation permissions

## Next Steps

1. ✅ Schema designed
2. ✅ Seed script created (15 lessons + resources)
3. ✅ npm run db:seed ready
4. ⏳ Create API routes to query database
5. ⏳ Update lessons page to fetch from database
6. ⏳ Add progress tracking UI

## Files

- `db/schema.sql` - Database schema
- `db/seed.js` - Node.js seed script
- `package.json` - Dependencies and scripts
- `.env` - Database connection string

Ready to seed! 🚀
