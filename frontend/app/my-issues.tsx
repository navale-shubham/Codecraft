import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { api } from "../services/api";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Issue = {
  id?: string;
  issueNumber?: string;
  title?: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  wardName?: string;
  status?: string;
  assignedToName?: string;
  assigneeName?: string;
  reportedAt?: string;
  dueAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  [key: string]: any;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(value?: string) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status?: string) {
  if (!status) {
    return "UNKNOWN";
  }

  return status.replace(/_/g, " ");
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function MyIssuesScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ------------------------------------------------
  // Load My Issues
  // ------------------------------------------------

  const loadIssues = async (
    showFullLoader = true
  ) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      }

      setErrorMessage("");

      console.log(
        "Loading citizen issues..."
      );

      const response = await api.get(
        "/citizens/issues"
      );

      console.log(
        "MY ISSUES API RESPONSE:",
        response.data
      );

      // Final API specification:
      //
      // {
      //   "success": true,
      //   "data": []
      // }

      const responseData =
        response.data?.data;

      if (Array.isArray(responseData)) {
        setIssues(responseData);
      } else {
        console.error(
          "Unexpected issues response:",
          response.data
        );

        setIssues([]);

        setErrorMessage(
          "The server returned an unexpected issues format."
        );
      }
    } catch (error: any) {
      console.error(
        "MY ISSUES ERROR:",
        error
      );

      console.error(
        "ERROR MESSAGE:",
        error?.message
      );

      console.error(
        "ERROR CODE:",
        error?.code
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      console.error(
        "SERVER STATUS:",
        error?.response?.status
      );

      if (
        error?.response?.status === 401
      ) {
        Alert.alert(
          "Session Expired",
          "Please login again.",
          [
            {
              text: "Login",
              onPress: () =>
                router.replace("/login"),
            },
          ]
        );

        return;
      }

      if (
        error?.response?.status === 403
      ) {
        setErrorMessage(
          "You are not authorized to view your issues."
        );
        return;
      }

      if (
        error?.response?.status === 404
      ) {
        setErrorMessage(
          "The My Issues API was not found on the server."
        );
        return;
      }

      if (error?.response?.status >= 500) {
        setErrorMessage(
          "The server encountered an error. Please try again later."
        );
        return;
      }

      if (error?.request) {
        setErrorMessage(
          "Could not connect to the backend. Check your backend connection and try again."
        );
        return;
      }

      setErrorMessage(
        "Unable to load your issues. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ------------------------------------------------
  // Load every time screen becomes active
  // ------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      loadIssues(true);
    }, [])
  );

  // ------------------------------------------------
  // Pull to Refresh
  // ------------------------------------------------

  const handleRefresh = () => {
    setRefreshing(true);
    loadIssues(false);
  };

  // ------------------------------------------------
  // Open Issue Details
  // ------------------------------------------------

  const openIssue = (issue: Issue) => {
    if (!issue.id) {
      Alert.alert(
        "Unable to Open Issue",
        "This issue does not contain a valid issue ID."
      );
      return;
    }

    router.push({
      pathname: "/issue-details",
      params: {
        issueId: issue.id,
      },
    });
  };

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading your issues...
        </Text>
      </View>
    );
  }

  // ------------------------------------------------
  // Main UI
  // ------------------------------------------------

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}

        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          My Issues
        </Text>

        <Text style={styles.subtitle}>
          View and track the civic issues you
          have reported.
        </Text>

        {/* Error */}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Unable to Load Issues
            </Text>

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() =>
                loadIssues(true)
              }
            >
              <Text
                style={styles.retryButtonText}
              >
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Empty State */}

        {!errorMessage &&
        issues.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              📋
            </Text>

            <Text style={styles.emptyTitle}>
              No Issues Reported
            </Text>

            <Text style={styles.emptyText}>
              You have not reported any civic
              issues yet.
            </Text>

            <Pressable
              style={styles.reportButton}
              onPress={() =>
                router.push("/report")
              }
            >
              <Text
                style={styles.reportButtonText}
              >
                Report an Issue
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Issue List */}

        {issues.map((issue, index) => {
          const displayTitle =
            issue.title ||
            "Untitled Issue";

          const displayCategory =
            issue.categoryName ||
            "Category not available";

          const displayStatus =
            formatStatus(issue.status);

          const displayDate =
            formatDate(
              issue.reportedAt ||
                issue.createdAt
            );

          return (
            <Pressable
              key={
                issue.id ||
                `${displayTitle}-${index}`
              }
              style={styles.issueCard}
              onPress={() =>
                openIssue(issue)
              }
            >
              {/* Top row */}

              <View style={styles.cardTopRow}>
                <View
                  style={styles.issueNumberBox}
                >
                  <Text
                    style={
                      styles.issueNumberText
                    }
                  >
                    {issue.issueNumber ||
                      "Issue"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(
                      issue.status
                    ),
                  ]}
                >
                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {displayStatus}
                  </Text>
                </View>
              </View>

              {/* Title */}

              <Text
                style={styles.issueTitle}
                numberOfLines={2}
              >
                {displayTitle}
              </Text>

              {/* Category */}

              <Text
                style={styles.categoryText}
              >
                {displayCategory}
              </Text>

              {/* Description */}

              {issue.description ? (
                <Text
                  style={styles.description}
                  numberOfLines={3}
                >
                  {issue.description}
                </Text>
              ) : null}

              {/* Metadata */}

              <View
                style={styles.metadataRow}
              >
                <Text
                  style={styles.metadataText}
                >
                  Reported: {displayDate}
                </Text>

                {issue.departmentName ? (
                  <Text
                    style={
                      styles.metadataText
                    }
                  >
                    {issue.departmentName}
                  </Text>
                ) : null}
              </View>

              {/* Assignee */}

              {issue.assigneeName ||
              issue.assignedToName ? (
                <Text
                  style={styles.assigneeText}
                >
                  Assigned to:{" "}
                  {issue.assigneeName ||
                    issue.assignedToName}
                </Text>
              ) : null}

              {/* View */}

              <View
                style={styles.viewRow}
              >
                <Text
                  style={styles.viewText}
                >
                  View Issue →
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// Status Styling
// --------------------------------------------------

function getStatusStyle(
  status?: string
) {
  switch (status) {
    case "REPORTED":
      return styles.statusReported;

    case "IN_PROGRESS":
      return styles.statusInProgress;

    case "RESOLUTION_PENDING":
      return styles.statusPending;

    case "RESOLVED":
      return styles.statusResolved;

    case "CLOSED":
      return styles.statusClosed;

    case "REJECTED":
      return styles.statusRejected;

    default:
      return styles.statusUnknown;
  }
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748B",
  },

  backButton: {
    marginBottom: 18,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  issueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  issueNumberBox: {
    flex: 1,
  },

  issueNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  statusReported: {
    backgroundColor: "#DBEAFE",
  },

  statusReportedText: {
    color: "#1D4ED8",
  },

  statusInProgress: {
    backgroundColor: "#FEF3C7",
  },

  statusPending: {
    backgroundColor: "#FCE7F3",
  },

  statusResolved: {
    backgroundColor: "#DCFCE7",
  },

  statusClosed: {
    backgroundColor: "#E2E8F0",
  },

  statusRejected: {
    backgroundColor: "#FEE2E2",
  },

  statusUnknown: {
    backgroundColor: "#F1F5F9",
  },

  issueTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "750",
    color: "#0F172A",
    marginBottom: 5,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    marginBottom: 12,
  },

  metadataRow: {
    gap: 5,
    marginBottom: 8,
  },

  metadataText: {
    fontSize: 12,
    color: "#64748B",
  },

  assigneeText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
  },

  viewRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 5,
    paddingTop: 12,
  },

  viewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },

  reportButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 5,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
    marginBottom: 12,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#DC2626",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
