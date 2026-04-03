export interface AppCardProps {
  id: string;
  name: string;
  icon: string;
  image?: string;
  category?: string;
  description?: string;
  source?: "builtin" | "custom";
  lastSubmittedAt?: number;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  onSubmitReview?: (id: string) => void;
  onDeleteCustomApp?: (id: string) => void;
  onOpen?: (id: string) => void | Promise<void>;
}
