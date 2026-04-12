import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ repoName, onSetup }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const displayName = repoName || 'No repository connected';

  return (
    <header className={`fixed top-0 left-64 right-0 h-16 backdrop-blur-xl flex items-center justify-between px-6 z-20 transition-colors duration-300 ${
      isDark
        ? 'bg-dark-800/60 border-b border-white/5'
        : 'bg-white/70 border-b border-black/5 shadow-sm'
    }`}>
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Dashboard</span>
        <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>/</span>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Analytics</span>
      </div>

      {/* Center — Repository selector */}
      <button
        onClick={onSetup}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
          isDark
            ? 'bg-dark-700/60 border border-white/5 hover:border-accent-blue/20'
            : 'bg-gray-50 border border-gray-200 hover:border-green-300'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${repoName ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{displayName}</span>
        <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Right — Theme toggle + notification + avatar */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button className={`relative p-2 rounded-lg transition-colors ${
          isDark
            ? 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-1)' }}></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
          JD
        </div>
      </div>
    </header>
  );
}
