"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  submittedAt: string;
}

interface CareerPath {
  title: string;
  match: number;
  icon: string;
  description: string;
  skills: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!savedData) {
      router.push("/login");
      return;
    }
    setUserData(savedData);
  }, [router]);

  const careerPaths: CareerPath[] = [
    {
      title: "Software Developer",
      match: 92,
      icon: "💻",
      description: "Build applications and systems using programming languages",
      skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
    },
    {
      title: "Data Analyst",
      match: 85,
      icon: "📊",
      description: "Analyze data to help organizations make better decisions",
      skills: ["Python", "SQL", "Statistics", "Data Visualization"],
    },
    {
      title: "UX Designer",
      match: 78,
      icon: "🎨",
      description: "Create intuitive and engaging user experiences",
      skills: ["Figma", "User Research", "Prototyping", "Visual Design"],
    },
    {
      title: "Product Manager",
      match: 74,
      icon: "📋",
      description: "Lead product development from concept to launch",
      skills: ["Strategy", "Communication", "Analytics", "Leadership"],
    },
  ];

  const upcomingTasks = [
    { id: 1, title: "Complete Skills Assessment", deadline: "Today", priority: "high", icon: "📝" },
    { id: 2, title: "Watch: Interview Techniques", deadline: "Tomorrow", priority: "medium", icon: "🎬" },
    { id: 3, title: "Update Resume", deadline: "This Week", priority: "low", icon: "📄" },
    { id: 4, title: "Network: Tech Meetup", deadline: "Jan 25", priority: "medium", icon: "🤝" },
  ];

  const recentActivity = [
    { action: "Completed Python Basics course", time: "2 hours ago", icon: "✅" },
    { action: "Earned 'Quick Learner' badge", time: "Yesterday", icon: "🏆" },
    { action: "Updated career preferences", time: "2 days ago", icon: "⚙️" },
    { action: "Joined 'Tech Careers' community", time: "3 days ago", icon: "👥" },
  ];

  const learningProgress = [
    { course: "JavaScript Fundamentals", progress: 75, icon: "📚" },
    { course: "Data Science Intro", progress: 45, icon: "📈" },
    { course: "Communication Skills", progress: 90, icon: "🗣️" },
    { course: "Project Management", progress: 30, icon: "📊" },
  ];

  if (!userData) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboardWrapper}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes progressFill {
          from { width: 0%; }
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .task-item:hover {
          background: #f8fafc;
          transform: translateX(5px);
        }
        .career-card:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
        }
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 1rem !important;
            padding-top: 80px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .careers-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Sidebar Component */}
      <Sidebar 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        userInitial={userData.firstName[0]}
      />

      {/* Main Content */}
      <main className="main-content" style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.greeting}>
              Welcome back, {userData.firstName}! 👋
            </h1>
            <p style={styles.subGreeting}>
              Here's what's happening with your career journey today.
            </p>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.notificationBtn}>
              🔔
              <span style={styles.notificationBadge}>3</span>
            </button>
            <div style={styles.avatar}>
              {userData.firstName[0]}{userData.lastName[0]}
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid" style={styles.statsGrid}>
          <div className="card-hover" style={{ ...styles.statCard, borderTop: "4px solid #667eea" }}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>92%</span>
              <span style={styles.statLabel}>Career Match</span>
            </div>
          </div>
          <div className="card-hover" style={{ ...styles.statCard, borderTop: "4px solid #10b981" }}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>12</span>
              <span style={styles.statLabel}>Courses Completed</span>
            </div>
          </div>
          <div className="card-hover" style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
            <div style={styles.statIcon}>🏆</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>8</span>
              <span style={styles.statLabel}>Badges Earned</span>
            </div>
          </div>
          <div className="card-hover" style={{ ...styles.statCard, borderTop: "4px solid #ec4899" }}>
            <div style={styles.statIcon}>⏱️</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>45h</span>
              <span style={styles.statLabel}>Learning Time</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid" style={styles.dashboardGrid}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Career Matches */}
            <section className="card-hover" style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>🎯 Top Career Matches</h2>
                <button style={styles.viewAllBtn}>View All →</button>
              </div>
              <div className="careers-grid" style={styles.careersGrid}>
                {careerPaths.map((career, index) => (
                  <div key={index} className="career-card" style={styles.careerCard}>
                    <div style={styles.careerHeader}>
                      <span style={styles.careerIcon}>{career.icon}</span>
                      <div style={styles.matchBadge}>
                        <span style={styles.matchPercent}>{career.match}%</span>
                        <span style={styles.matchLabel}>Match</span>
                      </div>
                    </div>
                    <h3 style={styles.careerTitle}>{career.title}</h3>
                    <p style={styles.careerDesc}>{career.description}</p>
                    <div style={styles.skillTags}>
                      {career.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} style={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                    <button style={styles.exploreBtn}>Explore Path →</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Progress */}
            <section className="card-hover" style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>📈 Learning Progress</h2>
                <button style={styles.viewAllBtn}>See All Courses →</button>
              </div>
              <div style={styles.progressList}>
                {learningProgress.map((item, index) => (
                  <div key={index} style={styles.progressItem}>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressIcon}>{item.icon}</span>
                      <span style={styles.progressTitle}>{item.course}</span>
                      <span style={styles.progressPercent}>{item.progress}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${item.progress}%`,
                          background: item.progress >= 75 ? "#10b981" : item.progress >= 50 ? "#f59e0b" : "#667eea",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Upcoming Tasks */}
            <section className="card-hover" style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>📋 Upcoming Tasks</h2>
              </div>
              <div style={styles.taskList}>
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="task-item" style={styles.taskItem}>
                    <span style={styles.taskIcon}>{task.icon}</span>
                    <div style={styles.taskInfo}>
                      <span style={styles.taskTitle}>{task.title}</span>
                      <span style={styles.taskDeadline}>{task.deadline}</span>
                    </div>
                    <span
                      style={{
                        ...styles.priorityDot,
                        background:
                          task.priority === "high" ? "#ef4444" :
                          task.priority === "medium" ? "#f59e0b" : "#10b981",
                      }}
                    ></span>
                  </div>
                ))}
              </div>
              <button style={styles.addTaskBtn}>+ Add New Task</button>
            </section>

            {/* Recent Activity */}
            <section className="card-hover" style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>🕐 Recent Activity</h2>
              </div>
              <div style={styles.activityList}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={styles.activityItem}>
                    <span style={styles.activityIcon}>{activity.icon}</span>
                    <div style={styles.activityInfo}>
                      <span style={styles.activityAction}>{activity.action}</span>
                      <span style={styles.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="card-hover" style={styles.section}>
              <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
              <div style={styles.quickActions}>
                <button onClick={() => router.push('/lessons')} style={styles.quickActionBtn}>
                  📖 Browse Lessons
                </button>
                <button style={styles.quickActionBtn}>
                  📝 Take Assessment
                </button>
                <button style={styles.quickActionBtn}>
                  👥 Find Mentor
                </button>
                <button style={styles.quickActionBtn}>
                  💼 Job Board
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  dashboardWrapper: {
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
  mainContent: {
    flex: 1,
    marginLeft: "260px",
    padding: "2rem",
    overflowY: "auto" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  greeting: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  subGreeting: {
    color: "#6b7280",
    margin: "0.25rem 0 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  notificationBtn: {
    position: "relative" as const,
    background: "white",
    border: "none",
    padding: "0.75rem",
    borderRadius: "12px",
    fontSize: "1.25rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  notificationBadge: {
    position: "absolute" as const,
    top: "-4px",
    right: "-4px",
    background: "#ef4444",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "10px",
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "2.5rem",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1.5rem",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  section: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#667eea",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  careersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  careerCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1.25rem",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  careerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
  },
  careerIcon: {
    fontSize: "2rem",
  },
  matchBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  matchPercent: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#10b981",
  },
  matchLabel: {
    fontSize: "0.7rem",
    color: "#6b7280",
    textTransform: "uppercase" as const,
  },
  careerTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 0.5rem 0",
  },
  careerDesc: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: "0 0 0.75rem 0",
    lineHeight: 1.5,
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  skillTag: {
    background: "#eff6ff",
    color: "#3b82f6",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  exploreBtn: {
    width: "100%",
    padding: "0.625rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  progressList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  progressItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  progressHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  progressIcon: {
    fontSize: "1.25rem",
  },
  progressTitle: {
    flex: 1,
    fontWeight: 500,
    color: "#374151",
  },
  progressPercent: {
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
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.875rem",
    background: "#f9fafb",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  taskIcon: {
    fontSize: "1.25rem",
  },
  taskInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  taskTitle: {
    fontWeight: 600,
    color: "#1f2937",
    fontSize: "0.9rem",
  },
  taskDeadline: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  priorityDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  addTaskBtn: {
    marginTop: "1rem",
    width: "100%",
    padding: "0.75rem",
    background: "#f3f4f6",
    border: "2px dashed #d1d5db",
    borderRadius: "10px",
    color: "#6b7280",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
  },
  activityIcon: {
    fontSize: "1.25rem",
  },
  activityInfo: {
    display: "flex",
    flexDirection: "column",
  },
  activityAction: {
    fontWeight: 500,
    color: "#374151",
    fontSize: "0.9rem",
  },
  activityTime: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  quickActionBtn: {
    padding: "1rem",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.85rem",
  },
};
