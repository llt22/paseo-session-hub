import { StyleSheet, Text, View } from "react-native";
import type { SessionDiff } from "../shared/types";

interface DiffBadgeProps {
  readonly diff: SessionDiff;
  readonly isMuted?: boolean;
}

export function DiffBadge({ diff, isMuted = false }: DiffBadgeProps) {
  const { additions, deletions } = diff;
  if (additions === 0 && deletions === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {additions > 0 ? (
        <Text style={[styles.text, isMuted ? styles.muted : styles.add]}>
          +{additions.toLocaleString()}
        </Text>
      ) : null}
      {deletions > 0 ? (
        <Text style={[styles.text, isMuted ? styles.muted : styles.del]}>
          −{deletions.toLocaleString()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(128, 128, 128, 0.08)",
  },
  text: {
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  add: {
    color: "#10B981",
  },
  del: {
    color: "#EF4444",
  },
  muted: {
    color: "#6B7280",
  },
});
