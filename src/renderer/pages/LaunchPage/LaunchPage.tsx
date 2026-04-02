import { AppIcon } from '../../components/AppIcon/AppIcon';
import { useUIStore } from '../../store';
import { AppCard } from '../../components/AppCard/AppCard';
import styles from './LaunchPage.module.css';

export function LaunchPage() {
  const snapshot = useUIStore((s) => s.snapshot);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);

  if (!snapshot) {
    return <div className={styles.page}>加载中...</div>;
  }

  const { apps, preferences, workspace } = snapshot;
  // 这里统一做一层 UI 兜底：
  // 即使 main 进程拿到的是旧配置或缺字段数据，启动页也应该尽量渲染出来，
  // 而不是因为访问 undefined.length / undefined.map 直接黑屏。
  const hasSnapshot = workspace?.instances?.length > 0;
  const startupMode = preferences?.startupMode || 'home';
  const recentApps = preferences?.recentApps || [];
  const recentInstances = preferences?.recentInstances || [];
  const openCount = workspace?.instances?.length || 0;

  const handleRestore = async () => {
    await window.api.restoreSession();
    setCurrentPage('workbench');
  };

  return (
    <div className={styles.page}>
      <div className={styles.heroShell}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>PretextChat / AI Work Surface</p>
            <h1 className={styles.logo}>把 AI 从浏览器标签页里解放出来</h1>
            <p className={styles.tagline}>
              为高频 AI 使用者设计的多实例工作台。更像桌面工作区，而不是堆满标签的浏览器。
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{apps.length}</span>
                <span className={styles.statLabel}>预置 AI</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{openCount}</span>
                <span className={styles.statLabel}>当前实例</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{recentInstances.length}</span>
                <span className={styles.statLabel}>最近任务</span>
              </div>
            </div>

            <div className={styles.startupPanel}>
              <div className={styles.panelHeading}>
                <span className={styles.panelKicker}>启动偏好</span>
                <h2 className={styles.panelTitle}>选择你希望进入工作的方式</h2>
              </div>
              <div className={styles.startupModes}>
                <button
                  className={`${styles.modeBtn} ${startupMode === 'home' ? styles.modeBtnActive : ''}`}
                  onClick={() => window.api.setStartupMode('home')}
                >
                  <span className={styles.modeTitle}>进入首页</span>
                  <span className={styles.modeDesc}>先看应用目录，再决定今天的工作流。</span>
                </button>
                <button
                  className={`${styles.modeBtn} ${startupMode === 'restoreLastSession' ? styles.modeBtnActive : ''}`}
                  onClick={() => window.api.setStartupMode('restoreLastSession')}
                >
                  <span className={styles.modeTitle}>自动恢复</span>
                  <span className={styles.modeDesc}>开机即回到上一次的任务现场。</span>
                </button>
              </div>
            </div>
          </div>

          <aside className={styles.heroRail}>
            <div className={styles.heroNote}>
              <span className={styles.noteLabel}>今日入口</span>
              <p className={styles.noteText}>快速开一个新实例，或者回到你上一次停下来的任务。</p>
            </div>

            {hasSnapshot && (
              <button className={styles.restoreBtn} onClick={handleRestore}>
                <span className={styles.restoreLabel}>恢复上次会话</span>
                <span className={styles.restoreMeta}>{workspace.instances.length} 个实例，立即继续</span>
              </button>
            )}

            <div className={styles.quickStrip}>
              {apps.slice(0, 4).map((app) => (
                <button
                  key={app.id}
                  className={styles.quickApp}
                  onClick={async () => {
                    await window.api.createInstance(app.id);
                    setCurrentPage('workbench');
                  }}
                >
                  <AppIcon name={app.name} icon={app.icon} size="md" />
                  <span className={styles.quickAppName}>{app.name}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionKicker}>Application Deck</span>
            <h2 className={styles.sectionTitle}>选择你的 AI 入口</h2>
          </div>
          <p className={styles.sectionIntro}>每个入口都可以重复打开，分别承载不同任务上下文。</p>
        </div>
        <div className={styles.appGrid}>
          {apps.map((app) => (
            <AppCard key={app.id} id={app.id} name={app.name} icon={app.icon} />
          ))}
        </div>
      </section>

      {recentApps.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Fast Reopen</span>
              <h2 className={styles.sectionTitle}>最近使用的应用</h2>
            </div>
          </div>
          <div className={styles.recentList}>
            {recentApps.slice(0, 5).map((appId) => {
              const app = apps.find((a) => a.id === appId);
              if (!app) return null;
              return (
                <button
                  key={appId}
                  className={styles.recentItem}
                  onClick={async () => {
                    await window.api.createInstance(appId);
                    setCurrentPage('workbench');
                  }}
                >
                  <AppIcon name={app.name} icon={app.icon} size="sm" />
                  <span>{app.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {recentApps.length === 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Fast Reopen</span>
              <h2 className={styles.sectionTitle}>还没有最近使用记录</h2>
            </div>
            <p className={styles.sectionIntro}>从上面的入口随便打开一个应用，这里就会开始记住你的节奏。</p>
          </div>
        </section>
      )}

      {recentInstances.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Task Memory</span>
              <h2 className={styles.sectionTitle}>最近任务</h2>
            </div>
            <p className={styles.sectionIntro}>保留任务名和入口，帮助你快速回到上下文。</p>
          </div>
          <div className={styles.recentInstances}>
            {recentInstances.slice(0, 6).map((entry) => {
              const app = apps.find((item) => item.id === entry.applicationId);
              if (!app) return null;
              const isOpen = workspace.instances.some((instance) => instance.id === entry.instanceId);

              return (
                <button
                  key={entry.instanceId}
                  className={styles.recentInstance}
                  onClick={async () => {
                    await window.api.reopenRecentInstance(entry.instanceId);
                    setCurrentPage('workbench');
                  }}
                >
                  <AppIcon name={app.name} icon={app.icon} size="md" />
                  <span className={styles.recentInstanceMeta}>
                    <span className={styles.recentInstanceTitle}>{entry.title}</span>
                    <span className={styles.recentInstanceSubtitle}>
                      {app.name} · {isOpen ? '已打开' : '重新打开'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {recentInstances.length === 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Task Memory</span>
              <h2 className={styles.sectionTitle}>任务记忆正在等待第一次打开</h2>
            </div>
            <p className={styles.sectionIntro}>给每个 AI 开一个独立任务，PretextChat 会把它们当作工作对象，而不是普通网页。</p>
          </div>
        </section>
      )}
    </div>
  );
}
