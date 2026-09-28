import { Pressable, StyleSheet, Text, View } from "react-native";
import { FILTER_TABS } from "../shared/constants";
import type { FilterTab, HubStats } from "../shared/types";

interface FilterTabsProps {
  readonly activeTab: FilterTab;
  readonly onChangeTab: (tab: FilterTab) => void;
  readonly stats: HubStats;
  readonly accentColor?: string;
  readonly foregroundColor?: string;
  readonly foregroundMutedColor?: string;
  readonly borderColor?: string;
}

export function FilterTabs({
  activeTab,
  onChangeTab,
  stats,
  accentColor = "#3B82F6",
  foregroundColor = "#F3F4F6",
  foregroundMutedColor = "#9CA3AF",
  borderColor = "#374151",
}: FilterTabsProps) {
  const getCount = (tab: FilterTab): number => {
    switch (tab) {
      case "all":
        return stats.total;
      case "running":
        return stats.running;
      case "attention":
        return stats.attention;
      case "idle":
        return stats.idle;
      case "closed":
        return stats.closed;
    }
  };

  return (
    <View style={styles.container}>
      {FILTER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = getCount(tab.id);

        let dotColor: string | null = null;
        if (tab.id === "running" && count > 0) dotColor = "#10B981";
        if (tab.id === "attention" && count > 0) dotColor = "#F59E0B";

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChangeTab(tab.id)}
            style={[
              styles.tab,
              {
                borderColor: isActive ? accentColor : `${borderColor}60`,
                backgroundColor: isActive ? `${accentColor}1A` : "transparent",
              },
            ]}
          >
            {dotColor ? (
              <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            ) : null}
            <Text
              style={[
                styles.label,
                { color: isActive ? foregroundColor : foregroundMutedColor },
                isActive ? styles.labelActive : null,
              ]}
            >
              {tab.label}
            </Text>
            {count > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  isActive
                    ? { backgroundColor: accentColor }
                    : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? "#FFFFFF" : foregroundMutedColor },
                  ]}
                >
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countBadge: {
    paddingHorizontal: 4.5,
    paddingVertical: 0.5,
    borderRadius: 8,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeInactive: {
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
