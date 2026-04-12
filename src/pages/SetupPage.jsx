import React, { useState, useRef } from 'react';
import CodePulseLogo from '../components/CodePulseLogo';
import { useTheme } from '../context/ThemeContext';
import { fetchRepository, analyzeRequirements } from '../services/api';

const STEPS = [
  { label: 'Fetching commits...', icon: '📡' },
  { label: 'Processing requirements...', icon: '🧠' },
  { label: 'Calculating impact scores...', icon: '📊' },
  { label: 'Detecting risks...', icon: '⚠️' },
  { label: 'Done ✓', icon: '✅' },
];

export default function SetupPage({ onComplete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (file.name.endsWith('.csv')) {
        // Parse CSV — take first column of each row
        const lines = text.split('\n')
          .map(line => line.split(',')[0]?.trim())
          .filter(Boolean);
        setRequirementsText(prev => prev ? prev + '\n' + lines.join('\n') : lines.join('\n'));
      } else {
        setRequirementsText(prev => prev ? prev + '\n' + text.trim() : text.trim());
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Fetch commits
      setCurrentStep(0);
      const repoData = await fetchRepository(repoUrl.trim(), token.trim());
      const repoId = repoData.repo_id;

      // Store in localStorage
      localStorage.setItem('codepulse_repo_id', String(repoId));
      localStorage.setItem('codepulse_repo_url', repoUrl.trim());
      localStorage.setItem('codepulse_repo_name', repoData.repo);

      // Step 2: Process requirements (if any)
      setCurrentStep(1);
      const requirements = requirementsText
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      if (requirements.length > 0) {
        await analyzeRequirements(requirements, repoId);
        localStorage.setItem('codepulse_requirements', JSON.stringify(requirements));
      }

      // Step 3: Impact scores (calculated on demand via dashboard)
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 500));

      // Step 4: Risk detection (calculated on demand via dashboard)
      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 500));

      // Step 5: Done
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 800));

      // Navigate to dashboard
      onComplete();
    } catch (err) {
      setError(err.detail || err.message || 'Something went wrong');
      setIsLoading(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-gradient-to-br from-gray-50 to-emerald-50/30'}`}>
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 ${
          isDark ? 'bg-blue-600' : 'bg-green-400'
        }`}></div>
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center px-8 py-5">
        <div className="flex items-center gap-2.5">
          <CodePulseLogo size={34} />
          <span className="text-xl font-bold gradient-text">CodePulse</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 pt-8 pb-20">
        <div className="animate-fade-in mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Connect your repository
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Enter your GitHub repo URL and business requirements to begin AI-powered analysis
          </p>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="glass-card p-8 mb-6 opacity-0 animate-slide-up stagger-1">
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Running Analysis...
            </h3>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
                    i < currentStep
                      ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-green-50 border border-green-200'
                      : i === currentStep
                        ? isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                        : isDark ? 'bg-dark-700/30 border border-white/5' : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${
                    i <= currentStep
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark ? 'text-slate-500' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {i < currentStep && (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {i === currentStep && i < STEPS.length - 1 && (
                    <div className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${
                      isDark ? 'border-blue-400' : 'border-blue-500'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className={`mt-6 w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
                isDark
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                ⚠️ {error}
              </div>
            )}

            {/* Repo URL */}
            <div className="glass-card p-6 opacity-0 animate-slide-up stagger-1">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                GitHub Repository URL
              </label>
              <input
                id="repo-url-input"
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className={`w-full px-4 py-3 rounded-lg text-sm transition-colors ${
                  isDark
                    ? 'bg-dark-700 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-200'
                } outline-none`}
              />
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Supports public and private repositories (with token)
              </p>
            </div>

            {/* GitHub Token (optional) */}
            <div className="glass-card p-6 opacity-0 animate-slide-up stagger-2">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                GitHub Token <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>(optional)</span>
              </label>
              <input
                id="github-token-input"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className={`w-full px-4 py-3 rounded-lg text-sm transition-colors ${
                  isDark
                    ? 'bg-dark-700 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-200'
                } outline-none`}
              />
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Required for private repositories or to increase API rate limits
              </p>
            </div>

            {/* Business Requirements */}
            <div className="glass-card p-6 opacity-0 animate-slide-up stagger-3">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Business Requirements
              </label>
              <textarea
                id="requirements-textarea"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Enter one requirement per line, e.g.:\nAdd user authentication\nImplement payment gateway\nBuild product search feature"
                rows={6}
                className={`w-full px-4 py-3 rounded-lg text-sm resize-none transition-colors ${
                  isDark
                    ? 'bg-dark-700 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-200'
                } outline-none`}
              />

              {/* File upload */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-dark-600 border border-white/10 text-slate-300 hover:bg-dark-500'
                      : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📎 Upload requirements (.txt / .csv)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="opacity-0 animate-slide-up stagger-4">
              <button
                id="run-analysis-btn"
                type="submit"
                className={`w-full py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25'
                }`}
              >
                🚀 Run Analysis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
