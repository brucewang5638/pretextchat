import { TabBar } from '../../components/TabBar/TabBar';
import styles from './WorkbenchPage.module.css';

export function WorkbenchPage() {
  return (
    <div className={styles.workbench}>
      <TabBar />
      <div className={styles.viewArea}>
        {/* WebContentsView 由 main 进程管理并叠加在此区域上方。
            renderer 只需要留出高度空间。*/}
      </div>
    </div>
  );
}
