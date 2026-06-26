import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Scripts from './pages/Scripts';
import Homework from './pages/Homework';
import Personas from './pages/Personas';
import Topics from './pages/Topics';
import Masterclass from './pages/Masterclass';
import Growth from './pages/Growth';
import SimExam from './pages/SimExam';
import Studio from './pages/Studio';
import Practice from './pages/Practice';
import LandingPage from './pages/LandingPage';
import MagneticButton from './components/MagneticButton';

// MD3 Clean SVG Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LearnIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PracticeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12h1m3 0h1m-1-3V6a1 1 0 011-1h1a1 1 0 011 1v3m0 0h4m0 0V6a1 1 0 011-1h1a1 1 0 011 1v3m0 0h1m3 0h1m-1 0a2 2 0 01-2 2h-1m-8 0a2 2 0 00-2 2m2-2a2 2 0 012 2m-2-4h8m-8 4v3a1 1 0 001 1h1a1 1 0 001-1v-3m4 0v3a1 1 0 001 1h1a1 1 0 001-1v-3" />
  </svg>
);

const SimIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const navItems = [
  { path: '/dashboard', icon: HomeIcon, label: '首页', end: true },
  { path: '/learn', icon: LearnIcon, label: '学习' },
  { path: '/practice', icon: PracticeIcon, label: '日常练习' },
  { path: '/sim', icon: SimIcon, label: '模拟考核' },
  { path: '/activity', icon: ActivityIcon, label: '活动' },
];

// 主播中心布局组件（带侧边栏）
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  const handleLogoClick = () => {
    setTransitioning(true);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  return (
    <div className="flex h-screen min-w-[1024px] font-['Roboto',sans-serif]" style={{ background: '#FFFBFE' }}>
      {/* 切屏过渡遮罩 */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          background: 'radial-gradient(ellipse at center, #0e100f 0%, #1a1520 100%)',
          opacity: transitioning ? 1 : 0,
        }}
      />
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col relative overflow-hidden" style={{ background: '#F3EDF7' }}>
        {/* Decorative organic blur shapes */}
        <div className="absolute top-[-40px] left-[-30px] w-40 h-40 rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: '#D0BCFF' }} />
        <div className="absolute bottom-[100px] right-[-50px] w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: '#EFB8C8' }} />
        <div className="absolute top-[45%] left-[-20px] w-32 h-32 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: '#CCC2DC' }} />

        {/* Logo */}
        <div
          className="px-5 pt-6 pb-4 cursor-pointer relative z-10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          onClick={handleLogoClick}
        >
          <div className="rounded-2xl px-3 py-2.5 flex items-center justify-center shadow-sm" style={{ background: '#FFFBFE' }}>
            <img src="/logo-horizontal.png" alt="捞月狗" className="h-10 object-contain" />
          </div>
          <p className="text-xs text-center mt-2.5 tracking-wider font-medium" style={{ color: '#49454F' }}>主播中心</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 relative z-10">
          {navItems.map(({ path, icon: Icon, label, end }) => (
            <MagneticButton key={path} strength={0.3}>
              <NavLink
                to={path}
                end={end}
                className={({ isActive }) => {
                  const active = isActive || (!end && location.pathname.startsWith(path));
                  return `flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    active
                      ? 'shadow-sm'
                      : 'hover:opacity-80'
                  }`;
                }}
                style={({ isActive }) => {
                  const active = isActive || (!end && location.pathname.startsWith(path));
                  return active
                    ? { background: '#E8DEF8', color: '#1D192B' }
                    : { color: '#49454F' };
                }}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            </MagneticButton>
          ))}
        </nav>

        {/* User avatar area */}
        <div className="px-4 py-4 relative z-10">
          <div className="rounded-2xl p-3.5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]" style={{ background: '#FFFBFE', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #D0BCFF 0%, #7F67BE 100%)' }}>
                N
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1D192B' }}>Nora</p>
                <p className="text-xs" style={{ color: '#49454F' }}>欢迎回来</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative" style={{ background: '#FFFBFE' }}>
        {/* Subtle decorative blur in main content area */}
        <div className="absolute top-[10%] right-[-80px] w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#D0BCFF' }} />
        <div className="absolute bottom-[5%] left-[10%] w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#EFB8C8' }} />

        <div className="relative z-10">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/scripts" element={<Scripts />} />
            <Route path="/learn/homework" element={<Homework />} />
            <Route path="/learn/personas" element={<Personas />} />
            <Route path="/learn/topics" element={<Topics />} />
            <Route path="/learn/masterclass" element={<Masterclass />} />
            <Route path="/learn/growth" element={<Growth />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/sim" element={<SimExam />} />
            <Route path="/sim/:sceneId" element={<Studio />} />
            <Route path="/activity" element={<ActivityPlaceholder />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

function ActivityPlaceholder() {
  return (
    <div className="p-8 font-['Roboto',sans-serif]">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#1D192B' }}>活动中心</h1>
      <div className="rounded-3xl p-12 text-center transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]" style={{ background: '#F3EDF7' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#FFDAD6' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#BA1A1A' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#1D192B' }}>活动即将上线</h2>
        <p className="text-sm" style={{ color: '#49454F' }}>精彩平台活动正在筹备中，敬请期待</p>
      </div>
    </div>
  );
}

export default App;
