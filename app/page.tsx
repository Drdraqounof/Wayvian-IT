"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const waves = [
      { color: 'rgba(59, 130, 246, 0.7)', speed: 0.03, amplitude: 60, frequency: 0.003, offset: -50 },
      { color: 'rgba(37, 99, 235, 0.6)', speed: 0.035, amplitude: 80, frequency: 0.0055, offset: 20 },
      { color: 'rgba(147, 51, 234, 0.5)', speed: 0.025, amplitude: 55, frequency: 0.004, offset: 50 }
    ];

    function drawWave(wave: { color: string; speed: number; amplitude: number; frequency: number; offset: number }, time: number) {
      ctx!.beginPath();
      ctx!.moveTo(0, canvas!.height);

      for (let x = 0; x < canvas!.width; x++) {
        const y = canvas!.height / 2 + 
          Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7) * wave.amplitude * 0.5 +
          wave.offset;
        
        if (x === 0) {
          ctx!.moveTo(x, y);
        } else {
          ctx!.lineTo(x, y);
        }
      }

      ctx!.lineTo(canvas!.width, canvas!.height);
      ctx!.lineTo(0, canvas!.height);
      ctx!.closePath();
      ctx!.fillStyle = wave.color;
      ctx!.fill();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      time += 1;
      waves.forEach(wave => drawWave(wave, time));
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
        }
      });
    }, observerOptions);

    const fadeEls = document.querySelectorAll(".fade-in");
    fadeEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    const handleClick = (e: Event) => {
      e.preventDefault();
      const target = document.querySelector((e.currentTarget as HTMLAnchorElement).getAttribute("href") || "");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsMenuOpen(false);
      }
    };
    anchors.forEach((a) => a.addEventListener("click", handleClick));
    return () => anchors.forEach((a) => a.removeEventListener("click", handleClick));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <style suppressHydrationWarning>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #111827; background-color: #ffffff; }
        .min-h-screen { min-height: 100vh; }
        .container { max-width: 1280px; margin-left: auto; margin-right: auto; }
        header { background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: sticky; top: 0; z-index: 50; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
        .nav-title { font-size: 1.5rem; font-weight: 700; color: #1f2937; transition: transform 0.3s ease; }
        .nav-title:hover { transform: scale(1.05); }
        .hamburger { display: none; flex-direction: column; gap: 4px; cursor: pointer; padding: 8px; }
        .hamburger span { width: 25px; height: 3px; background-color: #1f2937; transition: all 0.3s ease; border-radius: 2px; }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
        nav ul { display: flex; gap: 1.5rem; list-style: none; align-items: center; }
        nav ul li a, nav ul li button { font-size: 0.875rem; font-weight: 500; color: #374151; text-decoration: none; background: none; border: none; cursor: pointer; transition: all 0.3s ease; padding: 0.5rem 1rem; border-radius: 0.5rem; position: relative; }
        nav ul li a:hover, nav ul li button:hover { color: #2563eb; background-color: #eff6ff; }
        .login-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 0.5rem 1.5rem !important; border-radius: 0.5rem; font-weight: 600; transition: all 0.3s ease; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          nav ul { position: absolute; top: 100%; left: 0; right: 0; background-color: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); flex-direction: column; padding: 1rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); transform: translateY(-100%); opacity: 0; pointer-events: none; transition: all 0.3s ease; }
          nav ul.open { transform: translateY(0); opacity: 1; pointer-events: all; }
          nav ul li { width: 100%; text-align: center; }
          nav ul li a, nav ul li button { display: block; width: 100%; padding: 1rem; }
        }
        .hero-section { position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 8rem 0; overflow: hidden; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .wave-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .hero-content { position: relative; z-index: 10; text-align: center; padding: 0 1.5rem; animation: fadeInUp 1s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hero-section h1 { font-size: 4rem; font-weight: 800; margin-bottom: 1.5rem; filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3)); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); letter-spacing: -0.02em; }
        .hero-section p { font-size: 1.5rem; max-width: 48rem; margin: 0 auto 2rem; line-height: 1.75; filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3)); text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3); }
        .cta-button { display: inline-block; background-color: white; color: #667eea; padding: 1rem 2.5rem; border-radius: 0.75rem; font-size: 1.125rem; font-weight: 700; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); margin-top: 1rem; }
        .cta-button:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); background-color: #f8fafc; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent); z-index: 5; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.5; } }
        .floating-shape { position: absolute; z-index: 2; animation: float 6s ease-in-out infinite; }
        .shape-1 { top: 10%; left: 10%; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; }
        .shape-2 { top: 60%; right: 15%; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.15); border-radius: 10px; animation: pulse 5s ease-in-out infinite; animation-delay: 1s; }
        .shape-3 { bottom: 15%; left: 20%; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.1); clip-path: polygon(50% 0%, 100% 100%, 0% 100%); animation-delay: 2s; animation-duration: 8s; }
        main { padding: 4rem 1.5rem; }
        section { margin-bottom: 6rem; }
        .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .fade-in.opacity-100 { opacity: 1; transform: translateY(0); }
        section h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem; text-align: center; color: #1f2937; position: relative; padding-bottom: 1rem; }
        section h2::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 2px; }
        .grid { display: grid; gap: 2rem; }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 768px) { 
          .grid-3, .grid-2 { grid-template-columns: 1fr; }
          .hero-section { padding: 4rem 0; min-height: 80vh; }
          .hero-section h1 { font-size: 2.5rem; }
          .hero-section p { font-size: 1.1rem; }
          .cta-button { padding: 0.875rem 2rem; font-size: 1rem; }
          section h2 { font-size: 2rem; }
          .nav-title { font-size: 1.25rem; }
          main { padding: 2rem 1rem; }
          section { margin-bottom: 4rem; }
          .card { padding: 1.5rem; }
          .card h3 { font-size: 1.25rem; }
          .audience-item { font-size: 1rem; padding: 1.25rem; }
          .floating-shape { display: none; }
        }
        .card { padding: 2rem; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 1rem; border: 1px solid #f3f4f6; transition: all 0.3s ease; }
        .card:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15); transform: translateY(-5px); border-color: #667eea; }
        .card h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; }
        .card p { color: #4b5563; line-height: 1.75; }
        .max-w-4xl { max-width: 56rem; margin: 0 auto; }
        .audience-item { padding: 1.5rem; background-color: #eff6ff; border-radius: 0.75rem; font-size: 1.125rem; font-weight: 500; color: #374151; transition: all 0.3s ease; }
        .audience-item:hover { background-color: #dbeafe; transform: translateX(10px); }
        .timeline-container { position: relative; padding: 2rem 0; }
        .timeline-item { position: relative; margin-bottom: 3rem; padding-left: 3.5rem; }
        .timeline-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: -3rem; width: 3px; background: linear-gradient(to bottom, #667eea, #764ba2); }
        .timeline-item:last-child::before { bottom: 0; }
        .timeline-badge { position: absolute; left: -0.75rem; top: 0; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.5rem 1rem; border-radius: 1rem; font-weight: 700; font-size: 0.875rem; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4); z-index: 10; }
        .timeline-card { margin-top: -0.5rem; }
        .timeline-card ul { margin-top: 1rem; }
        .timeline-card li { margin-bottom: 0.5rem; }
        @media (max-width: 768px) { 
          .timeline-item { padding-left: 2rem; }
          .timeline-badge { left: -0.5rem; padding: 0.4rem 0.8rem; font-size: 0.75rem; }
          .timeline-item::before { width: 2px; }
          .timeline-card ul { padding-left: 1rem; }
          .timeline-card li { font-size: 0.9rem; margin-bottom: 0.75rem; }
        }
        .scroll-to-top { position: fixed; bottom: 2rem; right: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 50px; height: 50px; border-radius: 50%; border: none; cursor: pointer; font-size: 1.5rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); transition: all 0.3s ease; opacity: 0; pointer-events: none; }
        .scroll-to-top.visible { opacity: 1; pointer-events: all; }
        @media (max-width: 768px) {
          .scroll-to-top { bottom: 1.5rem; right: 1.5rem; width: 45px; height: 45px; font-size: 1.25rem; }
        }
      `}</style>
      
      <header>
        <nav className="container">
          <div className="nav-title">🚀 Wayvian your Career Navigator</div>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className={isMenuOpen ? 'open' : ''}>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#project-timeline">Project Plan</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#tech">Tech Stack</a></li>
            <li><button onClick={() => handleNavigation("/login")} className="login-btn">Login</button></li>
          </ul>
        </nav>
      </header>

      <section ref={heroRef} className="hero-section">
        <canvas ref={canvasRef} className="wave-canvas"></canvas>
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>Wayvian</h1>
          <p>Empowering students, graduates, and career changers with personalized guidance based on real job market trends</p>
          <a href="#overview" className="cta-button">Get Started →</a>
        </div>
      </section>

      <main className="container">
        <section id="overview" className="fade-in">
          <h2>Project Overview</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>🎯 What It Does</h3>
              <p>Wayvian helps users discover which careers suit them best, what skills they need, and the actionable steps to reach their goals, all based on real job market trends.</p>
            </div>
            <div className="card">
              <h3>🏗️ Development Approach</h3>
              <p>Built with Agile methodology over 6 weeks in 3 sprints. We prioritized core features first, then layered in advanced functionality.</p>
            </div>
            <div className="card">
              <h3>📊 Smart Insights</h3>
              <p>Improves resumes, identifies skill gaps, and generates actionable career plans. Recommendations adapt dynamically to evolving job market trends.</p>
            </div>
          </div>
        </section>

        <section id="audience" className="fade-in">
          <h2>Who It's For</h2>
          <div className="grid grid-2 max-w-4xl">
            <div className="audience-item">🎓 High school seniors planning college or careers</div>
            <div className="audience-item">👨‍🎓 Recent graduates entering the job market</div>
            <div className="audience-item">🔄 Career changers exploring new opportunities</div>
            <div className="audience-item">🔍 Anyone seeking smarter job search strategies</div>
          </div>
        </section>

        <section id="project-timeline" className="fade-in">
          <h2>Ten-Week Development Journey</h2>
          <div className="max-w-4xl" style={{ margin: '0 auto' }}>
            <div className="timeline-container">
              <div className="timeline-item">
                <div className="timeline-badge">Week 1-2</div>
                <div className="timeline-card card">
                  <h3>🎯 Sprint 1: Foundation & Setup</h3>
                  <ul style={{ color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>Project initialization with React, Vite, and React Router</li>
                    <li>Development environment configuration</li>
                    <li>Component architecture planning and file structure</li>
                    <li>Design system and UI component library setup</li>
                    <li>Git repository and version control workflow</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-badge">Week 3-4</div>
                <div className="timeline-card card">
                  <h3>🔐 Sprint 2: Authentication & Onboarding</h3>
                  <ul style={{ color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>User authentication and login system</li>
                    <li>Multi-step onboarding flow implementation</li>
                    <li>User data collection and storage with localStorage</li>
                    <li>Career assessment quiz design and logic</li>
                    <li>Form validation and error handling</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-badge">Week 5-6</div>
                <div className="timeline-card card">
                  <h3>🤖 Sprint 3: AI Integration & Chat</h3>
                  <ul style={{ color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>OpenAI API integration for career guidance</li>
                    <li>Conversational AI chat interface with memory</li>
                    <li>Context-aware response generation</li>
                    <li>Chat history persistence and management</li>
                    <li>Feature-specific AI assistants implementation</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-badge">Week 7-8</div>
                <div className="timeline-card card">
                  <h3>📊 Sprint 4: Dashboard & Features</h3>
                  <ul style={{ color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>Personalized dashboard with user-type configurations</li>
                    <li>Professional events and networking page</li>
                    <li>Profile management and content sharing</li>
                    <li>Lesson plan generator with learning paths</li>
                    <li>Settings and preferences customization</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-badge">Week 9-10</div>
                <div className="timeline-card card">
                  <h3>✨ Sprint 5: Polish & Deployment</h3>
                  <ul style={{ color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
                    <li>UI/UX refinements and responsive design optimization</li>
                    <li>Cross-browser testing and accessibility improvements</li>
                    <li>Premium features and paywall implementation</li>
                    <li>Performance optimization and code splitting</li>
                    <li>Production deployment to Vercel with CI/CD</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="fade-in">
          <h2>Key Features</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>🛤️ Onboarding Flow</h3>
              <p>Answer personalized questions to receive tailored career guidance and recommendations.</p>
            </div>
            <div className="card">
              <h3>🔍 Explore Flow</h3>
              <p>Search and filter careers with detailed info on requirements, salaries, and growth potential.</p>
            </div>
            <div className="card">
              <h3>💾 Save & Compare</h3>
              <p>Bookmark careers and compare multiple paths side by side for better decision-making.</p>
            </div>
            <div className="card">
              <h3>📋 My Plan Page</h3>
              <p>View a summary of skill gaps and actionable next steps personalized to your profile.</p>
            </div>
            <div className="card">
              <h3>📄 Export Feature</h3>
              <p>Download your personalized career plan as PDF or Markdown for offline access.</p>
            </div>
            <div className="card">
              <h3>🎯 Career Testing</h3>
              <p>After completing the login page, take a quiz that assesses skills and interests for better career alignment.</p>
            </div>
          </div>
        </section>

        <section id="tech" className="fade-in">
          <h2>Technology Stack</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>Frontend</h3>
              <p>React 18+ with TypeScript, Vite</p>
            </div>
            <div className="card">
              <h3>State Management</h3>
              <p>Zustand or React Context</p>
            </div>
            <div className="card">
              <h3>Styling</h3>
              <p>TailwindCSS</p>
            </div>
            <div className="card">
              <h3>Routing & Forms</h3>
              <p>React Router, React Hook Form + Zod</p>
            </div>
            <div className="card">
              <h3>Hosting</h3>
              <p>Vercel</p>
            </div>
            <div className="card">
              <h3>Project Management</h3>
              <p>Trello for task tracking</p>
            </div>
          </div>
        </section>
      </main>

      <button className={`scroll-to-top ${scrollY > 300 ? 'visible' : ''}`} onClick={scrollToTop} style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.5rem',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        opacity: scrollY > 300 ? 1 : 0,
        pointerEvents: scrollY > 300 ? 'all' : 'none'
      }}>↑</button>
    </div>
  );
}