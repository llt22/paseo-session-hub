import type {
  FilterTab,
  HubStats,
  ProjectGroup,
  SessionDiff,
  SessionStatus,
  UnifiedSession,
} from "../shared/types";
import type { PaseoApiLike } from "./observation";

const PAGE_LIMIT = 200;
const MAX_PAGES = 10;
const PARENT_AGENT_ID_LABEL = "paseo.parent-agent-id";

interface RawAgentSnapshot {
  id: string;
  workspaceId?: string | null;
  provider?: string;
  model?: string | null;
  title?: string | null;
  status?: string;
  requiresAttention?: boolean;
  attentionReason?: string | null;
  attentionTimestamp?: string | null;
  pendingPermissions?: readonly unknown[];
  labels?: Record<string, string>;
  updatedAt?: string;
  createdAt?: string;
  diffStat?: { additions?: number; deletions?: number } | null;
}

interface RawAgentEntry {
  agent: RawAgentSnapshot;
  project: {
    projectId: string;
    projectName: string;
    workspaceName?: string | null;
  };
}

interface RawWorkspaceSummary {
  id: string;
  projectId: string;
  projectDisplayName: string;
  name: string;
  pinnedAt?: string | null;
  diffStat?: { additions?: number; deletions?: number } | null;
}

function computeSessionStatus(agent: RawAgentSnapshot): SessionStatus {
  if (agent.status === "closed") return "closed";
  const permissions = agent.pendingPermissions ?? [];
  if (agent.requiresAttention || agent.status === "error" || permissions.length > 0) {
    return "attention";
  }
  if (agent.status === "running" || agent.status === "initializing") {
    return "running";
  }
  return "idle";
}

function computeStateText(agent: RawAgentSnapshot): string {
  const permissions = agent.pendingPermissions ?? [];
  if (permissions.length > 0) {
    return permissions.length === 1 ? "等待授权" : `${permissions.length} 项授权`;
  }
  if (agent.status === "error") return "执行错误";
  if (agent.requiresAttention) return agent.attentionReason?.trim() || "需要介入";
  if (agent.status === "initializing") return "正在初始化";
  if (agent.status === "running") return "正在运行";
  if (agent.status === "closed") return "已结束";
  return "空闲";
}

function parseTime(isoString?: string | null, fallback: number = Date.now()): number {
  if (!isoString) return fallback;
  const parsed = Date.parse(isoString);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function normalizeSession(
  entry: RawAgentEntry,
  workspacesMap: ReadonlyMap<string, RawWorkspaceSummary>,
): UnifiedSession {
  const { agent, project } = entry;
  const workspace = agent.workspaceId ? workspacesMap.get(agent.workspaceId) : undefined;
  const status = computeSessionStatus(agent);
  const stateText = computeStateText(agent);

  const rawTitle = agent.title?.trim();
  const title = rawTitle && rawTitle.length > 0 ? rawTitle : `会话 ${agent.id.slice(0, 7)}`;

  const diff: SessionDiff = {
    additions: agent.diffStat?.additions ?? workspace?.diffStat?.additions ?? 0,
    deletions: agent.diffStat?.deletions ?? workspace?.diffStat?.deletions ?? 0,
  };

  const labels = agent.labels ?? {};
  const parentAgentId = labels[PARENT_AGENT_ID_LABEL] || null;

  return {
    id: agent.id,
    title,
    workspaceId: agent.workspaceId ?? "",
    workspaceName: project.workspaceName?.trim() || workspace?.name || project.projectName,
    projectId: project.projectId,
    projectName: project.projectName,
    status,
    stateText,
    provider: agent.provider ?? "unknown",
    model: agent.model ?? null,
    updatedAt: parseTime(agent.updatedAt),
    createdAt: parseTime(agent.createdAt),
    waitingSince: agent.attentionTimestamp ? parseTime(agent.attentionTimestamp) : null,
    diff,
    isPinned: Boolean(workspace?.pinnedAt),
    parentAgentId,
  };
}

export async function fetchAllSessions(paseo: PaseoApiLike): Promise<readonly UnifiedSession[]> {
  const [agentsRes, workspacesRes] = await Promise.all([
    (async () => {
      const all: RawAgentEntry[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < MAX_PAGES; page += 1) {
        const res = await paseo.agents.list({
          sort: [{ key: "updated_at", direction: "desc" }],
          page: { limit: PAGE_LIMIT, ...(cursor ? { cursor } : {}) },
        });
        const entries = (res.entries ?? []) as unknown as RawAgentEntry[];
        all.push(...entries);
        cursor = res.pageInfo?.hasMore ? (res.pageInfo.nextCursor ?? undefined) : undefined;
        if (!cursor) break;
      }
      return all;
    })(),
    (async () => {
      const res = await paseo.workspaces.list();
      return (res.entries ?? []) as unknown as RawWorkspaceSummary[];
    })(),
  ]);

  const workspacesMap = new Map<string, RawWorkspaceSummary>();
  for (const ws of workspacesRes) {
    workspacesMap.set(ws.id, ws);
  }

  const sessions = agentsRes.map((entry) => normalizeSession(entry, workspacesMap));

  // Sort by updatedAt descending (Linear / Spotlight style)
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function computeHubStats(sessions: readonly UnifiedSession[]): HubStats {
  let running = 0;
  let attention = 0;
  let idle = 0;
  let closed = 0;

  for (const s of sessions) {
    if (s.status === "running") running += 1;
    else if (s.status === "attention") attention += 1;
    else if (s.status === "idle") idle += 1;
    else if (s.status === "closed") closed += 1;
  }

  return {
    total: sessions.length,
    running,
    attention,
    idle,
    closed,
  };
}

export function filterSessions(
  sessions: readonly UnifiedSession[],
  query: string,
  tab: FilterTab,
): readonly UnifiedSession[] {
  const normalizedQuery = query.trim().toLowerCase();

  return sessions.filter((s) => {
    // 1. Tab filter
    if (tab !== "all" && s.status !== tab) {
      return false;
    }

    // 2. Query filter
    if (normalizedQuery.length === 0) {
      return true;
    }

    const matchesSearch =
      s.title.toLowerCase().includes(normalizedQuery) ||
      s.projectName.toLowerCase().includes(normalizedQuery) ||
      s.workspaceName.toLowerCase().includes(normalizedQuery) ||
      s.id.toLowerCase().includes(normalizedQuery) ||
      (s.model && s.model.toLowerCase().includes(normalizedQuery)) ||
      s.provider.toLowerCase().includes(normalizedQuery) ||
      s.stateText.toLowerCase().includes(normalizedQuery);

    return matchesSearch;
  });
}

export function groupSessionsByProject(
  sessions: readonly UnifiedSession[],
): readonly ProjectGroup[] {
  const groupsMap = new Map<
    string,
    {
      projectId: string;
      projectName: string;
      sessions: UnifiedSession[];
      runningCount: number;
      attentionCount: number;
    }
  >();

  for (const s of sessions) {
    let group = groupsMap.get(s.projectId);
    if (!group) {
      group = {
        projectId: s.projectId,
        projectName: s.projectName,
        sessions: [],
        runningCount: 0,
        attentionCount: 0,
      };
      groupsMap.set(s.projectId, group);
    }
    group.sessions.push(s);
    if (s.status === "running") group.runningCount += 1;
    if (s.status === "attention") group.attentionCount += 1;
  }

  return Array.from(groupsMap.values());
}
