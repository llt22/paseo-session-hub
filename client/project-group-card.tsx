import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ProjectGroup } from "../shared/types";
import { SessionRow } from "./session-row";

interface ProjectGroupCardProps {
  readonly group: ProjectGroup;
  readonly now: number;
  readonly onOpenSession: (sessionId: string) => void;
  readonly onArchiveSession?: (sessionId: string) => void;
  readonly onRenameSession?: (workspaceId: string, newTitle: string) => void;
  readonly foregroundColor?: string;
  readonly foregroundMutedColor?: string;
  readonly borderColor?: string;
  readonly surfaceColor?: string;
  readonly accentColor?: string;
}

export function ProjectGroupCard({
  group,
  now,
  onOpenSession,
  onArchiveSession,
  onRenameSession,
  foregroundColor = "#F3F4F6",
  foregroundMutedColor = "#9CA3AF",
  borderColor = "#374151",
  surfaceColor = "#1F2937",
  accentColor = "#3B82F6",
}: ProjectGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasRunning = group.runningCount > 0;
  const hasAttention = group.attentionCount > 0;

  return (
    <View
      style={[
        styles.groupCard,
        {
          borderColor: hasRunning
            ? "#10B98160"
            : hasAttention
            ? "#F59E0B60"
            : `${borderColor}60`,
          backgroundColor: surfaceColor,
        },
      ]}
    >
      {/* 1. Project Section Header */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`项目: ${group.projectName}, 点击折叠/展开`}
        onPress={() => setIsExpanded(!isExpanded)}
        style={({ pressed }) => [
          styles.header,
          {
            backgroundColor: pressed
              ? "rgba(128, 128, 128, 0.08)"
              : "rgba(128, 128, 128, 0.03)",
            borderBottomColor: isExpanded ? `${borderColor}40` : "transparent",
            borderBottomWidth: isExpanded ? StyleSheet.hairlineWidth : 0,
          },
        ]}
      >
        {/* Left: Arrow + Project Icon + Project Name + Count */}
        <View style={styles.headerLeft}>
          <Text style={[styles.arrow, { color: foregroundMutedColor }]}>
            {isExpanded ? "▼" : "▶"}
          </Text>
          <Text style={styles.folderIcon}>📁</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.projectName,
              { color: foregroundColor },
              hasRunning ? styles.runningProjectText : null,
            ]}
          >
            {group.projectName}
          </Text>
          <View style={styles.countBadge}>
            <Text style={[styles.countText, { color: foregroundMutedColor }]}>
              {group.sessions.length}
            </Text>
          </View>
        </View>

        {/* Right: Active indicators */}
        <View style={styles.headerRight}>
          {hasRunning ? (
            <View style={[styles.pill, styles.runningPill]}>
              <View style={styles.runningDot} />
              <Text style={styles.runningText}>{group.runningCount} 运行中</Text>
            </View>
          ) : null}

          {hasAttention ? (
            <View style={[styles.pill, styles.attentionPill]}>
              <View style={styles.attentionDot} />
              <Text style={styles.attentionText}>{group.attentionCount} 待处理</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* 2. Expanded Sessions List */}
      {isExpanded ? (
        <View style={styles.list}>
          {group.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              now={now}
              onOpenSession={onOpenSession}
              onArchiveSession={onArchiveSession}
              onRenameSession={onRenameSession}
              foregroundColor={foregroundColor}
              foregroundMutedColor={foregroundMutedColor}
              borderColor={borderColor}
              surfaceColor={surfaceColor}
              accentColor={accentColor}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  arrow: {
    fontSize: 9,
    width: 12,
  },
  folderIcon: {
    fontSize: 13,
  },
  projectName: {
    fontSize: 13,
    fontWeight: "700",
  },
  runningProjectText: {
    color: "#10B981",
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  countText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  runningPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  runningDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10B981",
  },
  runningText: {
    fontSize: 10.5,
    color: "#10B981",
    fontWeight: "600",
  },
  attentionPill: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  attentionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#F59E0B",
  },
  attentionText: {
    fontSize: 10.5,
    color: "#F59E0B",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
