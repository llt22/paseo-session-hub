export type SessionStatus = "running" | "attention" | "idle" | "closed";

export type FilterTab = "all" | "running" | "attention" | "idle" | "closed";

export type ViewMode = "flat" | "grouped" | "grid";

export type SortMode = "activity" | "created" | "project";

export interface SessionDiff {
  readonly additions: number;
  readonly deletions: number;
}

export interface UnifiedSession {
  readonly id: string;
  readonly title: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly status: SessionStatus;
  readonly stateText: string;
  readonly provider: string;
  readonly model: string | null;
  readonly updatedAt: number;
  readonly createdAt: number;
  readonly waitingSince: number | null;
  readonly diff: SessionDiff;
  readonly isPinned: boolean;
  readonly parentAgentId: string | null;
}

export interface ProjectGroup {
  readonly projectId: string;
  readonly projectName: string;
  readonly sessions: readonly UnifiedSession[];
  readonly runningCount: number;
  readonly attentionCount: number;
}

export interface HubStats {
  readonly total: number;
  readonly running: number;
  readonly attention: number;
  readonly idle: number;
  readonly closed: number;
}
