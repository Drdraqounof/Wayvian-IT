# Integration Guide - Using Lesson Seed Data

## Quick Start

Your lesson data is ready in `public/lessons-seed.json`. Here's how to integrate it:

## Option 1: Quick Frontend Integration (5 minutes)

Update your `app/lessons/page.tsx` to load from the JSON seed file:

```typescript
// At the top with other imports
import lessonsData from '@/public/lessons-seed.json';

export default function LessonsPage() {
  // ... existing code ...
  
  // Replace the hardcoded lessons array with:
  const lessons: Lesson[] = lessonsData.lessons;
  
  // Replace the hardcoded categories array with:
  const categories: Category[] = lessonsData.categories;
  
  // ... rest of component ...
}
```

**Done!** Your lessons page now uses the seed data.

## Option 2: API with JSON Fallback (10 minutes)

Create a utility to load from either API or JSON:

```typescript
// app/utils/lessonsLoader.ts
export async function getLessons() {
  try {
    // Try API first (when database is ready)
    const response = await fetch('/api/lessons');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('API not ready, using JSON fallback');
  }
  
  // Fall back to JSON seed data
  const lessonsData = await fetch('/lessons-seed.json').then(r => r.json());
  return lessonsData.lessons;
}

export async function getCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('API not ready, using JSON fallback');
  }
  
  const lessonsData = await fetch('/lessons-seed.json').then(r => r.json());
  return lessonsData.categories;
}
```

Then in your component:

```typescript
import { getLessons, getCategories } from '@/app/utils/lessonsLoader';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([getLessons(), getCategories()]).then(([l, c]) => {
      setLessons(l);
      setCategories(c);
    });
  }, []);
  
  // ... rest of component ...
}
```

## Option 3: Full Database Migration (30+ minutes)

When Neon database permissions are available:

```bash
# 1. Run migrations (creates tables)
npm run prisma:migrate -- --name init

# 2. Seed the database
npm run seed

# 3. Your API routes in app/api/lessons/ will work automatically
```

Then use the existing API routes:

```typescript
// Fetch all lessons
const lessons = await fetch('/api/lessons').then(r => r.json());

// Filter by category
const techLessons = await fetch('/api/lessons?category=tech').then(r => r.json());

// Search
const results = await fetch('/api/lessons?search=javascript').then(r => r.json());

// Get single lesson
const lesson = await fetch('/api/lessons/1').then(r => r.json());

// Get categories
const categories = await fetch('/api/categories').then(r => r.json());
```

## Data Structure

### Lesson Object
```typescript
{
  id: number;
  title: string;
  description: string;
  duration: string;           // e.g., "2h 30m"
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;           // e.g., "tech", "design"
  icon: string;               // emoji
  progress: number;           // 0-100
  isLocked: boolean;
  videoUrl?: string;          // optional embedded video
  content?: string;           // optional full content
}
```

### Category Object
```typescript
{
  id: string;
  name: string;
  icon: string;               // emoji
  color: string;              // hex color code
}
```

## Testing

### Test with cURL
```bash
# Verify JSON is accessible
curl http://localhost:3000/lessons-seed.json

# Should return JSON with categories and lessons
```

### Test in Browser
Navigate to: `http://localhost:3000/lessons-seed.json`

### Test in Component
```typescript
// Add this to useEffect to verify data loads
fetch('/lessons-seed.json')
  .then(r => r.json())
  .then(data => console.log('Loaded:', data))
  .catch(err => console.error('Error:', err));
```

## Troubleshooting

### JSON Not Loading
- Verify `public/lessons-seed.json` exists
- Make sure Next.js is serving public folder
- Check browser network tab for 404 errors
- Restart dev server: `npm run dev`

### API Not Working (when database setup)
- Verify database tables exist
- Check `.env` DATABASE_URL is correct
- Run: `npx prisma db push`
- Check for Prisma errors: `npx prisma validate`

### Database Permission Errors
- These are Neon-specific permissions
- Contact Neon support if you need to modify schema
- JSON approach works without database setup

## Migration Path

1. **Now**: Use `Option 1` (direct JSON import) - works immediately
2. **Later**: Upgrade to `Option 2` (API fallback) - smoother transition
3. **Eventually**: Full `Option 3` (database) - when permissions allow

## Files Reference

- Seed data: `public/lessons-seed.json`
- Schema: `prisma/schema.prisma`
- Seed script: `prisma/seed.ts`
- Lessons API: `app/api/lessons/route.ts`
- Single lesson: `app/api/lessons/[id]/route.ts`
- Categories API: `app/api/categories/route.ts`

## Questions?

Refer to:
- `SEED_SETUP_COMPLETE.md` - Overview of what's ready
- `DATABASE_SETUP.md` - Detailed database setup guide
- `SEED_DATA_SUMMARY.md` - Data summary

Happy coding! 🚀
