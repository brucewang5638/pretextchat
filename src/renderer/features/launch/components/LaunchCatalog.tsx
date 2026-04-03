import { LaunchCategorySection } from "./LaunchCategorySection";
import { LaunchEmptyState } from "./LaunchEmptyState";
import type { LaunchAppGroup } from "../launch.types";

interface LaunchCatalogProps {
  groups: LaunchAppGroup[];
  searchQuery: string;
  pinnedAppIds: Set<string>;
  onOpenCustomAppDialog: () => void;
  onTogglePin: (id: string) => void | Promise<void>;
  onSubmitReview: (id: string) => void | Promise<void>;
  onDeleteCustomApp: (id: string) => void | Promise<void>;
}

export function LaunchCatalog({
  groups,
  searchQuery,
  pinnedAppIds,
  onOpenCustomAppDialog,
  onTogglePin,
  onSubmitReview,
  onDeleteCustomApp,
}: LaunchCatalogProps) {
  if (groups.length === 0) {
    return <LaunchEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <LaunchCategorySection
          key={group.category}
          group={group}
          pinnedAppIds={pinnedAppIds}
          onOpenCustomAppDialog={onOpenCustomAppDialog}
          onTogglePin={onTogglePin}
          onSubmitReview={onSubmitReview}
          onDeleteCustomApp={onDeleteCustomApp}
        />
      ))}
    </div>
  );
}
