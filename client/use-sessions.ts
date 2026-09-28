import { usePaseo } from "@getpaseo/plugin/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterTab, UnifiedSession, ViewMode } from "../shared/types";
import {
  computeHubStats,
  fetchAllSessions,
  filterSessions,
  groupSessionsByProject,
} from "./data-loader";
import {
  createDebouncedInvalidator,
  observeDirectoryInvalidation,
  type PaseoApiLike,
} from "./observation";

const REFETCH_INTERVAL_MS = 30_000;
const INVALIDATE_DEBOUNCE_MS = 600;

export interface UseSessionsState {
  readonly sessions: readonly UnifiedSession[];
  readonly filteredSessions: readonly UnifiedSession[];
  readonly projectGroups: ReturnType<typeof groupSessionsByProject>;
  readonly stats: ReturnType<typeof computeHubStats>;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly searchQuery: string;
  readonly setSearchQuery: (q: string) => void;
  readonly activeTab: FilterTab;
  readonly setActiveTab: (tab: FilterTab) => void;
  readonly viewMode: ViewMode;
  readonly setViewMode: (mode: ViewMode) => void;
  readonly refetch: () => void;
  readonly archiveSession: (agentId: string) => Promise<void>;
  readonly bulkArchiveClosed: () => Promise<void>;
  readonly isArchiving: boolean;
  readonly renameSession: (workspaceId: string, newTitle: string) => Promise<void>;
  readonly isRenaming: boolean;
}

export function useSessions(hostId: string): UseSessionsState {
  const paseo = usePaseo() as unknown as PaseoApiLike;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["session-hub", "sessions", hostId], [hostId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("flat");

  const {
    data: sessions = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchAllSessions(paseo),
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  // Real-time directory invalidation
  useEffect(() => {
    const invalidator = createDebouncedInvalidator(() => {
      void queryClient.invalidateQueries({ queryKey });
    }, INVALIDATE_DEBOUNCE_MS);

    const unsubscribe = observeDirectoryInvalidation(paseo, () => {
      invalidator.invalidate();
    });

    return () => {
      invalidator.cancel();
      unsubscribe();
    };
  }, [paseo, queryClient, queryKey]);

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (agentIds: readonly string[]) => {
      const api = paseo as unknown as { agents: { archive(options: { ids: readonly string[] }): Promise<void> } };
      if (typeof api.agents?.archive === "function") {
        await api.agents.archive({ ids: agentIds });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ workspaceId, newTitle }: { workspaceId: string; newTitle: string }) => {
      const api = paseo as unknown as {
        workspaces?: {
          ref(id: string): { setTitle(title: string | null): Promise<unknown> };
        };
      };
      if (typeof api.workspaces?.ref === "function" && workspaceId) {
        const handle = api.workspaces.ref(workspaceId);
        if (typeof handle?.setTitle === "function") {
          await handle.setTitle(newTitle.trim() || null);
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const archiveSession = useCallback(
    async (agentId: string) => {
      await archiveMutation.mutateAsync([agentId]);
    },
    [archiveMutation],
  );

  const bulkArchiveClosed = useCallback(async () => {
    const closedIds = sessions.filter((s) => s.status === "closed").map((s) => s.id);
    if (closedIds.length > 0) {
      await archiveMutation.mutateAsync(closedIds);
    }
  }, [archiveMutation, sessions]);

  const renameSession = useCallback(
    async (workspaceId: string, newTitle: string) => {
      await renameMutation.mutateAsync({ workspaceId, newTitle });
    },
    [renameMutation],
  );

  const stats = useMemo(() => computeHubStats(sessions), [sessions]);

  const filteredSessions = useMemo(
    () => filterSessions(sessions, searchQuery, activeTab),
    [sessions, searchQuery, activeTab],
  );

  const projectGroups = useMemo(
    () => groupSessionsByProject(filteredSessions),
    [filteredSessions],
  );

  return {
    sessions,
    filteredSessions,
    projectGroups,
    stats,
    isLoading,
    isFetching,
    error: error as Error | null,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    refetch,
    archiveSession,
    bulkArchiveClosed,
    isArchiving: archiveMutation.isPending,
    renameSession,
    isRenaming: renameMutation.isPending,
  };
}
