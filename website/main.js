import './styles.css';

const apps = [
  { name: 'ChatGPT', icon: './images/apps/chatgpt.jpeg' },
  { name: 'Claude', icon: './images/apps/claude.png' },
  { name: 'Gemini', icon: './images/apps/gemini.png' },
  { name: 'Perplexity', icon: './images/apps/perplexity.webp' },
  { name: 'Kimi', icon: './images/apps/kimi.webp' },
  { name: 'DeepSeek', icon: './images/apps/deepseek.png' },
  { name: '豆包', icon: './images/apps/doubao.png' },
  { name: '通义', icon: './images/apps/qwenlm.webp' },
];

const appGrid = document.querySelector('[data-app-grid]');

if (appGrid) {
  appGrid.innerHTML = apps
    .map(
      (app) => `
        <div class="app-chip">
          <img src="${app.icon}" alt="" width="40" height="40" loading="lazy" />
          <span>${app.name}</span>
        </div>
      `,
    )
    .join('');
}

const yearTarget = document.querySelector('[data-current-year]');
if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

const revealed = document.querySelectorAll('[data-reveal]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealed.forEach((node) => node.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  revealed.forEach((node) => observer.observe(node));
}
