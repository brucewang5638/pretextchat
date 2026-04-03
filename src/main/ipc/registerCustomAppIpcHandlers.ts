import { ipcMain, shell } from "electron";
import { IPC } from "../../shared/constants";
import {
  buildCustomAppReviewIssueUrl,
  createCustomAppId,
  normalizeCustomAppDraft,
} from "../catalog/custom-app-utils";
import { localStore } from "../persistence/local-store";
import { instanceStore } from "../workspace/instance-store";
import { viewManager } from "../workspace/view-manager";
import {
  requireCustomAppId,
  showCurrentActiveInstance,
  syncState,
} from "./ipc-context";

export function registerCustomAppIpcHandlers(): void {
  ipcMain.handle(IPC.UPSERT_CUSTOM_APP, (_event, payload: unknown) => {
    const draft = normalizeCustomAppDraft(payload);
    const now = Date.now();
    const customApp = {
      id: createCustomAppId(draft.name),
      name: draft.name,
      startUrl: draft.startUrl,
      category: draft.category,
      description: draft.description,
      icon: "custom",
      createdAt: now,
      updatedAt: now,
    };

    localStore.upsertCustomApp(customApp);
    syncState();
    return customApp;
  });

  ipcMain.handle(IPC.DELETE_CUSTOM_APP, (_event, id: unknown) => {
    const customAppId = requireCustomAppId(id);
    const relatedInstanceIds = instanceStore
      .getWorkspaceState()
      .instances.filter((instance) => instance.applicationId === customAppId)
      .map((instance) => instance.id);

    relatedInstanceIds.forEach((instanceId) => {
      viewManager.destroy(instanceId);
      instanceStore.closeInstance(instanceId);
    });

    localStore.removeCustomApp(customAppId);
    showCurrentActiveInstance();
    syncState();
  });

  ipcMain.handle(IPC.SUBMIT_CUSTOM_APP_REVIEW, async (_event, id: unknown) => {
    const customAppId = requireCustomAppId(id);
    const customApp = localStore
      .getCustomApps()
      .find((app) => app.id === customAppId);

    if (!customApp) {
      throw new Error(`Unable to find custom app: ${customAppId}`);
    }

    await shell.openExternal(buildCustomAppReviewIssueUrl(customApp));
    localStore.markCustomAppSubmitted(customApp.id, Date.now());
    const result = {
      status: "submitted" as const,
      message: "已打开 GitHub 审核提交通道。",
    };
    syncState();
    return result;
  });
}
