import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { STATUS_META } from "../shared/constants";
import type { UnifiedSession } from "../shared/types";
import { DiffBadge } from "./diff-badge";
import { formatModelName } from "./model-formatter";
import { formatRelativeTime } from "./time-ago";

interface SessionRowProps {
  readonly session: UnifiedSession;
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

export function SessionRow({
  session,
  now,
  onOpenSession,
  onRenameSession,
  foregroundColor = "#F3F4F6",
  foregroundMutedColor = "#9CA3AF",
  borderColor = "#374151",
  surfaceColor = "#1F2937",
  accentColor = "#3B82F6",
}: SessionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const isClosed = session.status === "closed";
  const isRunning = session.status === "running";
  const isAttention = session.status === "attention";

  const statusMeta = STATUS_META[session.status];
  const relativeTime = formatRelativeTime(session.updatedAt, now);
  const formattedModel = formatModelName(session.model);

  const isDifferentWorkspace =
    session.workspaceName &&
    session.workspaceName !== session.projectName;

  const handleSaveRename = () => {
    if (onRenameSession && editTitle.trim()) {
      onRenameSession(session.workspaceId, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(session.title);
    setIsEditing(false);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`打开会话: ${session.title}`}
      onPress={() => {
        if (!isEditing) {
          onOpenSession(session.id);
        }
      }}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: `${borderColor}30`,
          backgroundColor: pressed && !isEditing ? "rgba(128, 128, 128, 0.08)" : "transparent",
          opacity: isClosed && !isEditing ? 0.45 : 1.0,
        },
      ]}
    >
      {/* 1. Left Section: Status Dot + Project Badge + Title (or Edit Input) + Sub-workspace */}
      <View style={styles.leftSection}>
        {/* Status Dot */}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusMeta.dotColor },
            isRunning ? styles.runningGlow : null,
            isAttention ? styles.attentionGlow : null,
          ]}
        />

        {/* Project Tag */}
        <View style={[styles.projectTag, { borderColor: `${borderColor}70` }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.projectText,
              { color: isClosed ? foregroundMutedColor : accentColor },
            ]}
          >
            {session.projectName}
          </Text>
        </View>

        {/* Title or Inline Edit Input */}
        {isEditing ? (
          <View style={styles.editWrapper}>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              onSubmitEditing={handleSaveRename}
              autoFocus
              selectTextOnFocus
              style={[
                styles.editInput,
                {
                  color: foregroundColor,
                  borderColor: accentColor,
                  backgroundColor: surfaceColor,
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="保存标题"
              onPress={handleSaveRename}
              style={[styles.editBtn, { backgroundColor: accentColor }]}
            >
              <Text style={styles.btnTextWhite}>✓</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="取消修改"
              onPress={handleCancelRename}
              style={[styles.editBtn, { backgroundColor: "rgba(128, 128, 128, 0.2)" }]}
            >
              <Text style={[styles.btnText, { color: foregroundMutedColor }]}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.titleContainer}>
            <Text
              numberOfLines={1}
              style={[
                styles.titleText,
                {
                  color: isClosed ? foregroundMutedColor : foregroundColor,
                  fontWeight: isRunning || isAttention ? "600" : "500",
                },
              ]}
            >
              {session.title}
            </Text>

            {/* Rename Pencil Icon Button */}
            {onRenameSession ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="重命名会话标题"
                onPress={() => {
                  setEditTitle(session.title);
                  setIsEditing(true);
                }}
                style={styles.renameBtn}
              >
                <Text style={[styles.pencilIcon, { color: foregroundMutedColor }]}>✏️</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {/* Workspace sub-scope */}
        {isDifferentWorkspace && !isEditing ? (
          <Text
            numberOfLines={1}
            style={[styles.workspaceText, { color: foregroundMutedColor }]}
          >
            · {session.workspaceName}
          </Text>
        ) : null}
      </View>

      {/* 2. Right Section: DiffStat + Relative Time + Muted Model + Status Badge */}
      {!isEditing ? (
        <View style={styles.rightSection}>
          {/* Code DiffStat */}
          <DiffBadge diff={session.diff} isMuted={isClosed} />

          {/* Time Ago */}
          <Text style={[styles.timeText, { color: foregroundMutedColor }]}>
            {relativeTime}
          </Text>

          {/* Ultra-Muted Quiet Model Label (No heavy pill background) */}
          {formattedModel ? (
            <Text
              numberOfLines={1}
              style={[styles.modelQuietText, { color: foregroundMutedColor }]}
            >
              {formattedModel}
            </Text>
          ) : null}

          {/* Status Badge */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isClosed
                  ? "transparent"
                  : statusMeta.badgeColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isClosed ? foregroundMutedColor : statusMeta.color },
              ]}
            >
              {statusMeta.label}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginVertical: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    gap: 14,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  runningGlow: {
    shadowColor: "#10B981",
    shadowRadius: 6,
    shadowOpacity: 0.9,
  },
  attentionGlow: {
    shadowColor: "#F59E0B",
    shadowRadius: 6,
    shadowOpacity: 0.9,
  },
  projectTag: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: "rgba(128, 128, 128, 0.04)",
  },
  projectText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleText: {
    flexShrink: 1,
    fontSize: 13.5,
    lineHeight: 18,
  },
  renameBtn: {
    padding: 3,
    borderRadius: 4,
    opacity: 0.7,
  },
  pencilIcon: {
    fontSize: 10,
  },
  editWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextWhite: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  btnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  workspaceText: {
    flexShrink: 2,
    fontSize: 12,
    opacity: 0.75,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  timeText: {
    fontSize: 11.5,
    minWidth: 44,
    textAlign: "right",
  },
  modelQuietText: {
    fontSize: 10.5,
    opacity: 0.45,
    maxWidth: 90,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    minWidth: 48,
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
