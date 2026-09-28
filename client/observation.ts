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
  readonly kind: "agent" | "workspace";
  readonly unsubscribe: () => void;
  readonly release: () => Promise<void>;
}

export function observeDirectoryInvalidation(
  paseo: PaseoApiLike,
  invalidate: () => void,
): () => void {
  const subscriptions = new Set<ActiveSubscription>();
  let stopped = false;

  const attachAgents = async () => {
    try {
      const result = await paseo.agents.list({ subscribe: {} });
      const subscription = result.subscription;
      if (!subscription) return;
      if (stopped) {
        await subscription.release().catch(() => {});
        return;
      }
      subscriptions.add({
        kind: "agent",
        unsubscribe: subscription.subscribe({ snapshot: invalidate, update: invalidate }),
        release: subscription.release.bind(subscription),
      });
    } catch (err) {
      console.warn("Session Hub: agent observation setup failed", err);
    }
  };

  const attachWorkspaces = async () => {
    try {
      const result = await paseo.workspaces.list({ subscribe: {} });
      const subscription = result.subscription;
      if (!subscription) return;
      if (stopped) {
        await subscription.release().catch(() => {});
        return;
      }
      subscriptions.add({
        kind: "workspace",
        unsubscribe: subscription.subscribe({ snapshot: invalidate, update: invalidate }),
        release: subscription.release.bind(subscription),
      });
    } catch (err) {
      console.warn("Session Hub: workspace observation setup failed", err);
    }
  };

  void attachAgents();
  void attachWorkspaces();

  let unsubscribeProjects = () => {};
  try {
    if (typeof paseo.projects?.subscribe === "function") {
      unsubscribeProjects = paseo.projects.subscribe(invalidate);
    }
  } catch (err) {
    console.warn("Session Hub: project observation setup failed", err);
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
    unsubscribeProjects();
  };
}
