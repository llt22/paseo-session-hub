import type { FilterTab, SessionStatus } from "./types";

export const FILTER_TABS: readonly {
  readonly id: FilterTab;
  readonly label: string;
  readonly icon: string;
}[] = [
  { id: "all", label: "全部会话", icon: "List" },
  { id: "running", label: "运行中", icon: "Play" },
  { id: "attention", label: "待处理", icon: "AlertCircle" },
  { id: "idle", label: "空闲", icon: "Clock" },
  { id: "closed", label: "已结束", icon: "CheckCircle" },
];

export const STATUS_META: Record<
  SessionStatus,
  {
    readonly label: string;
    readonly color: string;
    readonly badgeColor: string;
    readonly dotColor: string;
  }
> = {
  running: {
    label: "运行中",
    color: "#10B981", // Emerald 500
    badgeColor: "rgba(16, 185, 129, 0.15)",
    dotColor: "#10B981",
  },
  attention: {
    label: "待处理",
    color: "#F59E0B", // Amber 500
    badgeColor: "rgba(245, 158, 11, 0.15)",
    dotColor: "#F59E0B",
  },
  idle: {
    label: "空闲",
    color: "#6B7280", // Gray 500
    badgeColor: "rgba(107, 114, 128, 0.15)",
    dotColor: "#9CA3AF",
  },
  closed: {
    label: "已结束",
    color: "#4B5563", // Gray 600
    badgeColor: "rgba(75, 85, 99, 0.15)",
    dotColor: "#4B5563",
  },
};
