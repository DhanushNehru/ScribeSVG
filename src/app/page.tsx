"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface BuilderConfig {
  lines: string[];
  width: number;
  height: number;
  font: string;
  size: number;
  weight: number;
  letterSpacing: number;
  color: string;
  enableGradient: boolean;
  gradient: string[];
  gradientAngle: number;
  background: string;
  isBgTransparent: boolean;
  speed: number;
  deleteSpeed: number;
  pause: number;
  cursor: 'pipe' | 'block' | 'underscore' | 'none';
  cursorColor: string;
  cursorGlow: number;
  textGlow: number;
  center: boolean; // hCenter
  vCenter: boolean;
  loop: boolean;
  layout: 'raw' | 'terminal' | 'card';
  theme: string;
  attribution: boolean;
}

const DEFAULT_CONFIG: BuilderConfig = {
  lines: ['Hello World', 'Rebuilding in Next.js', 'Attracting Sponsors'],
  width: 600,
  height: 120,
  font: 'Fira Code',
  size: 24,
  weight: 400,
  letterSpacing: 0,
  color: '#36bcf7',
  enableGradient: false,
  gradient: ['#ff79c6', '#bd93f9'],
  gradientAngle: 90,
  background: '#282a36',
  isBgTransparent: true,
  speed: 100,
  deleteSpeed: 50,
  pause: 1500,
  cursor: 'pipe',
  cursorColor: '',
  cursorGlow: 0,
  textGlow: 0,
  center: false,
  vCenter: true,
  loop: true,
  layout: 'raw',
  theme: 'none',
  attribution: true
};

const POPULAR_FONTS = [
  'Fira Code',
  'Inter',
  'Orbitron',
  'VT323',
  'Source Code Pro',
  'Outfit',
  'Comfortaa',
  'Press Start 2P',
  'Major Mono Display',
  'Roboto',
  'Montserrat',
  'JetBrains Mono',
  'Space Mono',
  'Share Tech Mono'
];

interface ThemePreset {
  name: string;
  label: string;
  color: string;
  gradient?: string[];
  background: string;
  isBgTransparent: boolean;
  cursorColor: string;
  font: string;
  layout?: 'raw' | 'terminal' | 'card';
  cursorGlow?: number;
  textGlow?: number;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'dracula',
    label: 'Dracula 🧛',
    color: '#f8f8f2',
    gradient: ['#ff79c6', '#bd93f9'],
    background: '#282a36',
    isBgTransparent: false,
    cursorColor: '#50fa7b',
    font: 'Fira Code',
    layout: 'terminal'
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk ⚡',
    color: '#fcee0a',
    gradient: ['#00f0ff', '#ff007f'],
    background: '#030313',
    isBgTransparent: false,
    cursorColor: '#00f0ff',
    font: 'Orbitron',
    layout: 'terminal',
    cursorGlow: 4,
    textGlow: 2
  },
  {
    name: 'tokyonight',
    label: 'Tokyo Night 🌆',
    color: '#a9b1d6',
    gradient: ['#7abcff', '#bb9af7'],
    background: '#1a1b26',
    isBgTransparent: false,
    cursorColor: '#ff9e64',
    font: 'Inter',
    layout: 'card'
  },
  {
    name: 'nord',
    label: 'Nordic Ice ❄️',
    color: '#88c0d0',
    gradient: ['#8fbcbb', '#88c0d0'],
    background: '#2e3440',
    isBgTransparent: false,
    cursorColor: '#d8dee9',
    font: 'Source Code Pro',
    layout: 'raw'
  },
  {
    name: 'synthwave',
    label: 'Synthwave 🌴',
    color: '#fede5d',
    gradient: ['#fe4450', '#ff7edb', '#2de2e6'],
    background: '#2b0f54',
    isBgTransparent: false,
    cursorColor: '#ff7edb',
    font: 'Outfit',
    layout: 'card',
    cursorGlow: 5,
    textGlow: 3
  },
  {
    name: 'matrix',
    label: 'Matrix 💊',
    color: '#00ff00',
    background: '#000000',
    isBgTransparent: false,
    cursorColor: '#33ff33',
    font: 'VT323',
    layout: 'terminal'
  },
  {
    name: 'sunset',
    label: 'Sunset Glow 🌇',
    color: '#ffffff',
    gradient: ['#ff5e62', '#ff9966'],
    background: '#120015',
    isBgTransparent: false,
    cursorColor: '#ff5e62',
    font: 'Comfortaa',
    layout: 'raw'
  }
];

