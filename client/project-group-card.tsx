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

  return (
    <View style={[styles.groupCard, { borderColor: `${borderColor}60` }]}>
      {/* Group Header */}
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsExpanded(!isExpanded)}
        style={[styles.header, { backgroundColor: `${surfaceColor}60` }]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.arrow, { color: foregroundMutedColor }]}>
            {isExpanded ? "▼" : "▶"}
          </Text>
          <Text style={[styles.projectName, { color: foregroundColor }]}>
            📁 {group.projectName}
          </Text>
          <View style={styles.countBadge}>
            <Text style={[styles.countText, { color: foregroundMutedColor }]}>
              {group.sessions.length}
            </Text>
          </View>
        </View>

        {/* Status Pills */}
        <View style={styles.headerRight}>
          {group.runningCount > 0 ? (
            <View style={[styles.pill, styles.runningPill]}>
              <Text style={styles.runningText}>{group.runningCount} 运行中</Text>
            </View>
          ) : null}
          {group.attentionCount > 0 ? (
            <View style={[styles.pill, styles.attentionPill]}>
              <Text style={styles.attentionText}>{group.attentionCount} 待处理</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* Expanded Session Rows */}
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
    marginVertical: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrow: {
    fontSize: 9,
  },
  projectName: {
    fontSize: 12,
    fontWeight: "700",
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 0.5,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  runningPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  runningText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
  },
  attentionPill: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  attentionText: {
    fontSize: 10,
    color: "#F59E0B",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
