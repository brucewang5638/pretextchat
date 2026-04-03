import { BrowserWindow } from "electron";
import { IPC } from "../../shared/constants";
import type {
  Application,
  PersistedInstance,
  PersistedWorkspaceState,
  StateSnapshot,
} from "../../shared/types";
import { appRegistry } from "../catalog/app-registry";
import { localStore } from "../persistence/local-store";
import { instanceStore } from "../workspace/instance-store";
import { viewManager } from "../workspace/view-manager";

export function isValidWorkspaceState(
  state: unknown,
): state is PersistedWorkspaceState {
  if (!state || typeof state !== "object") return false;
  const candidate = state as Record<string, unknown>;
  return (
    Array.isArray(candidate.instances) &&
    Array.isArray(candidate.tabOrder) &&
    (candidate.activeInstanceId === null ||
      typeof candidate.activeInstanceId === "string")
  );
}

export function buildStateSnapshot(): StateSnapshot {
  return {
    workspace: instanceStore.getWorkspaceState(),
    runtimeStates: instanceStore.getRuntimeStates(),
    apps: appRegistry.getAll(),
    preferences: localStore.getPreferences(),
  };
}

export function syncState(): void {
  const snapshot = buildStateSnapshot();
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(IPC.STATE_SYNC, snapshot);
  });
}

export function requireAppId(value: unknown): string {
  if (typeof value !== "string" || !appRegistry.has(value)) {
    throw new Error(`Invalid appId: ${String(value)}`);
  }
  return value;
}

export function requireInstanceId(value: unknown): string {
  if (typeof value !== "string" || !instanceStore.has(value)) {
    throw new Error(`Invalid instanceId: ${String(value)}`);
  }
  return value;
}

export function getAppForInstance(instanceId: string): Application | undefined {
  const instance = instanceStore.getInstance(instanceId);
  return instance ? appRegistry.get(instance.applicationId) : undefined;
}

export function requireCustomAppId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !localStore.getCustomApps().some((app) => app.id === value)
  ) {
    throw new Error(`Invalid custom app id: ${String(value)}`);
  }
  return value;
}

function ensureNativeView(instance: PersistedInstance, app: Application): void {
  if (!viewManager.hasView(instance.id)) {
    viewManager.create(instance, app);
  }
}

function showInstance(instanceId: string | null): void {
  viewManager.show(instanceId);
}

export function activateInstance(instanceId: string): void {
  const instance = instanceStore.getInstance(instanceId);
  const app = instance ? appRegistry.get(instance.applicationId) : undefined;

  if (!instance || !app) {
    throw new Error(`Unable to activate instance: ${instanceId}`);
  }

  ensureNativeView(instance, app);
  showInstance(instanceId);
}

export function showCurrentActiveInstance(): void {
  const activeInstanceId = instanceStore.getWorkspaceState().activeInstanceId;
  if (!activeInstanceId) return;
  activateInstance(activeInstanceId);
}
