import type { PaseoApi } from "@getpaseo/client";
import * as pluginClient from "@getpaseo/plugin/client";
import { useMemo } from "react";

export type HostStatus = "idle" | "connecting" | "online" | "offline" | "error";

export interface HostInfo {
  readonly serverId: string;
  readonly label: string;
  readonly status: HostStatus;
  readonly isOnline: boolean;
  readonly isCurrent: boolean;
}

interface HostSummary {
  readonly serverId: string;
  readonly label: string;
  readonly status: HostStatus;
}

const readHostsHook: () => readonly HostSummary[] | null =
  typeof (pluginClient as { useHosts?: unknown }).useHosts === "function"
    ? (pluginClient as unknown as { useHosts: () => readonly HostSummary[] }).useHosts
    : () => null;

const borrowClient: ((serverId: string) => PaseoApi) | null =
  typeof (pluginClient as { getPaseoClient?: unknown }).getPaseoClient === "function"
    ? (pluginClient as unknown as { getPaseoClient: (serverId: string) => PaseoApi }).getPaseoClient
    : null;

export const MULTI_HOST_SUPPORTED = borrowClient !== null;

/**
 * Hook to get all configured hosts across paired machines.
 * Guarantees the surface's own host is present and first.
 */
export function useConnectedHosts(ownHost: { id: string; label: string }): readonly HostInfo[] {
  const summaries = readHostsHook();
  return useMemo(() => {
    const list: HostInfo[] = [];
    for (const s of summaries ?? []) {
      list.push({
        serverId: s.serverId,
        label: s.label || s.serverId,
        status: s.status,
        isOnline: s.status === "online" && borrowClient !== null,
        isCurrent: s.serverId === ownHost.id,
      });
    }
    const ownIdx = list.findIndex((h) => h.serverId === ownHost.id);
    if (ownIdx < 0) {
      list.unshift({
        serverId: ownHost.id,
        label: ownHost.label || ownHost.id,
        status: "online",
        isOnline: true,
        isCurrent: true,
      });
    } else if (ownIdx > 0) {
      const [h] = list.splice(ownIdx, 1);
      if (h) list.unshift({ ...h, isCurrent: true });
    }
    return list;
  }, [ownHost.id, ownHost.label, summaries]);
}

/**
 * Resolves the PaseoApi instance for a specific server/host.
 */
export function resolveHostApi(
  serverId: string,
  own: { id: string; api: PaseoApi },
): PaseoApi | null {
  if (serverId === own.id) return own.api;
  if (!borrowClient) return null;
  try {
    return borrowClient(serverId);
  } catch (err) {
    console.warn("Session Hub: failed to resolve host API for", serverId, err);
    return null;
  }
}
