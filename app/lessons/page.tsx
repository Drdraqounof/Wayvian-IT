"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface UserData {
  firstName: string;
  lastName: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  icon: string;
  progress: number;
  isLocked: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function LessonsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!savedData) {
      router.push("/login");
      return;
    }
    setUserData(savedData);

    // Load theme from settings
    const savedSettings = JSON.parse(localStorage.getItem("userSettings") || "null");
    if (savedSettings?.appearance?.theme) {
      setIsDarkMode(savedSettings.appearance.theme === "dark");
    }
  }, [router]);

  const categories: Category[] = [
    { id: "all", name: "All Lessons", icon: "📚", color: "#667eea" },
    { id: "tech", name: "Technology", icon: "💻", color: "#3b82f6" },
    { id: "business", name: "Business", icon: "📈", color: "#10b981" },
    { id: "design", name: "Design", icon: "🎨", color: "#f59e0b" },
    { id: "soft-skills", name: "Soft Skills", icon: "🗣️", color: "#ec4899" },
    { id: "career", name: "Career Growth", icon: "🚀", color: "#8b5cf6" },
  ];

  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Introduction to Programming",
      description: "Learn the fundamentals of programming with hands-on exercises and real-world examples.",
      duration: "2h 30m",
      level: "Beginner",
      category: "tech",
      icon: "🖥️",
      progress: 75,
      isLocked: false,
    },
    {
      id: 2,
      title: "Web Development Basics",
      description: "Master HTML, CSS, and JavaScript to build modern, responsive websites.",
      duration: "4h 15m",
      level: "Beginner",
      category: "tech",
      icon: "🌐",
      progress: 45,
      isLocked: false,
    },
    {
      id: 3,
      title: "Data Analysis Fundamentals",
      description: "Discover how to analyze and visualize data to make informed decisions.",
      duration: "3h 45m",
      level: "Intermediate",
      category: "tech",
      icon: "📊",
      progress: 20,
      isLocked: false,
    },
    {
      id: 4,
      title: "Business Communication",
      description: "Develop professional communication skills for the modern workplace.",
      duration: "2h 00m",
      level: "Beginner",
      category: "soft-skills",
      icon: "💬",
      progress: 100,
      isLocked: false,
    },
    {
      id: 5,
      title: "UI/UX Design Principles",
      description: "Learn to create user-centered designs that delight and engage users.",
      duration: "3h 30m",
      level: "Intermediate",
      category: "design",
      icon: "✨",
      progress: 0,
      isLocked: false,
    },
    {
      id: 6,
      title: "Project Management Essentials",
      description: "Master the art of managing projects, teams, and deadlines effectively.",
      duration: "2h 45m",
      level: "Intermediate",
      category: "business",
      icon: "📋",
      progress: 60,
      isLocked: false,
    },
    {
      id: 7,
      title: "Interview Preparation",
      description: "Ace your next job interview with proven strategies and practice sessions.",
      duration: "1h 45m",
      level: "Beginner",
      category: "career",
      icon: "🎯",
      progress: 30,
      isLocked: false,
    },
    {
      id: 8,
      title: "Advanced JavaScript",
      description: "Deep dive into advanced JS concepts including async programming and design patterns.",
      duration: "5h 00m",
      level: "Advanced",
      category: "tech",
      icon: "⚡",
      progress: 0,
      isLocked: true,
    },
    {
      id: 9,
      title: "Personal Branding",
      description: "Build a powerful personal brand that sets you apart in your industry.",
      duration: "2h 15m",
      level: "Beginner",
      category: "career",
      icon: "🌟",
      progress: 0,
      isLocked: false,
    },
    {
      id: 10,
      title: "Financial Literacy",
      description: "Understand budgeting, investing, and financial planning for career success.",
      duration: "3h 00m",
      level: "Beginner",
      category: "business",
      icon: "💰",
      progress: 15,
      isLocked: false,
    },
    {
      id: 11,
      title: "Leadership Skills",
      description: "Develop essential leadership qualities to inspire and guide teams.",
      duration: "2h 30m",
      level: "Intermediate",
      category: "soft-skills",
      icon: "👑",
      progress: 0,
      isLocked: false,
    },
    {
      id: 12,
      title: "Graphic Design Basics",
      description: "Learn design fundamentals including color theory, typography, and composition.",
      duration: "3h 15m",
      level: "Beginner",
      category: "design",
      icon: "🎭",
      progress: 0,
      isLocked: false,
    },
  ];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "#10b981";
      case "Intermediate": return "#f59e0b";
      case "Advanced": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const completedLessons = lessons.filter(l => l.progress === 100).length;
  const inProgressLessons = lessons.filter(l => l.progress > 0 && l.progress < 100).length;
  const totalHours = lessons.reduce((acc, l) => {
    const hours = parseFloat(l.duration.split("h")[0]);
    return acc + hours;
  }, 0);

  if (!userData) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p>Loading lessons...</p>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.pageWrapper,
      background: isDarkMode ? "#0f0f23" : "#f1f5f9",
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .lesson-card:hover {
          transform: translateY(-5px);
          box-shadow: ${isDarkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 20px 40px rgba(0, 0, 0, 0.12)"};
          border-color: #667eea;
        }
        .lesson-card:hover .lesson-icon {
          transform: scale(1.1);
        }
        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .category-btn.active {
          transform: scale(1.02);
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .start-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        @media (max-width: 1024px) {
          .lessons-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .lessons-grid {
            grid-template-columns: 1fr !important;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .header-content {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 80px !important;
          }
        }
        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        userInitial={userData.firstName[0]}
      />

      {/* Main Content */}
      <main className="main-content" style={styles.main}>
        {/* Page Header */}
        <header style={styles.pageHeader}>
          <div>
            <h1 style={{ ...styles.pageTitle, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>📖 Lessons</h1>
            <p style={{ ...styles.pageSubtitle, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Explore courses to build your skills</p>
          </div>
        </header>

        {/* Stats Section */}
        <section style={styles.statsSection}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={{ ...styles.statCard, background: isDarkMode ? "#1e1e35" : "white" }}>
              <span style={styles.statIcon}>📚</span>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statValue, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{lessons.length}</span>
                <span style={{ ...styles.statLabel, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Total Lessons</span>
              </div>
            </div>
            <div style={{ ...styles.statCard, background: isDarkMode ? "#1e1e35" : "white" }}>
              <span style={styles.statIcon}>✅</span>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statValue, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{completedLessons}</span>
                <span style={{ ...styles.statLabel, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Completed</span>
              </div>
            </div>
            <div style={{ ...styles.statCard, background: isDarkMode ? "#1e1e35" : "white" }}>
              <span style={styles.statIcon}>🔄</span>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statValue, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{inProgressLessons}</span>
                <span style={{ ...styles.statLabel, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>In Progress</span>
              </div>
            </div>
            <div style={{ ...styles.statCard, background: isDarkMode ? "#1e1e35" : "white" }}>
              <span style={styles.statIcon}>⏱️</span>
              <div style={styles.statInfo}>
                <span style={{ ...styles.statValue, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{totalHours.toFixed(0)}h</span>
                <span style={{ ...styles.statLabel, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Total Content</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section style={styles.filterSection}>
          <div className="header-content" style={styles.filterHeader}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  ...styles.searchInput,
                  background: isDarkMode ? "#1e1e35" : "white",
                  border: isDarkMode ? "2px solid #2d2d44" : "2px solid #e5e7eb",
                  color: isDarkMode ? "#e5e7eb" : "#1f2937",
                }}
                className="search-input"
              />
            </div>
            <div style={{ ...styles.resultsCount, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>
              Showing {filteredLessons.length} of {lessons.length} lessons
            </div>
          </div>

          {/* Categories */}
          <div className="categories-grid" style={styles.categoriesGrid}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
                style={{
                  ...styles.categoryBtn,
                  background: selectedCategory === category.id 
                    ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`
                    : isDarkMode ? "#1e1e35" : "white",
                  color: selectedCategory === category.id ? "white" : isDarkMode ? "#e5e7eb" : "#374151",
                  borderColor: selectedCategory === category.id ? category.color : isDarkMode ? "#2d2d44" : "#e5e7eb",
                }}
              >
                <span style={styles.categoryIcon}>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Lessons Grid */}
        <section style={styles.lessonsSection}>
          <div className="lessons-grid" style={styles.lessonsGrid}>
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="lesson-card"
                style={{
                  ...styles.lessonCard,
                  opacity: lesson.isLocked ? 0.7 : 1,
                  background: isDarkMode ? "#1e1e35" : "white",
                  border: isDarkMode ? "2px solid #2d2d44" : "2px solid #f3f4f6",
                }}
              >
                {lesson.isLocked && (
                  <div style={{
                    ...styles.lockedOverlay,
                    background: isDarkMode ? "rgba(15, 15, 35, 0.9)" : "rgba(255, 255, 255, 0.9)",
                  }}>
                    <span style={styles.lockIcon}>🔒</span>
                    <span style={{ ...styles.lockText, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Complete prerequisites to unlock</span>
                  </div>
                )}
                
                <div style={styles.lessonHeader}>
                  <span className="lesson-icon" style={styles.lessonIcon}>{lesson.icon}</span>
                  <span style={{ ...styles.levelBadge, background: getLevelColor(lesson.level) }}>
                    {lesson.level}
                  </span>
                </div>
                
                <h3 style={{ ...styles.lessonTitle, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{lesson.title}</h3>
                <p style={{ ...styles.lessonDesc, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>{lesson.description}</p>
                
                <div style={styles.lessonMeta}>
                  <span style={{ ...styles.metaItem, color: isDarkMode ? "#6b7280" : "#9ca3af" }}>⏱️ {lesson.duration}</span>
                  <span style={{ ...styles.metaItem, color: isDarkMode ? "#6b7280" : "#9ca3af" }}>
                    {categories.find(c => c.id === lesson.category)?.icon} {categories.find(c => c.id === lesson.category)?.name}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span style={{ ...styles.progressLabel, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Progress</span>
                    <span style={{ ...styles.progressPercent, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>{lesson.progress}%</span>
                  </div>
                  <div style={{
                    ...styles.progressBarBg,
                    background: isDarkMode ? "#2d2d44" : "#e5e7eb",
                  }}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${lesson.progress}%`,
                        background: lesson.progress === 100 
                          ? "#10b981" 
                          : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  style={{
                    ...styles.startBtn,
                    opacity: lesson.isLocked ? 0.5 : 1,
                    cursor: lesson.isLocked ? "not-allowed" : "pointer",
                  }}
                  className="start-btn"
                  disabled={lesson.isLocked}
                >
                  {lesson.progress === 100 
                    ? "✅ Review Lesson" 
                    : lesson.progress > 0 
                      ? "▶️ Continue" 
                      : "🚀 Start Lesson"}
                </button>
              </div>
            ))}
          </div>

          {filteredLessons.length === 0 && (
            <div style={{
              ...styles.emptyState,
              background: isDarkMode ? "#1e1e35" : "white",
            }}>
              <span style={styles.emptyIcon}>🔍</span>
              <h3 style={{ ...styles.emptyTitle, color: isDarkMode ? "#e5e7eb" : "#1f2937" }}>No lessons found</h3>
              <p style={{ ...styles.emptyText, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                style={styles.resetBtn}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    gap: "1rem",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  main: {
    flex: 1,
    marginLeft: "260px",
    padding: "2rem",
    overflowY: "auto" as const,
  },
  pageHeader: {
    marginBottom: "2rem",
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  pageSubtitle: {
    color: "#6b7280",
    margin: "0.25rem 0 0 0",
  },
  statsSection: {
    marginBottom: "2rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  filterSection: {
    marginBottom: "2rem",
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  searchWrapper: {
    position: "relative" as const,
    flex: 1,
    maxWidth: "400px",
  },
  searchIcon: {
    position: "absolute" as const,
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 2.75rem",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s ease",
    background: "white",
  },
  resultsCount: {
    fontSize: "0.9rem",
    color: "#6b7280",
    fontWeight: 500,
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "0.75rem",
  },
  categoryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.875rem 1rem",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  categoryIcon: {
    fontSize: "1.1rem",
  },
  lessonsSection: {
    marginBottom: "2rem",
  },
  lessonsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  },
  lessonCard: {
    background: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "2px solid #f3f4f6",
    transition: "all 0.3s ease",
    position: "relative" as const,
    overflow: "hidden",
  },
  lockedOverlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backdropFilter: "blur(2px)",
  },
  lockIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  lockText: {
    fontSize: "0.85rem",
    color: "#6b7280",
    textAlign: "center" as const,
  },
  lessonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  lessonIcon: {
    fontSize: "2.5rem",
    transition: "transform 0.3s ease",
  },
  levelBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "white",
  },
  lessonTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 0.5rem 0",
    lineHeight: 1.3,
  },
  lessonDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 1rem 0",
    lineHeight: 1.6,
  },
  lessonMeta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap" as const,
  },
  metaItem: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  progressSection: {
    marginBottom: "1rem",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressLabel: {
    fontSize: "0.8rem",
    color: "#6b7280",
    fontWeight: 500,
  },
  progressPercent: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  progressBarBg: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  startBtn: {
    width: "100%",
    padding: "0.875rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  emptyIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#6b7280",
    margin: "0 0 1.5rem 0",
  },
  resetBtn: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
