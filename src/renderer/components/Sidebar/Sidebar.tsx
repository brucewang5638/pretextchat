import { useUIStore } from '../../store';
import { resolveAssetPath } from '../../lib/assets';

export function Sidebar() {
  const snapshot = useUIStore((s) => s.snapshot);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const activeAppFilter = useUIStore((s) => s.activeAppFilter);
  const setActiveAppFilter = useUIStore((s) => s.setActiveAppFilter);

  // Filter apps to strictly those that have running instances
  const activeAppIds = new Set(snapshot?.workspace.instances.map(inst => inst.applicationId) || []);
  const pinnedAppIds = new Set(snapshot?.preferences.pinnedAppIds || []);
  // Google 登录容器始终给一个稳定入口，避免用户在第三方站点里找不到入口。
  const displayAppIds = new Set([...activeAppIds, ...pinnedAppIds, 'google']);
  const apps = (snapshot?.apps || []).filter(app => displayAppIds.has(app.id));
  
  const handleGoHome = async () => {
    await window.api.switchInstance(null);
    setActiveAppFilter(null);
    setCurrentPage('launch');
  };

  const handleSelectApp = async (appId: string) => {
    setActiveAppFilter(appId);
    
    const instancesForApp = snapshot?.workspace.instances.filter(i => i.applicationId === appId) || [];
    if (instancesForApp.length > 0) {
      // Jump to the first instance of this app
      await window.api.switchInstance(instancesForApp[0].id);
    } else {
      // Auto-create if none exists
      await window.api.createInstance(appId);
    }
    
    setCurrentPage('workbench');
  };

  return (
    <aside className="z-[100] flex h-screen w-[68px] shrink-0 flex-col items-center overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-page)] py-3 [&::-webkit-scrollbar]:hidden">
      <button 
        className={[
          'mb-2 flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-transparent text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
          currentPage === 'launch' ? 'bg-[var(--color-bg-active)] text-[var(--color-accent)]' : '',
        ].join(' ')}
        onClick={handleGoHome}
        title="应用主页"
      >
        <img
          src={resolveAssetPath('/branding/pretextchat-logo.svg')}
          alt="PretextChat"
          className="block h-7 w-7"
        />
      </button>

      <div className="my-2 mb-4 h-0.5 w-8 rounded-full bg-[var(--color-border)]"></div>

      {apps.map(app => {
        const isActive = currentPage === 'workbench' && activeAppFilter === app.id;
        return (
          <div 
            key={app.id} 
            className="group relative mb-3 flex h-11 w-11 cursor-pointer items-center justify-center"
            onClick={() => handleSelectApp(app.id)}
            title={app.name}
          >
            <div
              className={[
                'absolute -left-[10px] top-1/2 w-1.5 -translate-y-1/2 rounded-r bg-[var(--color-accent)] transition-all duration-200',
                isActive ? 'h-8' : 'h-0 group-hover:h-5',
              ].join(' ')}
            />
            <div
              className={[
                'flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px] border-2 border-transparent bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-secondary)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:rounded-2xl group-hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)]',
                isActive ? 'rounded-2xl border-[var(--color-accent)]' : '',
              ].join(' ')}
            >
              {app.image ? (
                <img src={resolveAssetPath(app.image)} alt={app.name} className="h-full w-full object-contain" />
              ) : (
                app.name.charAt(0)
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
