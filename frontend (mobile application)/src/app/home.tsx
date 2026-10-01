import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>Hello, Citizen 👋</Text>

      {/* Main Title */}
      <Text style={styles.title}>
        How can we improve your city?
      </Text>

      {/* Report Issue Button */}
      <Pressable
        style={styles.reportButton}
        onPress={() => router.push("/report")}
      >
        <Text style={styles.reportText}>+ REPORT AN ISSUE</Text>
      </Pressable>

      {/* My Issues */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push("/my-issues")}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Issues</Text>
          <Text style={styles.arrow}>›</Text>
        </View>

        <Text style={styles.cardText}>
          Track your reported civic issues here.
        </Text>

        <Text style={styles.cardAction}>
          View My Issues →
        </Text>
      </Pressable>

      {/* Recent Updates */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => {
          // Updates screen will be added next
          console.log("Recent Updates pressed");
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Updates</Text>
          <Text style={styles.arrow}>›</Text>
        </View>

        <Text style={styles.cardText}>
          Notifications about your complaints will appear here.
        </Text>

        <Text style={styles.cardAction}>
          View Updates →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 25,
    paddingTop: 70,
  },

  greeting: {
    fontSize: 17,
    color: "#64748B",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 30,
  },

  reportButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },

  reportText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 28,
    color: "#64748B",
    fontWeight: "300",
  },

  cardText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },

  cardAction: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
  },
});