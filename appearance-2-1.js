
/* Simple 簡記 2.1.0
   Appearance module: Light / Dark / System
   Keeps appearance preference separate from financial data.
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'simple-jianji-appearance-mode';
  const VALID_MODES = ['light', 'dark', 'system'];

  function getMode() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID_MODES.includes(saved) ? saved : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function isDark(mode) {
    if (mode === 'dark') return true;
    if (mode === 'system') {
      return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  function applyMode(mode) {
    if (!VALID_MODES.includes(mode)) return;

    document.body.dataset.appearance = isDark(mode) ? 'dark' : 'light';

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        isDark(mode) ? '#191923' : '#f5f3ed'
      );
    }

    document.querySelectorAll('[data-appearance-choice]').forEach(button => {
      const selected = button.dataset.appearanceChoice === mode;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function setMode(mode) {
    if (!VALID_MODES.includes(mode)) return;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.warn('外觀設定無法保存：', error);
    }

    applyMode(mode);
  }

  function createSettings() {
    const rows = document.querySelectorAll('.settings-sheet .setting-row');
    let aboutRow = null;

    rows.forEach(row => {
      const heading = row.querySelector('strong');
      if (heading && heading.textContent.includes('關於 Simple 簡記')) {
        aboutRow = row;
      }
    });

    if (!aboutRow || document.getElementById('appearanceSettings')) return;

    const section = document.createElement('div');
    section.className = 'setting-row';
    section.id = 'appearanceSettings';

    const title = document.createElement('strong');
    title.textContent = '外觀模式';

    const description = document.createElement('p');
    description.className = 'small';
    description.textContent = '選擇日間、夜間，或跟隨手機系統外觀。';

    const options = document.createElement('div');
    options.className = 'theme-options appearance-options';

    const choices = [
      { mode: 'light', label: '☀️ 日間模式' },
      { mode: 'dark', label: '🌙 夜間模式' },
      { mode: 'system', label: '📱 跟隨系統' }
    ];

    choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-choice';
      button.textContent = choice.label;
      button.dataset.appearanceChoice = choice.mode;
      button.addEventListener('click', () => setMode(choice.mode));
      options.appendChild(button);
    });

    section.append(title, description, options);
    aboutRow.parentNode.insertBefore(section, aboutRow);
    applyMode(getMode());
  }

  function installStyles() {
    if (document.getElementById('appearance-210-styles')) return;

    const style = document.createElement('style');
    style.id = 'appearance-210-styles';
    style.textContent = `
      body, body * {
        transition:
          background-color .24s ease,
          color .24s ease,
          border-color .24s ease,
          box-shadow .24s ease;
      }

      body[data-appearance="dark"] {
        color-scheme: dark;
        background-color: #191923 !important;
        color: #f1eaf3 !important;
      }

      body[data-appearance="dark"] main,
      body[data-appearance="dark"] header,
      body[data-appearance="dark"] footer {
        color: #f1eaf3;
      }

      body[data-appearance="dark"] .card,
      body[data-appearance="dark"] .settings-sheet,
      body[data-appearance="dark"] .brand-plaque,
      body[data-appearance="dark"] .overview-hero,
      body[data-appearance="dark"] .setting-row {
        background-color: #262633;
        color: #f1eaf3;
        border-color: #414052;
      }

      body[data-appearance="dark"] nav {
        background-color: #22222e;
        border-color: #414052;
      }

      body[data-appearance="dark"] nav button.active {
        background-color: #393347;
        color: #e6d8f5;
      }

      body[data-appearance="dark"] input,
      body[data-appearance="dark"] select,
      body[data-appearance="dark"] textarea {
        background-color: #30303e;
        color: #f1eaf3;
        border-color: #51495e;
      }

      body[data-appearance="dark"] input::placeholder,
      body[data-appearance="dark"] textarea::placeholder {
        color: #aaa2b5;
      }

      body[data-appearance="dark"] .secondary,
      body[data-appearance="dark"] .pill,
      body[data-appearance="dark"] .theme-choice {
        background-color: #343241;
        color: #e4d9eb;
        border-color: #51495e;
      }

      body[data-appearance="dark"] .theme-choice.selected {
        background-color: #51445f;
        color: #fff;
        border-color: #9b83b5;
      }

      body[data-appearance="dark"] .settings-backdrop {
        background-color: #080811bb;
      }

      body[data-appearance="dark"] .small,
      body[data-appearance="dark"] header small {
        color: #aaa2b5;
      }

      body[data-appearance="dark"] .add-fab {
        background-color: #a987b9;
        color: #fff;
      }

      body[data-appearance="dark"] .appearance-options {
        gap: 8px;
      }

      .panel.active {
        animation: appearance-panel-in .22s ease both;
      }

      @keyframes appearance-panel-in {
        from {
          opacity: 0;
          transform: translateY(7px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        body, body * {
          transition: none !important;
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function start() {
    installStyles();
    createSettings();
    applyMode(getMode());

    if (window.matchMedia) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      systemTheme.addEventListener('change', () => {
        if (getMode() === 'system') applyMode('system');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
