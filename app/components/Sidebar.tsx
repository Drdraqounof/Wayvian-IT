"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  userInitial?: string;
}

const navItems: NavItem[] = [
  { id: "overview", icon: "📊", label: "Overview", path: "/dashboard" },
  { id: "lessons", icon: "📖", label: "Lessons", path: "/lessons" },
  { id: "code", icon: "💻", label: "Code Editor", path: "/code" },
  { id: "profile", icon: "👤", label: "Profile", path: "/profile" },
  { id: "settings", icon: "⚙️", label: "Settings", path: "/settings" },
];

export default function Sidebar({ isMenuOpen, setIsMenuOpen, userInitial = "U" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("assessmentCompleted");
    router.push("/");
  };

  const handleNavClick = (item: NavItem) => {
    router.push(item.path);
    setIsMenuOpen(false);
  };

  const isActive = (item: NavItem) => {
    if (item.path === "/dashboard" && pathname === "/dashboard") return true;
    if (item.path === "/lessons" && pathname === "/lessons") return true;
    if (item.path === "/code" && pathname === "/code") return true;
    if (item.path === "/settings" && pathname === "/settings") return true;
    if (item.path === "/profile" && pathname === "/profile") return true;
    return false;
  };

  return (
    <>
      <style>{`
        .sidebar-nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sidebar-nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          border-left: 3px solid white;
        }
        .sidebar-logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 1024px) {
          .sidebar {
            display: none;
          }
          .sidebar.mobile-open {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
          }
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="mobile-header" style={styles.mobileHeader}>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={styles.menuButton}>
          ☰
        </button>
        <span style={styles.mobileLogo}>🚀 Wayvian</span>
        <div style={styles.mobileAvatar}>{userInitial}</div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMenuOpen ? "mobile-open" : ""}`} style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🚀</span>
            <span style={styles.logoText}>Wayvian</span>
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive(item) ? "active" : ""}`}
                onClick={() => handleNavClick(item)}
                style={styles.navItem}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={styles.sidebarFooter}>
            <button onClick={handleLogout} style={styles.logoutButton} className="sidebar-logout-btn">
              🚪 Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  mobileHeader: {
    display: "none",
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    zIndex: 100,
  },
  menuButton: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  mobileLogo: {
    color: "white",
    fontWeight: 700,
    fontSize: "1.25rem",
  },
  mobileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "white",
    color: "#667eea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    position: "fixed" as const,
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 50,
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "1.5rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },
  logoIcon: {
    fontSize: "2rem",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.875rem 1rem",
    border: "none",
    background: "transparent",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
  },
  navIcon: {
    fontSize: "1.25rem",
  },
  sidebarFooter: {
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.2)",
  },
  logoutButton: {
    width: "100%",
    padding: "0.875rem",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background 0.2s ease",
  },
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
};
