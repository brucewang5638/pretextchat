import { AppCard } from "./AppCard/AppCard";
import { CUSTOM_APP_LAUNCHER_ID } from "../launch.constants";
import type { LaunchAppGroup } from "../launch.types";

interface LaunchCategorySectionProps {
  group: LaunchAppGroup;
  pinnedAppIds: Set<string>;
  onOpenCustomAppDialog: () => void;
  onTogglePin: (id: string) => void | Promise<void>;
  onSubmitReview: (id: string) => void | Promise<void>;
  onDeleteCustomApp: (id: string) => void | Promise<void>;
}

export function LaunchCategorySection({
  group,
  pinnedAppIds,
  onOpenCustomAppDialog,
  onTogglePin,
  onSubmitReview,
  onDeleteCustomApp,
}: LaunchCategorySectionProps) {
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="flex items-end gap-2.5 px-1">
        <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
          {group.category}
        </h2>
        <span className="pb-0.5 text-[14px] text-[var(--color-text-muted)]">
          {group.count} 个应用
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {group.apps.map((app) => (
          <AppCard
            key={app.id}
            id={app.id}
            name={app.name}
            icon={app.icon}
            image={app.image}
            category={app.category}
            description={app.description}
            source={app.source}
            lastSubmittedAt={app.lastSubmittedAt}
            isPinned={pinnedAppIds.has(app.id)}
            onOpen={
              app.id === CUSTOM_APP_LAUNCHER_ID
                ? async () => onOpenCustomAppDialog()
                : undefined
            }
            onTogglePin={
              app.id === CUSTOM_APP_LAUNCHER_ID ? undefined : onTogglePin
            }
            onSubmitReview={onSubmitReview}
            onDeleteCustomApp={onDeleteCustomApp}
          />
        ))}
      </div>
    </section>
  );
}
