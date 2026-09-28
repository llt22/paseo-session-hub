import { Icon } from "@getpaseo/plugin/client/react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ProjectGroup } from "../shared/types";
import { SessionRow } from "./session-row";

interface ProjectGroupCardProps {
  readonly group: ProjectGroup;
  readonly now: number;
  readonly onOpenSession: (sessionId: string, serverId: string) => void;
  readonly onArchiveSession?: (sessionId: string, serverId: string) => void;
  readonly onRenameSession?: (workspaceId: string, newTitle: string, serverId: string) => void;
  readonly showHostBadge?: boolean;
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
  showHostBadge = false,
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
        {/* Left: SVG Arrow + SVG Folder + Project Name + Host Tag + Count */}
        <View style={styles.headerLeft}>
          <Icon
            name={isExpanded ? "ChevronDown" : "ChevronRight"}
            size={13}
            color={foregroundMutedColor}
          />
          <Icon name="Folder" size={14} color={accentColor} />
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

          {showHostBadge && group.serverLabel ? (
            <View style={[styles.hostTag, { borderColor: `${borderColor}60` }]}>
              <Text style={[styles.hostText, { color: foregroundMutedColor }]}>
                {group.serverLabel}
              </Text>
            </View>
          ) : null}

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

      {/* 2. Expanded Sessions List with Bounded Max Height & Smooth Scrolling */}
      {isExpanded ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.listContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={group.sessions.length > 5}
        >
          {group.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              now={now}
              onOpenSession={onOpenSession}
              onArchiveSession={onArchiveSession}
              onRenameSession={onRenameSession}
              showHostBadge={showHostBadge}
              foregroundColor={foregroundColor}
              foregroundMutedColor={foregroundMutedColor}
              borderColor={borderColor}
              surfaceColor={surfaceColor}
              accentColor={accentColor}
            />
          ))}
        </ScrollView>
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
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  projectName: {
    fontSize: 13,
    fontWeight: "700",
  },
  runningProjectText: {
    color: "#10B981",
  },
  hostTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: "rgba(128, 128, 128, 0.08)",
  },
  hostText: {
    fontSize: 10,
    fontWeight: "600",
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
  scrollContainer: {
    maxHeight: 330,
  },
  listContent: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
