import { Icon } from "@getpaseo/plugin/client/react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { STATUS_META } from "../shared/constants";
import type { UnifiedSession } from "../shared/types";
import { DiffBadge } from "./diff-badge";
import { formatModelName } from "./model-formatter";
import { formatRelativeTime } from "./time-ago";

interface SessionCardProps {
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

export function SessionCard({
  session,
  now,
  onOpenSession,
  onRenameSession,
  foregroundColor = "#F3F4F6",
  foregroundMutedColor = "#9CA3AF",
  borderColor = "#374151",
  surfaceColor = "#1F2937",
  accentColor = "#3B82F6",
}: SessionCardProps) {
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
        styles.card,
        {
          borderColor: isRunning
            ? "#10B98180"
            : isAttention
            ? "#F59E0B80"
            : `${borderColor}50`,
          backgroundColor: pressed && !isEditing ? `${surfaceColor}CC` : surfaceColor,
          opacity: isClosed && !isEditing ? 0.48 : 1.0,
        },
      ]}
    >
      {/* 1. Header (Fixed 24px) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusMeta.dotColor },
              isRunning ? styles.runningGlow : null,
              isAttention ? styles.attentionGlow : null,
            ]}
          />
          <View style={[styles.projectTag, { borderColor: `${borderColor}60` }]}>
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
        </View>

        <View style={styles.headerRight}>
          {formattedModel ? (
            <Text
              numberOfLines={1}
              style={[styles.modelQuietText, { color: foregroundMutedColor }]}
            >
              {formattedModel}
            </Text>
          ) : null}

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
      </View>

      {/* 2. Body: Fixed Height Title & Sub-workspace */}
      <View style={styles.body}>
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
                  backgroundColor: "rgba(0, 0, 0, 0.15)",
                },
              ]}
            />
            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSaveRename}
                style={[styles.editBtn, { backgroundColor: accentColor }]}
              >
                <Icon name="Check" size={11} color="#FFFFFF" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleCancelRename}
                style={[styles.editBtn, { backgroundColor: "rgba(128, 128, 128, 0.2)" }]}
              >
                <Icon name="X" size={11} color={foregroundMutedColor} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.titleSection}>
            <Text
              numberOfLines={2}
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
            {isDifferentWorkspace ? (
              <View style={styles.workspaceRow}>
                <Icon name="Folder" size={11} color={foregroundMutedColor} />
                <Text
                  numberOfLines={1}
                  style={[styles.workspaceText, { color: foregroundMutedColor }]}
                >
                  {session.workspaceName}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* 3. Footer (Fixed 22px): Diff + Time + Rename */}
      {!isEditing ? (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <DiffBadge diff={session.diff} isMuted={isClosed} />
            <Text style={[styles.timeText, { color: foregroundMutedColor }]}>
              {relativeTime}
            </Text>
          </View>

          {onRenameSession ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="重命名标题"
              onPress={() => {
                setEditTitle(session.title);
                setIsEditing(true);
              }}
              style={styles.renameBtn}
            >
              <Icon name="Pencil" size={11} color={foregroundMutedColor} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 136,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  header: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
  },
  runningGlow: {
    shadowColor: "#10B981",
    shadowRadius: 5,
    shadowOpacity: 0.9,
  },
  attentionGlow: {
    shadowColor: "#F59E0B",
    shadowRadius: 5,
    shadowOpacity: 0.9,
  },
  projectTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: "rgba(128, 128, 128, 0.04)",
  },
  projectText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  modelQuietText: {
    fontSize: 10,
    opacity: 0.45,
    maxWidth: 90,
  },
  statusPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 4,
  },
  titleSection: {
    gap: 3,
  },
  titleText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  workspaceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workspaceText: {
    fontSize: 11,
    opacity: 0.7,
  },
  editWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  editActions: {
    flexDirection: "row",
    gap: 4,
  },
  editBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 10.5,
  },
  renameBtn: {
    padding: 2,
    opacity: 0.7,
  },
});
