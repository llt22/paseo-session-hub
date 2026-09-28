import type { HostInfo } from "./hosts";
import { resolveHostApi } from "./hosts";

export interface DebouncedInvalidator {
  readonly invalidate: () => void;
  readonly cancel: () => void;
}

export interface PaseoSubscriptionHandle {
  subscribe(callbacks: {
    snapshot?: () => void;
    update?: () => void;
  }): () => void;
  release(): Promise<void>;
}

export interface PaseoApiLike {
  agents: {
    list(options?: Record<string, unknown>): Promise<{
      entries: readonly unknown[];
      subscription?: PaseoSubscriptionHandle;
      pageInfo?: { hasMore: boolean; nextCursor?: string | null };
    }>;
  };
  workspaces: {
    list(options?: Record<string, unknown>): Promise<{
      entries: readonly unknown[];
      subscription?: PaseoSubscriptionHandle;
    }>;
  };
  projects: {
    list(): Promise<{
      projects: readonly {
        projectId: string;
        projectKey?: string | null;
        projectDisplayName: string;
        projectCustomName?: string | null;
      }[];
    }>;
    subscribe?(callback: () => void): () => void;
  };
}

export function createDebouncedInvalidator(
  invalidate: () => void,
  delayMs: number = 500,
): DebouncedInvalidator {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    invalidate() {
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        invalidate();
      }, delayMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    },
  };
}

interface ActiveSubscription {
  readonly serverId: string;
  readonly kind: "agent" | "workspace";
  readonly unsubscribe: () => void;
  readonly release: () => Promise<void>;
}

export function observeMultiHostInvalidation(
  hosts: readonly HostInfo[],
  ownHost: { id: string; api: PaseoApiLike },
  invalidate: () => void,
): () => void {
  const subscriptions = new Set<ActiveSubscription>();
  const projectUnsubscribes = new Set<() => void>();
  let stopped = false;

  for (const host of hosts) {
    if (!host.isOnline && host.serverId !== ownHost.id) continue;
    const api = resolveHostApi(host.serverId, ownHost as any) as unknown as PaseoApiLike | null;
    if (!api) continue;

    const serverId = host.serverId;

    const attachAgents = async () => {
      try {
        const result = await api.agents.list({ subscribe: {} });
        const subscription = result.subscription;
        if (!subscription) return;
        if (stopped) {
          await subscription.release().catch(() => {});
          return;
        }
        subscriptions.add({
          serverId,
          kind: "agent",
          unsubscribe: subscription.subscribe({ snapshot: invalidate, update: invalidate }),
          release: subscription.release.bind(subscription),
        });
      } catch (err) {
        console.warn(`Session Hub: [${host.label}] agent observation setup failed`, err);
      }
    };

    const attachWorkspaces = async () => {
      try {
        const result = await api.workspaces.list({ subscribe: {} });
        const subscription = result.subscription;
        if (!subscription) return;
        if (stopped) {
          await subscription.release().catch(() => {});
          return;
        }
        subscriptions.add({
          serverId,
          kind: "workspace",
          unsubscribe: subscription.subscribe({ snapshot: invalidate, update: invalidate }),
          release: subscription.release.bind(subscription),
        });
      } catch (err) {
        console.warn(`Session Hub: [${host.label}] workspace observation setup failed`, err);
      }
    };

    void attachAgents();
    void attachWorkspaces();

    try {
      if (typeof api.projects?.subscribe === "function") {
        const unsub = api.projects.subscribe(invalidate);
        projectUnsubscribes.add(unsub);
      }
    } catch {}
  }

  return () => {
    stopped = true;
    for (const sub of subscriptions) {
      try {
        sub.unsubscribe();
        void sub.release().catch(() => {});
      } catch {}
    }
    subscriptions.clear();

    for (const unsub of projectUnsubscribes) {
      try {
        unsub();
      } catch {}
    }
    projectUnsubscribes.clear();
  };
}
