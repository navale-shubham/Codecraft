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

type StaffIssue = {
  id?: string;
  issueNumber?: string;
  title?: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  wardName?: string;
  status?: string;
  priority?: string;

  assignedToName?: string;
  assigneeName?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };

  reportedAt?: string;
  dueAt?: string;
  resolvedAt?: string;
  createdAt?: string;

  [key: string]: any;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatStatus(status?: string) {
  if (!status) {
    return "UNKNOWN";
  }

  return status.replace(/_/g, " ");
}

function formatPriority(priority?: string) {
  if (!priority) {
    return "NORMAL";
  }

  return priority.replace(/_/g, " ");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
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

function getCoordinates(issue: StaffIssue) {
  const latitude = issue.location?.latitude;
  const longitude = issue.location?.longitude;

  if (
    latitude === undefined ||
    longitude === undefined
  ) {
    return "Location not available";
  }

  return `${latitude}, ${longitude}`;
}

function isAssignedStatus(status?: string) {
  const normalized =
    status?.toUpperCase();

  return (
    normalized === "ASSIGNED" ||
    normalized === "ASSIGN" ||
    normalized === "REPORTED"
  );
}

function isInProgressStatus(status?: string) {
  const normalized =
    status?.toUpperCase();

  return (
    normalized === "IN_PROGRESS" ||
    normalized === "IN PROGRESS"
  );
}

function isCompletedStatus(status?: string) {
  const normalized =
    status?.toUpperCase();

  return (
    normalized === "RESOLVED" ||
    normalized === "COMPLETED" ||
    normalized === "CLOSED"
  );
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function EngineerHome() {
  const [issues, setIssues] = useState<
    StaffIssue[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  // ------------------------------------------------
  // Load Staff Issues
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
        "Loading field staff issues..."
      );

      const response = await api.get(
        "/staff/issues"
      );

      console.log(
        "STAFF ISSUES API RESPONSE:",
        response.data
      );

      const responseData =
        response.data?.data;

      if (Array.isArray(responseData)) {
        setIssues(responseData);
      } else {
        console.error(
          "Unexpected staff issues response:",
          response.data
        );

        setIssues([]);

        setErrorMessage(
          "The server returned an unexpected issues format."
        );
      }
    } catch (error: any) {
      console.error(
        "STAFF ISSUES ERROR:",
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
          "You are not authorized to view field staff issues."
        );
        return;
      }

      if (
        error?.response?.status === 404
      ) {
        setErrorMessage(
          "The field staff issues API was not found on the server."
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
        "Unable to load assigned work."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ------------------------------------------------
  // Refresh whenever screen opens
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
  // Temporary local action
  // ------------------------------------------------
  //
  // The final specification documents:
  //
  // POST /api/v1/staff/issues/{issueId}/resolve
  //
  // but does NOT document the request body.
  //
  // Therefore we do not send an invented request.
  // Step 9 connects the real GET API first.
  //
  // ------------------------------------------------

  const handleResolveLater = () => {
    Alert.alert(
      "Resolve API",
      "The resolve endpoint is available in the project specification, but its request body is not documented yet. We will connect it after confirming the backend request format."
    );
  };

  // ------------------------------------------------
  // Stats
  // ------------------------------------------------

  const assignedCount = issues.filter(
    (issue) =>
      isAssignedStatus(issue.status)
  ).length;

  const inProgressCount = issues.filter(
    (issue) =>
      isInProgressStatus(issue.status)
  ).length;

  const completedCount = issues.filter(
    (issue) =>
      isCompletedStatus(issue.status)
  ).length;

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading assigned work...
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
        showsVerticalScrollIndicator={false}
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

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, Field Engineer 👷
            </Text>

            <Text style={styles.engineerName}>
              Assigned Work
            </Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              router.replace("/login");
            }}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Department */}

        <View style={styles.departmentCard}>
          <Text style={styles.departmentLabel}>
            Field Staff
          </Text>

          <Text style={styles.departmentName}>
            Assigned civic issues
          </Text>
        </View>

        {/* Error */}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Unable to Load Work
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

        {/* Dashboard Stats */}

        <Text style={styles.sectionTitle}>
          Work Summary
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {assignedCount}
            </Text>

            <Text style={styles.statLabel}>
              Assigned
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {inProgressCount}
            </Text>

            <Text style={styles.statLabel}>
              In Progress
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>
        </View>

        {/* Assigned Work */}

        <View style={styles.workHeader}>
          <Text style={styles.sectionTitle}>
            Assigned Work
          </Text>

          <Text style={styles.workCount}>
            {issues.length} total
          </Text>
        </View>

        {/* Empty State */}

        {!errorMessage &&
        issues.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              📋
            </Text>

            <Text style={styles.emptyTitle}>
              No Assigned Issues
            </Text>

            <Text style={styles.emptyText}>
              There are currently no issues
              assigned to this field staff
              account.
            </Text>
          </View>
        ) : null}

        {/* Issue Cards */}

        {issues.map(
          (issue, index) => {
            const title =
              issue.title ||
              "Untitled Issue";

            const issueId =
              issue.issueNumber ||
              issue.id ||
              `Issue ${index + 1}`;

            const category =
              issue.categoryName ||
              "Category not available";

            const description =
              issue.description ||
              "No description available.";

            const status =
              formatStatus(
                issue.status
              );

            const priority =
              formatPriority(
                issue.priority
              );

            return (
              <View
                key={
                  issue.id ||
                  `${issueId}-${index}`
                }
                style={styles.workCard}
              >
                {/* Work Header */}

                <View style={styles.workTop}>
                  <View
                    style={
                      styles.workTitleContainer
                    }
                  >
                    <Text
                      style={
                        styles.workTitle
                      }
                      numberOfLines={2}
                    >
                      {title}
                    </Text>

                    <Text
                      style={
                        styles.issueId
                      }
                    >
                      {issueId}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityBadge,
                      getPriorityStyle(
                        issue.priority
                      ),
                    ]}
                  >
                    <Text
                      style={
                        styles.priorityText
                      }
                    >
                      {priority}
                    </Text>
                  </View>
                </View>

                {/* Category */}

                <View
                  style={styles.infoRow}
                >
                  <Text
                    style={styles.infoLabel}
                  >
                    Category
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {category}
                  </Text>
                </View>

                {/* Description */}

                <Text
                  style={styles.description}
                  numberOfLines={4}
                >
                  {description}
                </Text>

                {/* Location */}

                <View
                  style={styles.locationBox}
                >
                  <Text
                    style={
                      styles.locationIcon
                    }
                  >
                    📍
                  </Text>

                  <View>
                    <Text
                      style={
                        styles.locationLabel
                      }
                    >
                      Reported Location
                    </Text>

                    <Text
                      style={
                        styles.locationValue
                      }
                    >
                      {getCoordinates(
                        issue
                      )}
                    </Text>
                  </View>
                </View>

                {/* Reported Date */}

                <View
                  style={styles.infoRow}
                >
                  <Text
                    style={styles.infoLabel}
                  >
                    Reported
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {formatDate(
                      issue.reportedAt ||
                        issue.createdAt
                    )}
                  </Text>
                </View>

                {/* Status */}

                <View
                  style={styles.statusRow}
                >
                  <Text
                    style={styles.statusLabel}
                  >
                    Status
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(
                        issue.status
                      ),
                    ]}
                  >
                    <Text
                      style={styles.statusText}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {/* Resolve */}

                {!isCompletedStatus(
                  issue.status
                ) ? (
                  <Pressable
                    style={
                      styles.completeButton
                    }
                    onPress={
                      handleResolveLater
                    }
                  >
                    <Text
                      style={
                        styles.completeButtonText
                      }
                    >
                      MARK AS RESOLVED
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={
                      styles.completedMessage
                    }
                  >
                    <Text
                      style={
                        styles.completedMessageText
                      }
                    >
                      ✓ Issue Resolved
                    </Text>
                  </View>
                )}
              </View>
            );
          }
        )}

        {/* API Notice */}

        <View style={styles.apiNotice}>
          <Text style={styles.apiNoticeTitle}>
            Backend Connected Screen
          </Text>

          <Text style={styles.apiNoticeText}>
            Assigned issues are loaded from the
            field staff API. Pull down to refresh
            the latest assignments.
          </Text>
        </View>
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
  const normalized =
    status?.toUpperCase();

  if (
    normalized === "RESOLVED" ||
    normalized === "COMPLETED" ||
    normalized === "CLOSED"
  ) {
    return styles.statusCompleted;
  }

  if (
    normalized === "IN_PROGRESS" ||
    normalized === "IN PROGRESS"
  ) {
    return styles.statusProgress;
  }

  return styles.statusAssigned;
}

