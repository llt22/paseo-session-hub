import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ProjectGroup, UnifiedSession } from "../shared/types";
import { FilterTabs } from "./filter-tabs";
import { ProjectGroupCard } from "./project-group-card";
import { SearchBar } from "./search-bar";
import { SessionCard } from "./session-card";
import { SessionRow } from "./session-row";
import { useSessions } from "./use-sessions";

export function SessionHubView({ theme, layout, host, navigation }: PluginSurfaceProps) {
  const {
    filteredSessions,
    projectGroups,
    stats,
    isLoading,
    isFetching,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    refetch,
    archiveSession,
    bulkArchiveClosed,
    isArchiving,
    renameSession,
  } = useSessions(host.id);

  const [now, setNow] = useState(() => Date.now());

  // Periodically refresh relative timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15_000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenSession = (agentId: string) => {
    try {
      if (navigation && typeof navigation.openAgent === "function") {
        navigation.openAgent({ agentId });
      }
    } catch (err) {
      console.error("Session Hub: failed to open agent", agentId, err);
    }
  };

  const colors = theme.colors;
  const gutter = layout.compact ? 12 : 20;

  // 3 columns on standard desktop, 1 on compact/mobile
  const isGrid = viewMode === "grid";
  const numColumns = isGrid ? (layout.compact ? 1 : 3) : 1;
  const listKey = isGrid ? (layout.compact ? "grid-1" : "grid-3") : "list-1";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface0 }]}>
      {/* 1. Header Area: Search Bar & Filter Tabs */}
      <View style={[styles.header, { paddingHorizontal: gutter, paddingTop: gutter }]}>
        <SearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onRefresh={refetch}
          isFetching={isFetching}
          closedCount={stats.closed}
          onBulkArchive={bulkArchiveClosed}
          isArchiving={isArchiving}
          foregroundColor={colors.foreground}
          foregroundMutedColor={colors.foregroundMuted}
          borderColor={colors.border}
          surfaceColor={colors.surface1}
          accentColor={colors.accent}
        />

        <FilterTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          stats={stats}
          accentColor={colors.accent}
          foregroundColor={colors.foreground}
          foregroundMutedColor={colors.foregroundMuted}
          borderColor={colors.border}
        />
      </View>

      {/* 2. Error Banner */}
      {error ? (
        <View style={[styles.errorBanner, { marginHorizontal: gutter }]}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : null}

      {/* 3. Main Content List / Grid */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[styles.loadingText, { color: colors.foregroundMuted }]}>
            加载会话中...
          </Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            未找到匹配的会话
          </Text>
          <Text style={[styles.emptySub, { color: colors.foregroundMuted }]}>
            {searchQuery
              ? `没有包含 "${searchQuery}" 的结果`
              : "当前分类下暂无会话"}
          </Text>
        </View>
      ) : viewMode === "flat" ? (
        <FlatList<UnifiedSession>
          key="flat-list"
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: gutter, paddingBottom: 30 },
          ]}
          renderItem={({ item }) => (
            <SessionRow
              session={item}
              now={now}
              onOpenSession={handleOpenSession}
              onArchiveSession={archiveSession}
              onRenameSession={renameSession}
              foregroundColor={colors.foreground}
              foregroundMutedColor={colors.foregroundMuted}
              borderColor={colors.border}
              surfaceColor={colors.surface1}
              accentColor={colors.accent}
            />
          )}
        />
      ) : viewMode === "grid" ? (
        <FlatList<UnifiedSession>
          key={listKey}
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: gutter, paddingBottom: 30 },
          ]}
          renderItem={({ item }) => (
            <View style={numColumns > 1 ? styles.gridItem : styles.fullWidthItem}>
              <SessionCard
                session={item}
                now={now}
                onOpenSession={handleOpenSession}
                onArchiveSession={archiveSession}
                onRenameSession={renameSession}
                foregroundColor={colors.foreground}
                foregroundMutedColor={colors.foregroundMuted}
                borderColor={colors.border}
                surfaceColor={colors.surface1}
                accentColor={colors.accent}
              />
            </View>
          )}
        />
      ) : (
        <FlatList<ProjectGroup>
          key="grouped-list"
          data={projectGroups}
          keyExtractor={(item) => item.projectId}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: gutter, paddingBottom: 30 },
          ]}
          renderItem={({ item }) => (
            <ProjectGroupCard
              group={item}
              now={now}
              onOpenSession={handleOpenSession}
              onArchiveSession={archiveSession}
              onRenameSession={renameSession}
              foregroundColor={colors.foreground}
              foregroundMutedColor={colors.foregroundMuted}
              borderColor={colors.border}
              surfaceColor={colors.surface1}
              accentColor={colors.accent}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: 10,
    paddingBottom: 8,
  },
  listContent: {
    paddingTop: 4,
  },
  gridRow: {
    gap: 10,
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
  },
  fullWidthItem: {
    marginBottom: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptySub: {
    fontSize: 13,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    marginBottom: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
  },
});
