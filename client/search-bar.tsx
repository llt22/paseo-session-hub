import { Icon } from "@getpaseo/plugin/client/react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ViewMode } from "../shared/types";
import type { HostInfo } from "./hosts";

interface SearchBarProps {
  readonly query: string;
  readonly onChangeQuery: (text: string) => void;
  readonly viewMode: ViewMode;
  readonly onChangeViewMode: (mode: ViewMode) => void;
  readonly hosts: readonly HostInfo[];
  readonly selectedHostId: string;
  readonly onChangeSelectedHostId: (hostId: string) => void;
  readonly onRefresh: () => void;
  readonly isFetching: boolean;
  readonly closedCount: number;
  readonly onBulkArchive: () => void;
  readonly isArchiving: boolean;
  readonly foregroundColor?: string;
  readonly foregroundMutedColor?: string;
  readonly borderColor?: string;
  readonly surfaceColor?: string;
  readonly accentColor?: string;
}

export function SearchBar({
  query,
  onChangeQuery,
  viewMode,
  onChangeViewMode,
  hosts,
  selectedHostId,
  onChangeSelectedHostId,
  onRefresh,
  isFetching,
  closedCount,
  onBulkArchive,
  isArchiving,
  foregroundColor = "#F3F4F6",
  foregroundMutedColor = "#9CA3AF",
  borderColor = "#374151",
  surfaceColor = "#1F2937",
  accentColor = "#3B82F6",
}: SearchBarProps) {
  const hasMultipleHosts = hosts.length > 1;

  return (
    <View style={styles.container}>
      {/* 1. Search Input */}
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: surfaceColor, borderColor: `${borderColor}80` },
        ]}
      >
        <Icon name="Search" size={13} color={foregroundMutedColor} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="搜索项目、会话标题、Prompt 或模型..."
          placeholderTextColor={foregroundMutedColor}
          style={[styles.input, { color: foregroundColor }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="清空搜索"
            onPress={() => onChangeQuery("")}
            style={styles.clearBtn}
          >
            <Icon name="X" size={12} color={foregroundMutedColor} />
          </Pressable>
        ) : null}
      </View>

      {/* 2. Host Filter Selector (Visible only when multiple hosts exist) */}
      {hasMultipleHosts ? (
        <View style={[styles.switchGroup, { borderColor: `${borderColor}80` }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onChangeSelectedHostId("all")}
            style={[
              styles.switchBtn,
              selectedHostId === "all"
                ? { backgroundColor: `${accentColor}2A` }
                : undefined,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                { color: selectedHostId === "all" ? "#FFFFFF" : foregroundMutedColor },
                selectedHostId === "all" ? styles.switchTextActive : null,
              ]}
            >
              全部设备
            </Text>
          </Pressable>

          {hosts.map((h) => {
            const isSelected = selectedHostId === h.serverId;
            return (
              <Pressable
                key={h.serverId}
                accessibilityRole="button"
                onPress={() => onChangeSelectedHostId(h.serverId)}
                style={[
                  styles.switchBtn,
                  isSelected ? { backgroundColor: `${accentColor}2A` } : undefined,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.switchText,
                    { color: isSelected ? "#FFFFFF" : foregroundMutedColor },
                    isSelected ? styles.switchTextActive : null,
                  ]}
                >
                  {h.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* 3. Right Toolbar: View Switcher & Action Buttons */}
      <View style={styles.tools}>
        {/* View Mode Switcher */}
        <View style={[styles.switchGroup, { borderColor: `${borderColor}80` }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="项目优先视图"
            onPress={() => onChangeViewMode("grouped")}
            style={[
              styles.switchBtn,
              viewMode === "grouped"
                ? { backgroundColor: `${accentColor}2A` }
                : undefined,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                { color: viewMode === "grouped" ? "#FFFFFF" : foregroundMutedColor },
                viewMode === "grouped" ? styles.switchTextActive : null,
              ]}
            >
              按项目
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="时间线列表模式"
            onPress={() => onChangeViewMode("flat")}
            style={[
              styles.switchBtn,
              viewMode === "flat"
                ? { backgroundColor: `${accentColor}2A` }
                : undefined,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                { color: viewMode === "flat" ? "#FFFFFF" : foregroundMutedColor },
                viewMode === "flat" ? styles.switchTextActive : null,
              ]}
            >
              时间线
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="卡片网格模式"
            onPress={() => onChangeViewMode("grid")}
            style={[
              styles.switchBtn,
              viewMode === "grid"
                ? { backgroundColor: `${accentColor}2A` }
                : undefined,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                { color: viewMode === "grid" ? "#FFFFFF" : foregroundMutedColor },
                viewMode === "grid" ? styles.switchTextActive : null,
              ]}
            >
              卡片
            </Text>
          </Pressable>
        </View>

        {/* Bulk Archive Button */}
        {closedCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`清理 ${closedCount} 个已结束会话`}
            disabled={isArchiving}
            onPress={onBulkArchive}
            style={[styles.archiveBtn, { borderColor: `${borderColor}60` }]}
          >
            <Icon name="Archive" size={11} color="#EF4444" />
            <Text style={styles.archiveText}>
              {isArchiving ? "清理中..." : `清理 ${closedCount} 个已结束`}
            </Text>
          </Pressable>
        ) : null}

        {/* Refresh Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="刷新会话列表"
          onPress={onRefresh}
          style={[styles.refreshBtn, { borderColor: `${borderColor}60` }]}
        >
          <View style={isFetching ? styles.spinning : null}>
            <Icon name="RefreshCw" size={12} color={foregroundMutedColor} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  inputWrapper: {
    flex: 1,
    minWidth: 240,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 7,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    padding: 2,
  },
  tools: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 7,
    overflow: "hidden",
  },
  switchBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    maxWidth: 140,
  },
  switchText: {
    fontSize: 11.5,
  },
  switchTextActive: {
    fontWeight: "600",
  },
  archiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  archiveText: {
    fontSize: 11.5,
    color: "#EF4444",
    fontWeight: "500",
  },
  refreshBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spinning: {
    opacity: 0.5,
  },
});
