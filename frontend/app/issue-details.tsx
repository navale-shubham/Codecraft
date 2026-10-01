import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { api } from "../services/api";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Issue = {
  id?: string;
  issueNumber?: string;
  citizenName?: string;
  departmentName?: string;
  categoryName?: string;
  wardName?: string;

  title?: string;
  description?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };

  status?: string;

  assignedToName?: string;
  assigneeName?: string;

  reportedAt?: string;
  dueAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt?: string;
};

type MediaItem = {
  id?: string;
  url?: string;
  mediaUrl?: string;
  path?: string;
  mediaPath?: string;
  fileUrl?: string;
  [key: string]: any;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string) {
  if (!status) {
    return "UNKNOWN";
  }

  return status.replace(/_/g, " ");
}

function getMediaUrl(media: MediaItem) {
  return (
    media.url ||
    media.mediaUrl ||
    media.fileUrl ||
    media.path ||
    media.mediaPath ||
    null
  );
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function IssueDetailsScreen() {
  const params = useLocalSearchParams<{
    issueId?: string | string[];
  }>();

  const issueId = Array.isArray(params.issueId)
    ? params.issueId[0]
    : params.issueId;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [issueError, setIssueError] = useState("");
  const [mediaError, setMediaError] = useState("");

  // ------------------------------------------------
  // Load Issue Details
  // ------------------------------------------------

  const loadIssue = async () => {
    if (!issueId) {
      setIssueError(
        "No issue ID was provided."
      );
      return;
    }

    try {
      setIssueError("");

      console.log(
        "Loading issue details:",
        issueId
      );

      const response = await api.get(
        `/citizens/issues/${encodeURIComponent(
          issueId
        )}`
      );

      console.log(
        "ISSUE DETAILS API RESPONSE:",
        response.data
      );

      const issueData =
        response.data?.data;

      if (!issueData) {
        setIssue(null);
        setIssueError(
          "The server did not return issue details."
        );
        return;
      }

      setIssue(issueData);
    } catch (error: any) {
      console.error(
        "ISSUE DETAILS ERROR:",
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
        setIssueError(
          "You are not authorized to view this issue."
        );
        return;
      }

      if (
        error?.response?.status === 404
      ) {
        setIssueError(
          "This issue could not be found."
        );
        return;
      }

      if (
        error?.response?.status >= 500
      ) {
        setIssueError(
          "The server encountered an error. Please try again later."
        );
        return;
      }

      if (error?.request) {
        setIssueError(
          "Could not connect to the backend. Check your backend connection and try again."
        );
        return;
      }

      setIssueError(
        "Unable to load issue details."
      );
    }
  };

  // ------------------------------------------------
  // Load Issue Media
  // ------------------------------------------------

  const loadMedia = async () => {
    if (!issueId) {
      return;
    }

    try {
      setMediaError("");

      console.log(
        "Loading issue media:",
        issueId
      );

      const response = await api.get(
        `/citizens/issues/${encodeURIComponent(
          issueId
        )}/media`
      );

      console.log(
        "ISSUE MEDIA API RESPONSE:",
        response.data
      );

      const mediaData =
        response.data?.data;

      if (Array.isArray(mediaData)) {
        setMedia(mediaData);
      } else {
        console.error(
          "Unexpected media response:",
          response.data
        );

        setMedia([]);

        setMediaError(
          "The server returned an unexpected media format."
        );
      }
    } catch (error: any) {
      console.error(
        "ISSUE MEDIA ERROR:",
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
        setMediaError(
          "You are not authorized to view issue media."
        );
        return;
      }

      if (
        error?.response?.status === 404
      ) {
        setMediaError(
          "The issue media endpoint was not found."
        );
        return;
      }

      if (error?.response?.status >= 500) {
        setMediaError(
          "The server encountered an error while loading media."
        );
        return;
      }

      if (error?.request) {
        setMediaError(
          "Could not connect to the backend to load media."
        );
        return;
      }

      setMediaError(
        "Unable to load issue media."
      );
    }
  };

  // ------------------------------------------------
  // Load Both
  // ------------------------------------------------

  const loadData = async (
    showFullLoader = true
  ) => {
    if (showFullLoader) {
      setLoading(true);
    }

    await Promise.all([
      loadIssue(),
      loadMedia(),
    ]);

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [issueId])
  );

  // ------------------------------------------------
  // Pull to Refresh
  // ------------------------------------------------

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // ------------------------------------------------
  // Invalid Issue ID
  // ------------------------------------------------

  if (!issueId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Issue ID Missing
        </Text>

        <Text style={styles.errorText}>
          This issue cannot be opened because
          no issue ID was provided.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text
            style={styles.primaryButtonText}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading issue details...
        </Text>
      </View>
    );
  }

  // ------------------------------------------------
  // Error
  // ------------------------------------------------

  if (!issue && issueError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Unable to Load Issue
        </Text>

        <Text style={styles.errorText}>
          {issueError}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => loadData(true)}
        >
          <Text
            style={styles.primaryButtonText}
          >
            Retry
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Go Back
          </Text>
        </Pressable>
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
        {/* Back */}

        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        {/* Header */}

        <Text style={styles.title}>
          Issue Details
        </Text>

        <Text style={styles.subtitle}>
          Track the current status and details
          of your reported civic issue.
        </Text>

        {/* Issue Number + Status */}

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.issueNumberContainer}>
              <Text
                style={
                  styles.issueNumberLabel
                }
              >
                Issue Number
              </Text>

              <Text
                style={
                  styles.issueNumber
                }
              >
                {issue?.issueNumber ||
                  issue?.id ||
                  "Not available"}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {formatStatus(
                  issue?.status
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Details */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Issue Information
          </Text>

          <DetailRow
            label="Title"
            value={
              issue?.title ||
              "Not available"
            }
          />

          <DetailRow
            label="Category"
            value={
              issue?.categoryName ||
              "Not available"
            }
          />

          <DetailRow
            label="Department"
            value={
              issue?.departmentName ||
              "Not available"
            }
          />

          <DetailRow
            label="Ward"
            value={
              issue?.wardName ||
              "Not available"
            }
          />

          <DetailRow
            label="Reported At"
            value={formatDate(
              issue?.reportedAt ||
                issue?.createdAt
            )}
          />

          <DetailRow
            label="Due At"
            value={formatDate(
              issue?.dueAt
            )}
          />

          <DetailRow
            label="Resolved At"
            value={formatDate(
              issue?.resolvedAt
            )}
          />

          <DetailRow
            label="Closed At"
            value={formatDate(
              issue?.closedAt
            )}
          />
        </View>

        {/* Description */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            {issue?.description ||
              "No description available."}
          </Text>
        </View>

        {/* Assignment */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Assignment
          </Text>

          <DetailRow
            label="Assigned To"
            value={
              issue?.assignedToName ||
              issue?.assigneeName ||
              "Not assigned"
            }
          />
        </View>

        {/* Location */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Location
          </Text>

          {issue?.location?.latitude !==
            undefined &&
          issue?.location?.longitude !==
            undefined ? (
            <>
              <DetailRow
                label="Latitude"
                value={String(
                  issue.location.latitude
                )}
              />

              <DetailRow
                label="Longitude"
                value={String(
                  issue.location.longitude
                )}
              />
            </>
          ) : (
            <Text style={styles.mutedText}>
              Location information is not
              available.
            </Text>
          )}
        </View>

        {/* Media */}

        <View style={styles.card}>
          <View style={styles.mediaHeader}>
            <Text style={styles.sectionTitle}>
              Photo Evidence
            </Text>

            <Text style={styles.mediaCount}>
              {media.length} item
              {media.length === 1
                ? ""
                : "s"}
            </Text>
          </View>

          {mediaError ? (
            <Text style={styles.mediaError}>
              {mediaError}
            </Text>
          ) : null}

          {!mediaError &&
          media.length === 0 ? (
            <Text style={styles.mutedText}>
              No media is available for this
              issue.
            </Text>
          ) : null}

          {media.map(
            (item, index) => {
              const mediaUrl =
                getMediaUrl(item);

              return (
                <View
                  key={
                    item.id ||
                    `${mediaUrl}-${index}`
                  }
                  style={
                    styles.mediaItem
                  }
                >
                  {mediaUrl ? (
                    <Image
                      source={{
                        uri: mediaUrl,
                      }}
                      style={
                        styles.mediaImage
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={
                        styles.mediaPlaceholder
                      }
                    >
                      <Text
                        style={
                          styles.mediaPlaceholderText
                        }
                      >
                        Media item{" "}
                        {index + 1}
                      </Text>

                      <Text
                        style={
                          styles.mediaPlaceholderSubtext
                        }
                      >
                        The backend returned
                        this media item, but
                        its image URL/path field
                        is not documented yet.
                      </Text>
                    </View>
                  )}
                </View>
              );
            }
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// Detail Row
// --------------------------------------------------

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
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
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  issueNumberContainer: {
    flex: 1,
    paddingRight: 12,
  },

  issueNumberLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  issueNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  statusBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 13,
  },

  detailRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#334155",
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },

  mutedText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  mediaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mediaCount: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  mediaError: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },

  mediaItem: {
    marginTop: 10,
  },

  mediaImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },

  mediaPlaceholder: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  mediaPlaceholderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 5,
  },

  mediaPlaceholderSubtext: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 8,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  secondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
});
