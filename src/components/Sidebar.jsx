import React from 'react';
import { NavLink } from 'react-router-dom';
import CodePulseLogo from './CodePulseLogo';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'overview', icon: '🏠', label: 'Repository Overview' },
  { id: 'impact', icon: '👥', label: 'Developer Impact' },
  { id: 'mapping', icon: '🔗', label: 'Requirement Mapping' },
  { id: 'risk', icon: '⚠️', label: 'Knowledge Risk' },
];

export default function Sidebar({ onSetup }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 backdrop-blur-xl flex flex-col z-30 transition-colors duration-300 ${
      isDark
        ? 'bg-dark-800/80 border-r border-white/5'
        : 'bg-white/90 border-r border-black/5 shadow-lg shadow-black/5'
    }`}>
      {/* Logo */}
      <div className={`px-6 py-5 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <div className="flex items-center gap-2.5">
          <CodePulseLogo size={34} />
          <span className="text-xl font-bold gradient-text">CodePulse</span>
        </div>
        <p className={`text-[11px] mt-1 font-medium tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Intelligence Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/dashboard/${item.id}`}
            className={({ isActive }) => `nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full text-left ${
              isActive
                ? 'active'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Setup / Connect Repo button */}
        {onSetup && (
          <button
            onClick={onSetup}
            className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full text-left mt-4 ${
              isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Setup / Connect Repo</span>
          </button>
        )}
      </nav>

      {/* Bottom section */}
      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <div className={`glass-card p-3 ${
          isDark
            ? '!bg-gradient-to-r !from-accent-blue/5 !to-accent-purple/5'
            : '!bg-gradient-to-r !from-green-50 !to-emerald-50'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Powered by AI</span>
          </div>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Real-time analysis active</p>
        </div>
      </div>
    </aside>
  );
}
