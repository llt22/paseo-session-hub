import type { PaseoApi } from "@getpaseo/client";
import { usePaseo } from "@getpaseo/plugin/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterTab, UnifiedSession, ViewMode } from "../shared/types";
import {
  computeHubStats,
  fetchAllHostsSessions,
  filterSessions,
  groupSessionsByProject,
} from "./data-loader";
import { type HostInfo, resolveHostApi, useConnectedHosts } from "./hosts";
import {
  createDebouncedInvalidator,
  observeMultiHostInvalidation,
  type PaseoApiLike,
} from "./observation";

const REFETCH_INTERVAL_MS = 30_000;
const INVALIDATE_DEBOUNCE_MS = 600;

export interface UseSessionsState {
  readonly sessions: readonly UnifiedSession[];
  readonly filteredSessions: readonly UnifiedSession[];
  readonly projectGroups: ReturnType<typeof groupSessionsByProject>;
  readonly stats: ReturnType<typeof computeHubStats>;
  readonly hosts: readonly HostInfo[];
  readonly selectedHostId: string;
  readonly setSelectedHostId: (hostId: string) => void;
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
  readonly archiveSession: (agentId: string, serverId: string) => Promise<void>;
  readonly bulkArchiveClosed: () => Promise<void>;
  readonly isArchiving: boolean;
  readonly renameSession: (workspaceId: string, newTitle: string, serverId: string) => Promise<void>;
  readonly isRenaming: boolean;
}

export function useSessions(ownHost: { id: string; label: string }): UseSessionsState {
  const ownApi = usePaseo() as unknown as PaseoApiLike;
  const hosts = useConnectedHosts(ownHost);
  const queryClient = useQueryClient();

  const hostsSignature = useMemo(
    () => hosts.map((h) => `${h.serverId}:${h.status}`).join(","),
    [hosts],
  );

  const queryKey = useMemo(
    () => ["session-hub", "sessions", ownHost.id, hostsSignature],
    [ownHost.id, hostsSignature],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedHostId, setSelectedHostId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");

  const {
    data: sessions = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAllHostsSessions(hosts, { id: ownHost.id, api: ownApi }),
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  // Real-time multi-host invalidation
  useEffect(() => {
    const invalidator = createDebouncedInvalidator(() => {
      void queryClient.invalidateQueries({ queryKey });
    }, INVALIDATE_DEBOUNCE_MS);

    const unsubscribe = observeMultiHostInvalidation(
      hosts,
      { id: ownHost.id, api: ownApi },
      () => {
        invalidator.invalidate();
      },
    );

    return () => {
      invalidator.cancel();
      unsubscribe();
    };
  }, [hosts, ownApi, ownHost.id, queryClient, queryKey]);

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ agentIds, serverId }: { agentIds: readonly string[]; serverId: string }) => {
      const targetApi = resolveHostApi(serverId, { id: ownHost.id, api: ownApi as unknown as PaseoApi }) as unknown as {
        agents?: { archive(options: { ids: readonly string[] }): Promise<void> };
      } | null;

      if (targetApi && typeof targetApi.agents?.archive === "function") {
        await targetApi.agents.archive({ ids: agentIds });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({
      workspaceId,
      newTitle,
      serverId,
    }: {
      workspaceId: string;
      newTitle: string;
      serverId: string;
    }) => {
      const targetApi = resolveHostApi(serverId, { id: ownHost.id, api: ownApi as unknown as PaseoApi }) as unknown as {
        workspaces?: {
          ref(id: string): { setTitle(title: string | null): Promise<unknown> };
        };
      } | null;

      if (targetApi && typeof targetApi.workspaces?.ref === "function" && workspaceId) {
        const handle = targetApi.workspaces.ref(workspaceId);
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
    async (agentId: string, serverId: string) => {
      await archiveMutation.mutateAsync({ agentIds: [agentId], serverId });
    },
    [archiveMutation],
  );

  const bulkArchiveClosed = useCallback(async () => {
    // Group closed sessions by serverId to issue host-specific archive requests
    const closedByHost = new Map<string, string[]>();
    for (const s of sessions) {
      if (s.status === "closed") {
        const list = closedByHost.get(s.serverId) ?? [];
        list.push(s.id);
        closedByHost.set(s.serverId, list);
      }
    }

    const tasks = Array.from(closedByHost.entries()).map(([serverId, agentIds]) =>
      archiveMutation.mutateAsync({ agentIds, serverId }),
    );
    await Promise.allSettled(tasks);
  }, [archiveMutation, sessions]);

  const renameSession = useCallback(
    async (workspaceId: string, newTitle: string, serverId: string) => {
      await renameMutation.mutateAsync({ workspaceId, newTitle, serverId });
    },
    [renameMutation],
  );

  const stats = useMemo(() => computeHubStats(sessions), [sessions]);

  const filteredSessions = useMemo(
    () => filterSessions(sessions, searchQuery, activeTab, selectedHostId),
    [sessions, searchQuery, activeTab, selectedHostId],
  );

  const hasMultipleHosts = hosts.length > 1;

  const projectGroups = useMemo(
    () => groupSessionsByProject(filteredSessions, hasMultipleHosts && selectedHostId === "all"),
    [filteredSessions, hasMultipleHosts, selectedHostId],
  );

  return {
    sessions,
    filteredSessions,
    projectGroups,
    stats,
    hosts,
    selectedHostId,
    setSelectedHostId,
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