// --------------------------------------------------
// Priority Styling
// --------------------------------------------------

function getPriorityStyle(
  priority?: string
) {
  const normalized =
    priority?.toUpperCase();

  if (normalized === "HIGH") {
    return styles.priorityHigh;
  }

  if (normalized === "MEDIUM") {
    return styles.priorityMedium;
  }

  return styles.priorityLow;
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
    paddingTop: 55,
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 5,
  },

  engineerName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
  },

  logoutText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  departmentCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 16,
    marginBottom: 25,
  },

  departmentLabel: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 4,
  },

  departmentName: {
    color: "#1D4ED8",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563EB",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  workHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workCount: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },

  workCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    padding: 17,
    marginBottom: 15,
  },

  workTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  workTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  workTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 24,
  },

  issueId: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  priorityBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  priorityHigh: {
    backgroundColor: "#FEE2E2",
  },

  priorityMedium: {
    backgroundColor: "#FEF3C7",
  },

  priorityLow: {
    backgroundColor: "#DCFCE7",
  },

  priorityText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    marginVertical: 13,
  },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
    padding: 12,
    marginBottom: 8,
  },

  locationIcon: {
    fontSize: 22,
    marginRight: 10,
  },

  locationLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 3,
  },

  locationValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 14,
  },

  statusLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  statusAssigned: {
    backgroundColor: "#DBEAFE",
  },

  statusProgress: {
    backgroundColor: "#FEF3C7",
  },

  statusCompleted: {
    backgroundColor: "#DCFCE7",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  completeButton: {
    backgroundColor: "#16A34A",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },

  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  completedMessage: {
    backgroundColor: "#F0FDF4",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },

  completedMessageText: {
    color: "#15803D",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#64748B",
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
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

  apiNotice: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },

  apiNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
  },

  apiNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
});