export default function BuilderPage() {
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [previewBg, setPreviewBg] = useState<'transparent' | 'gh-dark' | 'gh-light' | 'dark'>('transparent');
  const [activeTab, setActiveTab] = useState<'markdown' | 'html' | 'url'>('markdown');
  const [copied, setCopied] = useState(false);
  const [debouncedUrl, setDebouncedUrl] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Strip '#' from hex color strings for cleaner URLs
  const cleanColor = (col: string): string => {
    if (col.toLowerCase() === 'transparent') return 'transparent';
    return col.startsWith('#') ? col.substring(1) : col;
  };

  // Generate query parameters based on current configuration
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    // Semicolon-separated lines
    params.set('lines', config.lines.map(encodeURIComponent).join(';'));

    // Custom non-default sizes
    if (config.width !== DEFAULT_CONFIG.width) params.set('width', config.width.toString());
    if (config.height !== DEFAULT_CONFIG.height) params.set('height', config.height.toString());
    if (config.font !== DEFAULT_CONFIG.font) params.set('font', config.font);
    if (config.size !== DEFAULT_CONFIG.size) params.set('size', config.size.toString());
    if (config.weight !== DEFAULT_CONFIG.weight) params.set('weight', config.weight.toString());
    if (config.letterSpacing !== DEFAULT_CONFIG.letterSpacing) params.set('letterSpacing', config.letterSpacing.toString());

    // Layout
    if (config.layout !== DEFAULT_CONFIG.layout) params.set('layout', config.layout);

    // Alignment
    if (config.center) params.set('center', 'true');
    if (!config.vCenter) params.set('vCenter', 'false');

    // Theme (if set and not none)
    if (config.theme !== 'none') {
      params.set('theme', config.theme);
    }

    // Color and Gradient configurations
    if (config.enableGradient && config.gradient.length > 0) {
      params.set('gradient', config.gradient.map(cleanColor).join(','));
      if (config.gradientAngle !== DEFAULT_CONFIG.gradientAngle) {
        params.set('gradientAngle', config.gradientAngle.toString());
      }
    } else {
      // If we don't have a theme OR color overrides the theme color
      const themePreset = THEME_PRESETS.find(t => t.name === config.theme);
      if (!themePreset || cleanColor(config.color) !== cleanColor(themePreset.color)) {
        if (config.color !== DEFAULT_CONFIG.color) {
          params.set('color', cleanColor(config.color));
        }
      }
    }

    // Background configurations
    if (config.isBgTransparent) {
      if (config.theme !== 'none') {
        const themePreset = THEME_PRESETS.find(t => t.name === config.theme);
        if (themePreset && !themePreset.isBgTransparent) {
          params.set('background', 'transparent');
        }
      }
    } else {
      const themePreset = THEME_PRESETS.find(t => t.name === config.theme);
      if (!themePreset || cleanColor(config.background) !== cleanColor(themePreset.background)) {
        params.set('background', cleanColor(config.background));
      }
    }

    // Timing parameters
    if (config.speed !== DEFAULT_CONFIG.speed) params.set('speed', config.speed.toString());
    if (config.deleteSpeed !== DEFAULT_CONFIG.deleteSpeed) params.set('deleteSpeed', config.deleteSpeed.toString());
    if (config.pause !== DEFAULT_CONFIG.pause) params.set('pause', config.pause.toString());
    if (!config.loop) params.set('loop', 'false');

    // Cursor options
    if (config.cursor !== DEFAULT_CONFIG.cursor) params.set('cursor', config.cursor);
    if (config.cursorColor && config.cursorColor !== config.color) {
      params.set('cursorColor', cleanColor(config.cursorColor));
    }
    if (config.cursorGlow !== DEFAULT_CONFIG.cursorGlow) params.set('cursorGlow', config.cursorGlow.toString());
    if (config.textGlow !== DEFAULT_CONFIG.textGlow) params.set('textGlow', config.textGlow.toString());

    // Misc
    if (!config.attribution) params.set('attribution', 'false');

    // Return the query string
    return params.toString();
  }, [config]);

  // Use a relative path for the live preview
  const generatedUrl = `/api/render?${queryParams}`;

  // Debounce URL updates to avoid hitting Vercel edge routes on every keystroke
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedUrl(generatedUrl);
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [generatedUrl]);

  // Copy code handler
  const handleCopy = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const absoluteUrl = `${origin}/api/render?${queryParams}`;
    let copyText = '';
    
    switch (activeTab) {
      case 'markdown':
        copyText = `[![Typing SVG](${absoluteUrl})](https://github.com/dhanushnehru/ScribeSVG)`;
        break;
      case 'html':
        copyText = `<img src="${absoluteUrl}" alt="Typing SVG" />`;
        break;
      case 'url':
        copyText = absoluteUrl;
        break;
    }
    
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Modify individual lines
  const handleLineChange = (index: number, val: string) => {
    const updated = [...config.lines];
    updated[index] = val;
    setConfig({ ...config, lines: updated });
  };

  // Add line to dynamic list
  const addLine = () => {
    setConfig({ ...config, lines: [...config.lines, 'New typing line'] });
  };

  // Remove line from dynamic list
  const removeLine = (index: number) => {
    if (config.lines.length <= 1) return;
    const updated = config.lines.filter((_, idx) => idx !== index);
    setConfig({ ...config, lines: updated });
  };

  // Load a theme preset into active state
  const loadPreset = (preset: ThemePreset) => {
    setConfig({
      ...config,
      theme: preset.name,
      color: preset.color,
      enableGradient: !!preset.gradient,
      gradient: preset.gradient || DEFAULT_CONFIG.gradient,
      background: preset.background,
      isBgTransparent: preset.isBgTransparent,
      cursorColor: preset.cursorColor,
      font: preset.font,
      layout: preset.layout || DEFAULT_CONFIG.layout,
      cursorGlow: preset.cursorGlow || 0,
      textGlow: preset.textGlow || 0
    });
  };

  return (
    <>
      <header>
        <div className="logo-container">
          <h1 className="logo-text">ScribeSVG</h1>
          <span className="logo-badge">Edge Engine</span>
        </div>
        <p className="subtitle">
          Design high-performance, responsive typing animations with custom layouts, linear gradients, and neon glows. Self-contained SVGs that work perfectly in GitHub README profiles.
        </p>
      </header>

      <main>
        {/* Left Panel: Configuration Panel */}
        <section className="card">
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Controls Panel
          </h3>

          {/* Preset Selection */}
          <div className="form-group">
            <label>Load a Theme Preset</label>
            <div className="presets-grid">
              <button 
                className={`preset-btn ${config.theme === 'none' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, theme: 'none' })}
              >
                Default 🎨
              </button>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`preset-btn ${config.theme === preset.name ? 'active' : ''}`}
                  onClick={() => loadPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typing Lines */}
          <div className="form-group">
            <label>Typing Text Lines</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {config.lines.map((line, index) => (
                <div key={index} className="dynamic-input-row">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    placeholder={`Line ${index + 1}`}
                  />
                  <button 
                    className="icon-btn danger" 
                    onClick={() => removeLine(index)}
                    disabled={config.lines.length <= 1}
                    title="Remove Line"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button className="add-line-btn" onClick={addLine}>
                <span>+ Add Line</span>
              </button>
            </div>
          </div>

          {/* Layout & Dimension Settings */}
          <div className="form-grid">
            <div className="form-group">
              <label>Layout Style</label>
              <select 
                value={config.layout} 
                onChange={(e) => setConfig({ ...config, layout: e.target.value as any })}
              >
                <option value="raw">Raw (Text Only)</option>
                <option value="terminal">macOS Terminal Frame</option>
                <option value="card">Glassmorphic Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Font Family</label>
              <select 
                value={config.font}
                onChange={(e) => setConfig({ ...config, font: e.target.value })}
              >
                {POPULAR_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Width (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) || DEFAULT_CONFIG.width })}
              />
            </div>

            <div className="form-group">
              <label>Height (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) || DEFAULT_CONFIG.height })}
              />
            </div>

            <div className="form-group">
              <label>Font Size: {config.size}px</label>
              <input
                type="range"
                min="12"
                max="60"
                value={config.size}
                onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Letter Spacing: {config.letterSpacing}px</label>
              <input
                type="range"
                min="-2"
                max="10"
                value={config.letterSpacing}
                onChange={(e) => setConfig({ ...config, letterSpacing: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Color Settings */}
          <div className="form-grid">
            <div className="form-group span-2">
              <label className="toggle-group">
                <input
                  type="checkbox"
                  checked={config.enableGradient}
                  onChange={(e) => setConfig({ ...config, enableGradient: e.target.checked })}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Enable Linear Text Gradient</span>
              </label>
            </div>

            {config.enableGradient ? (
              <div className="form-group span-2">
                <label>Gradient Stop Colors & Angle ({config.gradientAngle}°)</label>
                <div className="gradient-inputs-grid">
                  <div className="gradient-color-row">
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={config.gradient[0]}
                        onChange={(e) => {
                          const updated = [...config.gradient];
                          updated[0] = e.target.value;
                          setConfig({ ...config, gradient: updated });
                        }}
                      />
                      <input
                        type="text"
                        value={config.gradient[0]}
                        onChange={(e) => {
                          const updated = [...config.gradient];
                          updated[0] = e.target.value;
                          setConfig({ ...config, gradient: updated });
                        }}
                        style={{ width: '80px', padding: '0.4rem' }}
                      />
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>➔</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={config.gradient[1]}
                        onChange={(e) => {
                          const updated = [...config.gradient];
                          updated[1] = e.target.value;
                          setConfig({ ...config, gradient: updated });
                        }}
                      />
                      <input
                        type="text"
                        value={config.gradient[1]}
                        onChange={(e) => {
                          const updated = [...config.gradient];
                          updated[1] = e.target.value;
                          setConfig({ ...config, gradient: updated });
                        }}
                        style={{ width: '80px', padding: '0.4rem' }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={config.gradientAngle}
                    onChange={(e) => setConfig({ ...config, gradientAngle: parseInt(e.target.value) })}
                    style={{ marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Text Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={config.color}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Cursor Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={config.cursorColor || config.color}
                  onChange={(e) => setConfig({ ...config, cursorColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.cursorColor || config.color}
                  placeholder="Match text color"
                  onChange={(e) => setConfig({ ...config, cursorColor: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Background Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={config.background}
                  disabled={config.isBgTransparent}
                  onChange={(e) => setConfig({ ...config, background: e.target.value })}
                />
                <input
                  type="text"
                  value={config.background}
                  disabled={config.isBgTransparent}
                  onChange={(e) => setConfig({ ...config, background: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label className="toggle-group">
                <input
                  type="checkbox"
                  checked={config.isBgTransparent}
                  onChange={(e) => setConfig({ ...config, isBgTransparent: e.target.checked })}
                />
                <span className="toggle-switch"></span>
                <div>
                  <span className="toggle-label">Transparent BG</span>
                </div>
              </label>
            </div>
          </div>

          {/* Animation & Cursor Settings */}
          <div className="form-grid">
            <div className="form-group">
              <label>Cursor Style</label>
              <select 
                value={config.cursor} 
                onChange={(e) => setConfig({ ...config, cursor: e.target.value as any })}
              >
                <option value="pipe">Pipe ( | )</option>
                <option value="block">Solid Block ( █ )</option>
                <option value="underscore">Underscore ( _ )</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="form-group">
              <label>Typing Speed: {config.speed}ms</label>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={config.speed}
                onChange={(e) => setConfig({ ...config, speed: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Deleting Speed: {config.deleteSpeed}ms</label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={config.deleteSpeed}
                onChange={(e) => setConfig({ ...config, deleteSpeed: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Pause Duration: {config.pause}ms</label>
              <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={config.pause}
                onChange={(e) => setConfig({ ...config, pause: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Text Neon Glow: {config.textGlow}px</label>
              <input
                type="range"
                min="0"
                max="10"
                value={config.textGlow}
                onChange={(e) => setConfig({ ...config, textGlow: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Cursor Glow: {config.cursorGlow}px</label>
              <input
                type="range"
                min="0"
                max="10"
                value={config.cursorGlow}
                onChange={(e) => setConfig({ ...config, cursorGlow: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="toggle-group">
                <input
                  type="checkbox"
                  checked={config.center}
                  onChange={(e) => setConfig({ ...config, center: e.target.checked })}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Center Horizontally</span>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-group">
                <input
                  type="checkbox"
                  checked={config.attribution}
                  onChange={(e) => setConfig({ ...config, attribution: e.target.checked })}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Show Attribution Badge</span>
              </label>
            </div>
          </div>
        </section>

        {/* Right Panel: Live Playground & Code Exporter */}
        <section className="preview-container">
          {/* Live Preview Card */}
          <div className="card">
            <div className="preview-header-bar">
              <h3 className="card-title" style={{ border: 'none', padding: 0, margin: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Live Preview
              </h3>
              
              <div className="bg-toggles">
                <button 
                  className={`bg-toggle-btn ${previewBg === 'transparent' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('transparent')}
                >
                  Checkerboard
                </button>
                <button 
                  className={`bg-toggle-btn ${previewBg === 'gh-dark' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('gh-dark')}
                >
                  GitHub Dark
                </button>
                <button 
                  className={`bg-toggle-btn ${previewBg === 'gh-light' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('gh-light')}
                >
                  GitHub Light
                </button>
                <button 
                  className={`bg-toggle-btn ${previewBg === 'dark' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('dark')}
                >
                  Pitch Dark
                </button>
              </div>
            </div>

            <div className={`preview-canvas preview-bg-${previewBg}`}>
              {debouncedUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={debouncedUrl} 
                  alt="ScribeSVG Typing Animation Preview" 
                  key={debouncedUrl} 
                  style={{ width: `${config.width}px` }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generating preview...</div>
              )}
            </div>
          </div>

          {/* Code Exporter Card */}
          <div className="card exporter-container">
            <h3 className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              Get The Code
            </h3>

            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'markdown' ? 'active' : ''}`}
                onClick={() => setActiveTab('markdown')}
              >
                Markdown
              </button>
              <button 
                className={`tab ${activeTab === 'html' ? 'active' : ''}`}
                onClick={() => setActiveTab('html')}
              >
                HTML Image
              </button>
              <button 
                className={`tab ${activeTab === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab('url')}
              >
                Raw URL
              </button>
            </div>

            <div className="code-box-wrapper">
              <div className="code-box">
                {activeTab === 'markdown' && `[![Typing SVG](${generatedUrl})](https://github.com/dhanushnehru/ScribeSVG)`}
                {activeTab === 'html' && `<img src="${generatedUrl}" alt="Typing SVG" />`}
                {activeTab === 'url' && generatedUrl}
              </div>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Sponsorship Callout (Sponsor driving loop) */}
          <div className="sponsors-banner">
            <div className="sponsors-text">
              <h4>Want to feature on our dashboard?</h4>
              <p>ScribeSVG is entirely open-source and run by developers. Support this project to unlock premium templates and display your profile to over 10,000+ monthly users.</p>
            </div>
            <button 
              className="sponsor-button"
              onClick={() => window.open('https://github.com/sponsors/dhanushnehru', '_blank')}
            >
              💖 Sponsor Project
            </button>
          </div>
        </section>
      </main>

      <footer>
        <p>Built with Next.js Edge Engine. Fully Open Source on <a href="https://github.com/dhanushnehru/ScribeSVG" target="_blank" rel="noreferrer">GitHub</a>.</p>
      </footer>
    </>
  );
}
