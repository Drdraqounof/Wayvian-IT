"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface UserData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export default function ProfilePage() {
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

  const stats = [
    { label: "Courses Completed", value: "12", icon: "🎓" },
    { label: "Hours Learned", value: "48", icon: "⏱️" },
    { label: "Certificates", value: "5", icon: "📜" },
    { label: "Current Streak", value: "7 days", icon: "🔥" },
  ];

  const achievements = [
    { id: 1, title: "First Steps", desc: "Complete your first lesson", icon: "👶", earned: true },
    { id: 2, title: "Quick Learner", desc: "Complete 5 lessons in one day", icon: "⚡", earned: true },
    { id: 3, title: "Code Master", desc: "Run 100 code snippets", icon: "💻", earned: true },
    { id: 4, title: "Week Warrior", desc: "Maintain a 7-day streak", icon: "🔥", earned: true },
    { id: 5, title: "Perfect Score", desc: "Get 100% on a quiz", icon: "💯", earned: false },
    { id: 6, title: "Night Owl", desc: "Study after midnight", icon: "🦉", earned: false },
  ];

  const recentActivity = [
    { action: "Completed", item: "JavaScript Basics", time: "2 hours ago", icon: "✅" },
    { action: "Started", item: "React Fundamentals", time: "5 hours ago", icon: "▶️" },
    { action: "Earned badge", item: "Week Warrior", time: "1 day ago", icon: "🏆" },
    { action: "Completed quiz", item: "HTML/CSS Assessment", time: "2 days ago", icon: "📝" },
  ];

  if (!userData) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        .achievement-card:hover {
          transform: scale(1.02);
        }
        .edit-btn:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
            padding-top: 80px !important;
          }
          .profile-header {
            flex-direction: column !important;
            text-align: center !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        userInitial={userData.firstName[0]}
      />

      <main className="main-content" style={styles.main}>
        {/* Profile Header */}
        <div className="profile-header" style={styles.profileHeader}>
          <div style={styles.profileLeft}>
            <div style={styles.avatarLarge}>
              {userData.firstName[0]}{userData.lastName[0]}
            </div>
            <div style={styles.profileInfo}>
              <h1 style={styles.profileName}>
                {userData.firstName} {userData.lastName}
              </h1>
              <p style={styles.profileEmail}>{userData.email || "Add your email in settings"}</p>
              <p style={styles.profileBio}>{userData.bio || "No bio yet. Tell us about yourself!"}</p>
              <div style={styles.profileTags}>
                <span style={styles.tag}>🎯 Career Explorer</span>
                <span style={styles.tag}>💻 Coder</span>
                <span style={styles.tag}>📚 Learner</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/settings")}
            style={styles.editBtn}
            className="edit-btn"
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={styles.statCard}>
              <span style={styles.statIcon}>{stat.icon}</span>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Achievements Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🏆 Achievements</h2>
            <div style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="achievement-card"
                  style={{
                    ...styles.achievementCard,
                    opacity: achievement.earned ? 1 : 0.5,
                  }}
                >
                  <span style={styles.achievementIcon}>{achievement.icon}</span>
                  <div style={styles.achievementInfo}>
                    <h4 style={styles.achievementTitle}>{achievement.title}</h4>
                    <p style={styles.achievementDesc}>{achievement.desc}</p>
                  </div>
                  {achievement.earned && (
                    <span style={styles.earnedBadge}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📋 Recent Activity</h2>
            <div style={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={styles.activityItem}>
                  <span style={styles.activityIcon}>{activity.icon}</span>
                  <div style={styles.activityInfo}>
                    <p style={styles.activityText}>
                      <span style={styles.activityAction}>{activity.action}</span>
                      {" "}{activity.item}
                    </p>
                    <span style={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📈 Learning Progress</h2>
          <div style={styles.progressGrid}>
            {[
              { name: "JavaScript", progress: 85, color: "#f7df1e" },
              { name: "Python", progress: 60, color: "#3776ab" },
              { name: "HTML/CSS", progress: 95, color: "#e34c26" },
              { name: "React", progress: 45, color: "#61dafb" },
            ].map((skill, index) => (
              <div key={index} style={styles.progressItem}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressName}>{skill.name}</span>
                  <span style={styles.progressPercent}>{skill.progress}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${skill.progress}%`,
                      background: skill.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f0f23",
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
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "2rem",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)",
    borderRadius: "20px",
    marginBottom: "1.5rem",
    animation: "fadeIn 0.5s ease",
  },
  profileLeft: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  avatarLarge: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "2rem",
    fontWeight: 700,
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
  },
  profileInfo: {},
  profileName: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  profileEmail: {
    color: "#9ca3af",
    margin: "0.25rem 0",
    fontSize: "0.95rem",
  },
  profileBio: {
    color: "#d1d5db",
    margin: "0.5rem 0",
    fontSize: "0.9rem",
    maxWidth: "400px",
  },
  profileTags: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    flexWrap: "wrap",
  },
  tag: {
    padding: "0.375rem 0.75rem",
    background: "rgba(102, 126, 234, 0.2)",
    borderRadius: "20px",
    color: "#a5b4fc",
    fontSize: "0.8rem",
  },
  editBtn: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    padding: "1.5rem",
    background: "#1a1a2e",
    borderRadius: "16px",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    display: "block",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  section: {
    padding: "1.5rem",
    background: "#1a1a2e",
    borderRadius: "16px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 1rem 0",
  },
  achievementsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  achievementCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "#16162a",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    cursor: "default",
    position: "relative",
  },
  achievementIcon: {
    fontSize: "1.5rem",
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: "#e5e7eb",
    margin: 0,
    fontSize: "0.95rem",
  },
  achievementDesc: {
    color: "#9ca3af",
    margin: "0.125rem 0 0 0",
    fontSize: "0.8rem",
  },
  earnedBadge: {
    width: "24px",
    height: "24px",
    background: "#10b981",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "#16162a",
    borderRadius: "10px",
  },
  activityIcon: {
    fontSize: "1.25rem",
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    color: "#e5e7eb",
    margin: 0,
    fontSize: "0.9rem",
  },
  activityAction: {
    color: "#667eea",
    fontWeight: 600,
  },
  activityTime: {
    color: "#9ca3af",
    fontSize: "0.8rem",
  },
  progressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  progressItem: {
    padding: "1rem",
    background: "#16162a",
    borderRadius: "10px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressName: {
    color: "#e5e7eb",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  progressPercent: {
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
  progressBar: {
    height: "8px",
    background: "#2d2d44",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
};
