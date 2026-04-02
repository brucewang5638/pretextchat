import styles from './AppIcon.module.css';

interface AppIconProps {
  name: string;
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

function getIconLabel(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

function getVariant(icon: string): string {
  const key = icon.replace(/\.svg$/i, '');
  return styles[key] || styles.defaultVariant;
}

export function AppIcon({ name, icon, size = 'md' }: AppIconProps) {
  return (
    <span
      className={`${styles.icon} ${styles[size]} ${getVariant(icon)}`}
      aria-hidden="true"
      title={name}
    >
      {getIconLabel(name)}
    </span>
  );
}
