import { useUIStore } from '../../store';
import { AppIcon } from '../AppIcon/AppIcon';
import styles from './AppCard.module.css';

interface AppCardProps {
  id: string;
  name: string;
  icon: string;
}

const appDescriptions: Record<string, string> = {
  ChatGPT: '通用创作与代码协作',
  Claude: '长文本分析与写作整理',
  Gemini: 'Google 生态与多模态辅助',
  Perplexity: '检索型问答与资料探索',
  DeepSeek: '推理与技术问题拆解',
};

export function AppCard({ id, name, icon }: AppCardProps) {
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const description = appDescriptions[name] || '打开一个新的独立任务实例';

  const handleClick = async () => {
    await window.api.createInstance(id);
    setCurrentPage('workbench');
  };

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      title={`打开 ${name}`}
      aria-label={`新建 ${name} 实例`}
      type="button"
    >
      <div className={styles.iconWrapper}>
        <AppIcon name={name} icon={icon} size="lg" />
      </div>
      <div className={styles.copy}>
        <span className={styles.name}>{name}</span>
        <span className={styles.description}>{description}</span>
      </div>
      <span className={styles.action}>Open Instance</span>
    </button>
  );
}
