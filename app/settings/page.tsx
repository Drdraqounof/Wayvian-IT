"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface UserData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyDigest: boolean;
    courseUpdates: boolean;
    promotions: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    fontSize: "small" | "medium" | "large";
    reducedMotion: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showProgress: boolean;
    showActivity: boolean;
  };
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      weeklyDigest: true,
      courseUpdates: true,
      promotions: false,
    },
    appearance: {
      theme: "dark",
      fontSize: "medium",
      reducedMotion: false,
    },
    privacy: {
      profileVisible: true,
      showProgress: true,
      showActivity: false,
    },
    language: "en",
    timezone: "UTC-5",
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!savedData) {
      router.push("/login");
      return;
    }
    setUserData(savedData);
    setProfile({
      firstName: savedData.firstName || "",
      lastName: savedData.lastName || "",
      email: savedData.email || "",
      phone: savedData.phone || "",
      bio: savedData.bio || "",
    });

    const savedSettings = JSON.parse(localStorage.getItem("userSettings") || "null");
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [router]);

  // Notification system
  const showNotification = useCallback((type: Notification["type"], title: string, message: string, duration = 4000) => {
    const id = Date.now().toString();
    const newNotification: Notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Test notification on push toggle
  const handleNotificationToggle = (key: string) => {
    const newValue = !(settings.notifications as Record<string, boolean>)[key];
    
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: newValue,
      },
    }));

    // Show notification pop-up when toggling
    const labels: Record<string, string> = {
      email: "Email Notifications",
      push: "Push Notifications",
      sms: "SMS Notifications",
      weeklyDigest: "Weekly Digest",
      courseUpdates: "Course Updates",
      promotions: "Promotional Emails",
    };
    
    showNotification(
      newValue ? "success" : "info",
      newValue ? "🔔 Enabled" : "🔕 Disabled",
      `${labels[key]} ${newValue ? "enabled" : "disabled"} successfully!`
    );
  };

  const sections = [
    { id: "account", icon: "👤", label: "Account" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "appearance", icon: "🎨", label: "Appearance" },
    { id: "privacy", icon: "🔒", label: "Privacy" },
    { id: "language", icon: "🌐", label: "Language & Region" },
    { id: "security", icon: "🛡️", label: "Security" },
    { id: "data", icon: "📊", label: "Data & Storage" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      localStorage.setItem("userData", JSON.stringify({
        ...userData,
        ...profile,
      }));
      setUserData({ ...userData, ...profile } as UserData);
      setIsSaving(false);
      setSaveMessage("Settings saved successfully!");
      showNotification("success", "✅ Saved!", "Your settings have been saved successfully.");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 800);
  };

  const handleToggle = (category: keyof Settings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [key]: !(prev[category] as Record<string, boolean>)[key],
      },
    }));
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem("userData");
      localStorage.removeItem("userSettings");
      localStorage.removeItem("assessmentCompleted");
      router.push("/");
    }
  };

  if (!userData) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p>Loading settings...</p>
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
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .settings-section:hover {
          background: #2d2d44;
        }
        .settings-section.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .toggle-switch {
          position: relative;
          width: 50px;
          height: 26px;
          background: #3d3d5c;
          border-radius: 13px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .toggle-switch.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .toggle-switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }
        .toggle-switch.active::after {
          transform: translateX(24px);
        }
        .input-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .danger-btn:hover {
          background: #dc2626;
        }
        .radio-option:hover {
          background: #2d2d44;
        }
        .radio-option.selected {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
            padding-top: 80px !important;
          }
          .settings-layout {
            flex-direction: column !important;
          }
          .settings-nav {
            width: 100% !important;
            flex-direction: row !important;
            overflow-x: auto !important;
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .notification-popup {
          animation: slideInRight 0.3s ease forwards;
        }
        .notification-popup:hover {
          transform: scale(1.02);
        }
        .notification-popup .dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Notification Pop-ups */}
      <div style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="notification-popup"
            style={{
              ...styles.notificationPopup,
              ...(notification.type === "success" ? styles.notificationSuccess : {}),
              ...(notification.type === "info" ? styles.notificationInfo : {}),
              ...(notification.type === "warning" ? styles.notificationWarning : {}),
              ...(notification.type === "error" ? styles.notificationError : {}),
            }}
          >
            <div style={styles.notificationContent}>
              <div style={styles.notificationIcon}>
                {notification.type === "success" && "✅"}
                {notification.type === "info" && "ℹ️"}
                {notification.type === "warning" && "⚠️"}
                {notification.type === "error" && "❌"}
              </div>
              <div style={styles.notificationText}>
                <strong style={styles.notificationTitle}>{notification.title}</strong>
                <p style={styles.notificationMessage}>{notification.message}</p>
              </div>
              <button
                className="dismiss-btn"
                onClick={() => dismissNotification(notification.id)}
                style={styles.dismissBtn}
              >
                ✕
              </button>
            </div>
            <div 
              style={{
                ...styles.notificationProgress,
                animation: `progressShrink ${notification.duration || 4000}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>

      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        userInitial={userData.firstName[0]}
      />

      <main className="main-content" style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>⚙️ Settings</h1>
            <p style={styles.pageSubtitle}>Manage your account and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...styles.saveBtn,
              opacity: isSaving ? 0.7 : 1,
            }}
            className="save-btn"
          >
            {isSaving ? "Saving..." : "💾 Save Changes"}
          </button>
        </header>

        {saveMessage && (
          <div style={styles.saveMessage}>
            ✅ {saveMessage}
          </div>
        )}

        <div className="settings-layout" style={styles.settingsLayout}>
          {/* Settings Navigation */}
          <nav className="settings-nav" style={styles.settingsNav}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`settings-section ${activeSection === section.id ? "active" : ""}`}
                style={{
                  ...styles.sectionBtn,
                  ...(activeSection === section.id ? styles.sectionBtnActive : {}),
                }}
              >
                <span style={styles.sectionIcon}>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Settings Content */}
          <div style={styles.settingsContent}>
            {/* Account Section */}
            {activeSection === "account" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👤 Account Information</h2>
                <p style={styles.sectionDesc}>Update your personal information</p>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      style={styles.input}
                      className="input-field"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      style={styles.input}
                      className="input-field"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={styles.input}
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={styles.input}
                      className="input-field"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    style={styles.textarea}
                    className="input-field"
                    placeholder="Tell us a little about yourself..."
                    rows={4}
                  />
                </div>

                <div style={styles.avatarSection}>
                  <div style={styles.avatar}>
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                  <div>
                    <h4 style={styles.avatarTitle}>Profile Photo</h4>
                    <p style={styles.avatarDesc}>JPG, PNG or GIF. Max size 2MB</p>
                    <button style={styles.uploadBtn}>📷 Upload Photo</button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🔔 Notification Preferences</h2>
                <p style={styles.sectionDesc}>Choose how you want to be notified</p>

                <div style={styles.settingsList}>
                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Email Notifications</h4>
                      <p style={styles.settingDesc}>Receive updates via email</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.email ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("email")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Push Notifications</h4>
                      <p style={styles.settingDesc}>Receive push notifications on your device</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.push ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("push")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>SMS Notifications</h4>
                      <p style={styles.settingDesc}>Receive text message alerts</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.sms ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("sms")}
                    />
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Weekly Digest</h4>
                      <p style={styles.settingDesc}>Summary of your learning progress</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.weeklyDigest ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("weeklyDigest")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Course Updates</h4>
                      <p style={styles.settingDesc}>New lessons and content notifications</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.courseUpdates ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("courseUpdates")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Promotional Emails</h4>
                      <p style={styles.settingDesc}>Special offers and announcements</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.notifications.promotions ? "active" : ""}`}
                      onClick={() => handleNotificationToggle("promotions")}
                    />
                  </div>

                  {/* Test Notification Button */}
                  <div style={{ ...styles.divider, marginBottom: "1rem" }} />
                  <button
                    onClick={() => showNotification(
                      "info",
                      "🔔 Test Notification",
                      "This is a test notification pop-up! It will disappear in 4 seconds."
                    )}
                    style={styles.testNotificationBtn}
                  >
                    🧪 Send Test Notification
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🎨 Appearance</h2>
                <p style={styles.sectionDesc}>Customize how Wayvian looks</p>

                <div style={styles.settingGroup}>
                  <h4 style={styles.settingLabel}>Theme</h4>
                  <div style={styles.radioGroup}>
                    {[
                      { id: "light", icon: "☀️", label: "Light" },
                      { id: "dark", icon: "🌙", label: "Dark" },
                      { id: "system", icon: "💻", label: "System" },
                    ].map((theme) => (
                      <div
                        key={theme.id}
                        className={`radio-option ${settings.appearance.theme === theme.id ? "selected" : ""}`}
                        style={{
                          ...styles.radioOption,
                          ...(settings.appearance.theme === theme.id ? styles.radioOptionSelected : {}),
                        }}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, theme: theme.id as "light" | "dark" | "system" },
                        }))}
                      >
                        <span style={styles.radioIcon}>{theme.icon}</span>
                        <span>{theme.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.settingGroup}>
                  <h4 style={styles.settingLabel}>Font Size</h4>
                  <div style={styles.radioGroup}>
                    {[
                      { id: "small", label: "Small", preview: "Aa" },
                      { id: "medium", label: "Medium", preview: "Aa" },
                      { id: "large", label: "Large", preview: "Aa" },
                    ].map((size) => (
                      <div
                        key={size.id}
                        className={`radio-option ${settings.appearance.fontSize === size.id ? "selected" : ""}`}
                        style={{
                          ...styles.radioOption,
                          ...(settings.appearance.fontSize === size.id ? styles.radioOptionSelected : {}),
                        }}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, fontSize: size.id as "small" | "medium" | "large" },
                        }))}
                      >
                        <span style={{
                          fontSize: size.id === "small" ? "0.8rem" : size.id === "medium" ? "1rem" : "1.2rem",
                          fontWeight: 600,
                        }}>{size.preview}</span>
                        <span>{size.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.settingItem}>
                  <div>
                    <h4 style={styles.settingLabel}>Reduced Motion</h4>
                    <p style={styles.settingDesc}>Minimize animations and transitions</p>
                  </div>
                  <div
                    className={`toggle-switch ${settings.appearance.reducedMotion ? "active" : ""}`}
                    onClick={() => handleToggle("appearance", "reducedMotion")}
                  />
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🔒 Privacy Settings</h2>
                <p style={styles.sectionDesc}>Control your privacy and visibility</p>

                <div style={styles.settingsList}>
                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Public Profile</h4>
                      <p style={styles.settingDesc}>Allow others to view your profile</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.privacy.profileVisible ? "active" : ""}`}
                      onClick={() => handleToggle("privacy", "profileVisible")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Show Learning Progress</h4>
                      <p style={styles.settingDesc}>Display your course progress publicly</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.privacy.showProgress ? "active" : ""}`}
                      onClick={() => handleToggle("privacy", "showProgress")}
                    />
                  </div>

                  <div style={styles.settingItem}>
                    <div>
                      <h4 style={styles.settingLabel}>Activity Status</h4>
                      <p style={styles.settingDesc}>Show when you are online</p>
                    </div>
                    <div
                      className={`toggle-switch ${settings.privacy.showActivity ? "active" : ""}`}
                      onClick={() => handleToggle("privacy", "showActivity")}
                    />
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>ℹ️</span>
                  <p>Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.</p>
                </div>
              </div>
            )}

            {/* Language Section */}
            {activeSection === "language" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🌐 Language & Region</h2>
                <p style={styles.sectionDesc}>Set your language and timezone preferences</p>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    style={styles.select}
                    className="input-field"
                  >
                    <option value="en">🇺🇸 English (US)</option>
                    <option value="en-gb">🇬🇧 English (UK)</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="ja">🇯🇵 日本語</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    style={styles.select}
                    className="input-field"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">GMT (UTC+0)</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                    <option value="UTC+8">China Standard Time (UTC+8)</option>
                    <option value="UTC+9">Japan Standard Time (UTC+9)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🛡️ Security</h2>
                <p style={styles.sectionDesc}>Manage your account security</p>

                <div style={styles.securityItem}>
                  <div style={styles.securityInfo}>
                    <h4 style={styles.settingLabel}>Password</h4>
                    <p style={styles.settingDesc}>Last changed 30 days ago</p>
                  </div>
                  <button style={styles.secondaryBtn}>Change Password</button>
                </div>

                <div style={styles.securityItem}>
                  <div style={styles.securityInfo}>
                    <h4 style={styles.settingLabel}>Two-Factor Authentication</h4>
                    <p style={styles.settingDesc}>Add an extra layer of security</p>
                  </div>
                  <button style={styles.secondaryBtn}>Enable 2FA</button>
                </div>

                <div style={styles.securityItem}>
                  <div style={styles.securityInfo}>
                    <h4 style={styles.settingLabel}>Active Sessions</h4>
                    <p style={styles.settingDesc}>Manage devices logged into your account</p>
                  </div>
                  <button style={styles.secondaryBtn}>View Sessions</button>
                </div>

                <div style={styles.divider} />

                <div style={styles.dangerZone}>
                  <h4 style={styles.dangerTitle}>⚠️ Danger Zone</h4>
                  <p style={styles.settingDesc}>Irreversible actions</p>
                  <button
                    onClick={handleDeleteAccount}
                    style={styles.dangerBtn}
                    className="danger-btn"
                  >
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Data Section */}
            {activeSection === "data" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📊 Data & Storage</h2>
                <p style={styles.sectionDesc}>Manage your data and storage</p>

                <div style={styles.storageCard}>
                  <div style={styles.storageHeader}>
                    <span>Storage Used</span>
                    <span>2.4 GB / 5 GB</span>
                  </div>
                  <div style={styles.storageBar}>
                    <div style={{ ...styles.storageProgress, width: "48%" }} />
                  </div>
                  <div style={styles.storageBreakdown}>
                    <div style={styles.storageItem}>
                      <span style={{ ...styles.storageDot, background: "#667eea" }} />
                      <span>Course Data</span>
                      <span>1.2 GB</span>
                    </div>
                    <div style={styles.storageItem}>
                      <span style={{ ...styles.storageDot, background: "#10b981" }} />
                      <span>Progress & Saves</span>
                      <span>800 MB</span>
                    </div>
                    <div style={styles.storageItem}>
                      <span style={{ ...styles.storageDot, background: "#f59e0b" }} />
                      <span>Cache</span>
                      <span>400 MB</span>
                    </div>
                  </div>
                </div>

                <div style={styles.dataActions}>
                  <button style={styles.secondaryBtn}>📥 Download My Data</button>
                  <button style={styles.secondaryBtn}>🗑️ Clear Cache</button>
                </div>
              </div>
            )}
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
    maxWidth: "1200px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  pageSubtitle: {
    color: "#9ca3af",
    margin: "0.25rem 0 0 0",
    fontSize: "0.95rem",
  },
  saveBtn: {
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
  saveMessage: {
    padding: "1rem",
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    borderRadius: "10px",
    color: "#10b981",
    marginBottom: "1.5rem",
    animation: "fadeIn 0.3s ease",
  },
  settingsLayout: {
    display: "flex",
    gap: "1.5rem",
  },
  settingsNav: {
    width: "220px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flexShrink: 0,
  },
  sectionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.875rem 1rem",
    border: "none",
    borderRadius: "10px",
    background: "#1a1a2e",
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    textAlign: "left",
  },
  sectionBtnActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  sectionIcon: {
    fontSize: "1.1rem",
  },
  settingsContent: {
    flex: 1,
    background: "#1a1a2e",
    borderRadius: "16px",
    padding: "1.5rem",
    animation: "fadeIn 0.3s ease",
  },
  section: {
    animation: "slideIn 0.3s ease",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  sectionDesc: {
    color: "#9ca3af",
    margin: "0 0 1.5rem 0",
    fontSize: "0.9rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
    marginBottom: "1rem",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    color: "#e5e7eb",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    background: "#0f0f23",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    background: "#0f0f23",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #2d2d44",
    borderRadius: "10px",
    background: "#0f0f23",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "1.5rem",
    background: "#16162a",
    borderRadius: "12px",
    marginTop: "1rem",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  avatarTitle: {
    color: "#e5e7eb",
    margin: "0 0 0.25rem 0",
    fontSize: "1rem",
  },
  avatarDesc: {
    color: "#9ca3af",
    margin: "0 0 0.75rem 0",
    fontSize: "0.85rem",
  },
  uploadBtn: {
    padding: "0.5rem 1rem",
    border: "1px solid #667eea",
    borderRadius: "8px",
    background: "transparent",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  settingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  settingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#16162a",
    borderRadius: "10px",
  },
  settingLabel: {
    color: "#e5e7eb",
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  settingDesc: {
    color: "#9ca3af",
    margin: "0.25rem 0 0 0",
    fontSize: "0.85rem",
  },
  divider: {
    height: "1px",
    background: "#2d2d44",
    margin: "1rem 0",
  },
  settingGroup: {
    marginBottom: "1.5rem",
  },
  radioGroup: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.75rem",
  },
  radioOption: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "#16162a",
    border: "2px solid transparent",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#9ca3af",
  },
  radioOptionSelected: {
    background: "rgba(102, 126, 234, 0.2)",
    borderColor: "#667eea",
    color: "#e5e7eb",
  },
  radioIcon: {
    fontSize: "1.5rem",
  },
  infoBox: {
    display: "flex",
    gap: "0.75rem",
    padding: "1rem",
    background: "rgba(102, 126, 234, 0.1)",
    border: "1px solid rgba(102, 126, 234, 0.3)",
    borderRadius: "10px",
    marginTop: "1.5rem",
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
  infoIcon: {
    fontSize: "1.25rem",
  },
  securityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#16162a",
    borderRadius: "10px",
    marginBottom: "0.75rem",
  },
  securityInfo: {},
  secondaryBtn: {
    padding: "0.5rem 1rem",
    border: "1px solid #2d2d44",
    borderRadius: "8px",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "all 0.2s ease",
  },
  dangerZone: {
    padding: "1.5rem",
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "12px",
    marginTop: "1rem",
  },
  dangerTitle: {
    color: "#ef4444",
    margin: "0 0 0.25rem 0",
    fontSize: "1rem",
  },
  dangerBtn: {
    padding: "0.75rem 1.25rem",
    border: "none",
    borderRadius: "8px",
    background: "#991b1b",
    color: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "1rem",
    transition: "all 0.2s ease",
  },
  storageCard: {
    padding: "1.5rem",
    background: "#16162a",
    borderRadius: "12px",
    marginBottom: "1.5rem",
  },
  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e5e7eb",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  },
  storageBar: {
    height: "8px",
    background: "#2d2d44",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  storageProgress: {
    height: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "4px",
  },
  storageBreakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  storageItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
  storageDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  dataActions: {
    display: "flex",
    gap: "1rem",
  },
  // Notification Pop-up Styles
  notificationContainer: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "400px",
    pointerEvents: "none",
  } as React.CSSProperties,
  notificationPopup: {
    background: "#1e1e32",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    overflow: "hidden",
    pointerEvents: "auto",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    border: "1px solid #2d2d44",
  } as React.CSSProperties,
  notificationSuccess: {
    borderLeft: "4px solid #22c55e",
    background: "linear-gradient(135deg, #1e1e32 0%, #1a2f1a 100%)",
  } as React.CSSProperties,
  notificationInfo: {
    borderLeft: "4px solid #667eea",
    background: "linear-gradient(135deg, #1e1e32 0%, #1a1a2f 100%)",
  } as React.CSSProperties,
  notificationWarning: {
    borderLeft: "4px solid #f59e0b",
    background: "linear-gradient(135deg, #1e1e32 0%, #2f2a1a 100%)",
  } as React.CSSProperties,
  notificationError: {
    borderLeft: "4px solid #ef4444",
    background: "linear-gradient(135deg, #1e1e32 0%, #2f1a1a 100%)",
  } as React.CSSProperties,
  notificationContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
  } as React.CSSProperties,
  notificationIcon: {
    fontSize: "1.5rem",
    lineHeight: 1,
  } as React.CSSProperties,
  notificationText: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  notificationTitle: {
    display: "block",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    marginBottom: "4px",
  } as React.CSSProperties,
  notificationMessage: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,
  dismissBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  notificationProgress: {
    height: "3px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "0 0 12px 12px",
  } as React.CSSProperties,
  testNotificationBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
};
