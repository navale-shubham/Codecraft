import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as Location from "expo-location";

import { api } from "../services/api";


// --------------------------------------------------
// Types
// --------------------------------------------------

type Category = {
  id: string;
  name: string;
};

type PhotoItem = {
  uri: string;
  capturedAt: string;
};


// --------------------------------------------------
// Maximum number of photos
const MAX_PHOTOS = 5;

// Maximum acceptable GPS accuracy
const MAX_LOCATION_ACCURACY = 100;


// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function ReportIssue() {

  // ------------------------------------------------
  // Camera
  // ------------------------------------------------

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);

  const [cameraVisible, setCameraVisible] =
    useState(false);

  const [photos, setPhotos] =
    useState<PhotoItem[]>([]);


  // ------------------------------------------------
  // Location
  // ------------------------------------------------

  const [locationPermission, setLocationPermission] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [locationCapturedAt, setLocationCapturedAt] =
    useState<string | null>(null);


  // ------------------------------------------------
  // Form
  // ------------------------------------------------

  const [issueName, setIssueName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [showCategories, setShowCategories] =
    useState(false);

  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [categoryError, setCategoryError] =
    useState(false);


  // ------------------------------------------------
  // Submission
  // ------------------------------------------------

  const [submitting, setSubmitting] =
    useState(false);


  // ------------------------------------------------
  // Get Current Location
  // ------------------------------------------------

  const getCurrentLocation = async () => {
    try {

      setLocationLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        setLocationPermission(false);

        Alert.alert(
          "Location Permission Required",
          "SMART CIVIC needs your current location to report a civic issue. You cannot manually enter the location.",
          [
            {
              text: "Try Again",
              onPress: getCurrentLocation,
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );

        return;
      }

      setLocationPermission(true);

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const currentLatitude =
        currentLocation.coords.latitude;

      const currentLongitude =
        currentLocation.coords.longitude;

      const currentAccuracy =
        currentLocation.coords.accuracy;

      setLatitude(currentLatitude);

      setLongitude(currentLongitude);

      setAccuracy(
        currentAccuracy !== null
          ? currentAccuracy
          : null
      );

      setLocationCapturedAt(
        new Date().toISOString()
      );

    } catch (error) {

      console.error(
        "Location error:",
        error
      );

      Alert.alert(
        "Location Error",
        "Unable to obtain your current location. Please make sure GPS is enabled and try again."
      );

    } finally {

      setLocationLoading(false);
    }
  };


  // ------------------------------------------------
  // Load Categories From Backend
  // ------------------------------------------------

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(false);

      const response = await api.get(
        "/orgs/categories"
      );

      console.log(
        "CATEGORY API RESPONSE:",
        response.data
      );

      const rawCategories =
        response.data?.data;

      if (!Array.isArray(rawCategories)) {
        console.error(
          "Category API did not return an array:",
          rawCategories
        );

        setCategories([]);
        setCategoryError(true);
        return;
      }

      // The project specification documents data as
      // an array but does not define the exact object
      // fields. Support the common id/name forms and
      // reject incomplete category records.
      const normalizedCategories: Category[] =
        rawCategories
          .map((item: any) => ({
            id: String(
              item?.id ??
                item?.categoryId ??
                ""
            ),
            name: String(
              item?.name ??
                item?.categoryName ??
                ""
            ),
          }))
          .filter(
            (item: Category) =>
              item.id.length > 0 &&
              item.name.length > 0
          );

      setCategories(
        normalizedCategories
      );

      if (normalizedCategories.length === 0) {
        setCategoryError(true);
      }
    } catch (error: any) {
      console.error(
        "CATEGORY LOADING ERROR:",
        error
      );

      console.error(
        "CATEGORY SERVER RESPONSE:",
        error?.response?.data
      );

      console.error(
        "CATEGORY SERVER STATUS:",
        error?.response?.status
      );

      setCategories([]);
      setCategoryError(true);
    } finally {
      setCategoryLoading(false);
    }
  };


  // ------------------------------------------------
  // Get Location + Categories When Screen Opens
  // ------------------------------------------------

  useEffect(() => {
    getCurrentLocation();
    loadCategories();
  }, []);


  // ------------------------------------------------
  // Open Camera
  // ------------------------------------------------

  const openCamera = async () => {

    // Maximum 5 photos
    if (photos.length >= MAX_PHOTOS) {

      Alert.alert(
        "Maximum Photos Reached",
        "You can add up to 5 photos for one issue."
      );

      return;
    }

    if (!cameraPermission?.granted) {

      const permission =
        await requestCameraPermission();

      if (!permission.granted) {

        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to capture evidence for a civic issue."
        );

        return;
      }
    }

    setCameraVisible(true);
  };


  // ------------------------------------------------
  // Take Photo
  // ------------------------------------------------

  const takePhoto = async () => {

    try {

      if (!cameraRef.current) {
        return;
      }

      if (photos.length >= MAX_PHOTOS) {

        Alert.alert(
          "Maximum Photos Reached",
          "You can add up to 5 photos."
        );

        setCameraVisible(false);

        return;
      }

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

      if (photo?.uri) {

        const newPhoto: PhotoItem = {
          uri: photo.uri,
          capturedAt: new Date().toISOString(),
        };

        setPhotos((currentPhotos) => [
          ...currentPhotos,
          newPhoto,
        ]);

        // Close camera after each photo
        setCameraVisible(false);
      }

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to capture the photo."
      );
    }
  };


  // ------------------------------------------------
  // Remove Photo
  // ------------------------------------------------

  const removePhoto = (index: number) => {

    Alert.alert(
      "Remove Photo",
      "Do you want to remove this photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {

            setPhotos((currentPhotos) =>
              currentPhotos.filter(
                (_, photoIndex) =>
                  photoIndex !== index
              )
            );
          },
        },
      ]
    );
  };


  // ------------------------------------------------
  // Submit Issue
  // ------------------------------------------------

  const submitIssue = async () => {

    // ----------------------------------------------
    // Validate Issue Name
    // ----------------------------------------------

    if (!issueName.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter the issue name."
      );
      return;
    }

    // ----------------------------------------------
    // Validate Description
    // ----------------------------------------------

    if (!description.trim()) {
      Alert.alert(
        "Missing Information",
        "Please describe the issue."
      );
      return;
    }

    // ----------------------------------------------
    // Validate Category
    // ----------------------------------------------

    if (!category) {
      Alert.alert(
        "Missing Category",
        "Please select an issue category."
      );
      return;
    }

    // ----------------------------------------------
    // Validate Photos
    // ----------------------------------------------

    if (photos.length === 0) {
      Alert.alert(
        "Photo Required",
        "Please take at least one photo of the issue using the camera."
      );
      return;
    }

    // ----------------------------------------------
    // Validate Location
    // ----------------------------------------------

    if (
      latitude === null ||
      longitude === null ||
      accuracy === null ||
      locationCapturedAt === null
    ) {
      Alert.alert(
        "Location Required",
        "Your current location could not be obtained. Please try again."
      );
      return;
    }

    // ----------------------------------------------
    // Validate GPS Accuracy
    // ----------------------------------------------

    if (accuracy > MAX_LOCATION_ACCURACY) {
      Alert.alert(
        "Location Accuracy Too Low",
        `Your GPS accuracy is ±${accuracy.toFixed(
          1
        )}m. Please move to an open area and try again. Accuracy must be 100m or better.`
      );
      return;
    }

    try {
      setSubmitting(true);

      // --------------------------------------------
      // STEP 5: CREATE ISSUE
      // --------------------------------------------
      //
      // Photos are captured locally but are NOT sent
      // with this request. The final project
      // specification defines media upload separately:
      // POST /api/v1/citizens/issues/{issueId}/media
      //
      // Step 10 will handle that upload once the
      // backend provides the exact media request body.
      //
      // categoryId will be connected to the real
      // category API in Step 6. For now the selected
      // category is passed as a temporary value so we
      // do not invent category IDs.
      // --------------------------------------------

      const issuePayload = {
        title: issueName.trim(),
        description: description.trim(),
        categoryId: category.id,
        location: {
          latitude,
          longitude,
        },
        createdAt: new Date().toISOString(),
      };

      console.log(
        "ISSUE PAYLOAD:",
        issuePayload
      );

      // --------------------------------------------
      // SEND TO FASTAPI
      // --------------------------------------------

      const response = await api.post(
        "/citizens/issues",
        issuePayload
      );

      console.log(
        "ISSUE API RESPONSE:",
        response.data
      );

      const issueId =
        response.data?.data?.id;

      console.log(
        "CREATED ISSUE ID:",
        issueId
      );

      // --------------------------------------------
      // SUCCESS
      // --------------------------------------------

      Alert.alert(
        "Issue Submitted",
        "Your civic issue has been reported successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/home"),
          },
        ]
      );

    } catch (error: any) {
      console.error(
        "ISSUE SUBMISSION ERROR:",
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

      // ------------------------------------------
      // Error handling
      // ------------------------------------------

      if (error?.response?.status === 400) {
        Alert.alert(
          "Submission Failed",
          error?.response?.data?.message ||
            "The issue data sent to the server is invalid."
        );
      } else if (error?.response?.status === 401) {
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
      } else if (error?.response?.status === 403) {
        Alert.alert(
          "Access Denied",
          "You are not authorized to report an issue."
        );
      } else if (error?.response?.status === 422) {
        Alert.alert(
          "Invalid Information",
          error?.response?.data?.message ||
            "Please check the issue information and try again."
        );
      } else if (error?.response?.status >= 500) {
        Alert.alert(
          "Server Error",
          "The server encountered an error. Please try again later."
        );
      } else if (error?.request) {
        Alert.alert(
          "Connection Error",
          "Could not connect to the backend. Please check the backend connection."
        );
      } else {
        Alert.alert(
          "Submission Failed",
          "Unable to submit the issue. Please try again."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };


  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>

        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />

        <View style={styles.cameraOverlay}>

          {/* Camera Top */}

          <View style={styles.cameraTop}>

            <Pressable
              style={styles.closeCamera}
              onPress={() =>
                setCameraVisible(false)
              }
            >
              <Text style={styles.closeText}>
                ✕
              </Text>
            </Pressable>

            <Text style={styles.cameraTitle}>
              Capture Photo {photos.length + 1} / 5
            </Text>

          </View>


          {/* Camera Bottom */}

          <View style={styles.cameraBottom}>

            <Text style={styles.cameraHint}>
              Capture a clear photo of the civic issue
            </Text>

            <Pressable
              style={styles.captureButton}
              onPress={takePhoto}
            >
              <View style={styles.captureInner} />
            </Pressable>

          </View>

        </View>

      </View>
    );
  }


  // ------------------------------------------------
  // Main Report Screen
  // ------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* Back */}

      <Pressable
        onPress={() => router.back()}
        disabled={submitting}
      >
        <Text style={styles.back}>
          ← Back
        </Text>
      </Pressable>


      {/* Title */}

      <Text style={styles.title}>
        Report an Issue
      </Text>

      <Text style={styles.subtitle}>
        Report a civic problem in your area.
      </Text>


      {/* Issue Name */}

      <Text style={styles.label}>
        Issue Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: Large pothole near college"
        placeholderTextColor="#94A3B8"
        value={issueName}
        onChangeText={setIssueName}
        editable={!submitting}
      />


      {/* Description */}

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Describe the issue..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
        editable={!submitting}
      />


      {/* Category */}

      <Text style={styles.label}>
        Category
      </Text>

      {categoryLoading ? (
        <View style={styles.categoryLoadingBox}>
          <ActivityIndicator size="small" />
          <Text style={styles.categoryLoadingText}>
            Loading categories...
          </Text>
        </View>
      ) : categoryError ? (
        <View style={styles.categoryErrorBox}>
          <Text style={styles.categoryErrorText}>
            Unable to load categories.
          </Text>

          <Pressable
            style={styles.categoryRetryButton}
            onPress={loadCategories}
            disabled={submitting}
          >
            <Text style={styles.categoryRetryText}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.selectBox}
            onPress={() =>
              setShowCategories(
                !showCategories
              )
            }
            disabled={
              submitting ||
              categories.length === 0
            }
          >
            <Text
              style={
                category
                  ? styles.selectedText
                  : styles.selectText
              }
            >
              {category?.name ||
                "Select issue category"}
            </Text>

            <Text style={styles.arrow}>
              ▼
            </Text>
          </Pressable>

          {showCategories && (
            <View style={styles.categoryList}>
              {categories.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategories(false);
                  }}
                >
                  <Text
                    style={styles.categoryText}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}


      {/* Photo Evidence */}

      <View style={styles.photoHeader}>

        <Text style={styles.label}>
          Photo Evidence
        </Text>

        <Text style={styles.photoCounter}>
          {photos.length} / {MAX_PHOTOS}
        </Text>

      </View>


      {/* Photo List */}

      {photos.map(
        (photo, index) => (

          <View
            key={`${photo.uri}-${index}`}
            style={styles.photoContainer}
          >

            <Image
              source={{
                uri: photo.uri,
              }}
              style={styles.preview}
            />


            <View style={styles.photoInfo}>

              <Text
                style={styles.photoSuccess}
              >
                ✓ Photo {index + 1} captured
              </Text>

              <Text
                style={styles.timestamp}
              >
                {new Date(
                  photo.capturedAt
                ).toLocaleString()}
              </Text>

            </View>


            <Pressable
              style={styles.removeButton}
              onPress={() =>
                removePhoto(index)
              }
              disabled={submitting}
            >

              <Text
                style={styles.removeText}
              >
                ✕ Remove Photo
              </Text>

            </Pressable>

          </View>

        )
      )}


      {/* Add Photo Button */}

      {photos.length < MAX_PHOTOS ? (

        <Pressable
          style={styles.mediaBox}
          onPress={openCamera}
          disabled={submitting}
        >

          <Text style={styles.cameraIcon}>
            📷
          </Text>

          <Text style={styles.mediaTitle}>

            {photos.length === 0
              ? "Take Photo"
              : "Add Another Photo"}

          </Text>

          <Text
            style={styles.mediaSubtitle}
          >

            Camera capture only •{" "}
            {MAX_PHOTOS - photos.length}{" "}
            remaining

          </Text>

        </Pressable>

      ) : (

        <View
          style={styles.maxPhotosBox}
        >

          <Text
            style={styles.maxPhotosText}
          >
            ✓ Maximum 5 photos added
          </Text>

        </View>

      )}


      {/* Location */}

      <Text style={styles.label}>
        Current Location
      </Text>

      <Pressable
        style={styles.locationBox}
        onPress={getCurrentLocation}
        disabled={locationLoading || submitting}
      >

        <Text style={styles.locationIcon}>
          📍
        </Text>

        <View style={styles.locationInfo}>

          {locationLoading ? (

            <>
              <Text
                style={styles.locationTitle}
              >
                Detecting location...
              </Text>

              <ActivityIndicator
                size="small"
                style={styles.loader}
              />
            </>

          ) : locationPermission &&
            latitude !== null &&
            longitude !== null ? (

            <>

              <Text
                style={styles.locationTitle}
              >
                Current location detected
              </Text>

              {accuracy !== null && (

                <Text
                  style={
                    accuracy <= 100
                      ? styles.locationAccuracy
                      : styles.locationAccuracyBad
                  }
                >

                  Accuracy: ±
                  {accuracy.toFixed(1)} m

                </Text>

              )}

              <Text
                style={styles.locationTime}
              >

                Location captured at{" "}

                {locationCapturedAt
                  ? new Date(
                      locationCapturedAt
                    ).toLocaleTimeString()
                  : ""}

              </Text>

              <Text style={styles.refreshLocationText}>
                Tap to refresh location
              </Text>

            </>

          ) : (

            <>

              <Text
                style={styles.locationError}
              >
                Location unavailable
              </Text>

              <Pressable
                onPress={
                  getCurrentLocation
                }
              >

                <Text
                  style={
                    styles.retryText
                  }
                >
                  Tap to retry
                </Text>

              </Pressable>

            </>

          )}

        </View>

      </Pressable>


      {/* Location Notice */}

      <Text style={styles.locationNotice}>
        🔒 Location is automatically captured
        from your device. It cannot be manually
        changed.
      </Text>


      {/* Submit */}

      <Pressable
        style={[
          styles.submitButton,

          (
            photos.length === 0 ||
            latitude === null ||
            longitude === null ||
            accuracy === null ||
            locationLoading ||
            submitting
          ) &&
            styles.submitDisabled,
        ]}
        disabled={
          photos.length === 0 ||
          latitude === null ||
          longitude === null ||
          accuracy === null ||
          locationLoading ||
          submitting
        }
        onPress={submitIssue}
      >

        {submitting ? (

          <View
            style={styles.submitLoading}
          >

            <ActivityIndicator
              color="#FFFFFF"
            />

            <Text
              style={styles.submitText}
            >
              SUBMITTING...
            </Text>

          </View>

        ) : (

          <Text
            style={styles.submitText}
          >
            SUBMIT ISSUE
          </Text>

        )}

      </Pressable>

    </ScrollView>
  );
}


// ==================================================
// Styles
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 50,
  },

  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 22,
  },

  textArea: {
    height: 120,
  },

  selectBox: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  selectText: {
    color: "#94A3B8",
    fontSize: 15,
  },

  selectedText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },

  arrow: {
    color: "#64748B",
  },

  categoryLoadingBox: {
    minHeight: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  categoryLoadingText: {
    marginLeft: 10,
    color: "#64748B",
    fontSize: 14,
  },

  categoryErrorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },

  categoryErrorText: {
    color: "#B91C1C",
    fontSize: 14,
    marginBottom: 10,
  },

  categoryRetryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  categoryRetryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  categoryList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 22,
    overflow: "hidden",
  },

  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  categoryText: {
    fontSize: 15,
    color: "#334155",
  },


  // ------------------------------------------------
  // Photos
  // ------------------------------------------------

  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  photoCounter: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 8,
  },

  mediaBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: "center",
    marginBottom: 22,
  },

  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  mediaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  mediaSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 5,
  },

  photoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 15,
  },

  preview: {
    width: "100%",
    height: 230,
  },

  photoInfo: {
    padding: 12,
  },

  photoSuccess: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16A34A",
  },

  timestamp: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },

  removeButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },

  removeText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  maxPhotosBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 22,
  },

  maxPhotosText: {
    color: "#16A34A",
    fontWeight: "700",
  },


  // ------------------------------------------------
  // Location
  // ------------------------------------------------

  locationBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  locationIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  locationInfo: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  locationAccuracy: {
    fontSize: 13,
    color: "#16A34A",
    marginTop: 5,
    fontWeight: "600",
  },

  locationAccuracyBad: {
    fontSize: 13,
    color: "#DC2626",
    marginTop: 5,
    fontWeight: "600",
  },

  locationTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },

  refreshLocationText: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 7,
    fontWeight: "600",
  },

  locationError: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },

  retryText: {
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 5,
  },

  loader: {
    marginTop: 8,
    alignSelf: "flex-start",
  },

  locationNotice: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 25,
  },


  // ------------------------------------------------
  // Submit
  // ------------------------------------------------

  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: "center",
  },

  submitDisabled: {
    backgroundColor: "#94A3B8",
  },

  submitLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },


  // ------------------------------------------------
  // Camera
  // ------------------------------------------------

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },

  cameraTop: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  closeCamera: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 15,
  },

  cameraBottom: {
    alignItems: "center",
    paddingBottom: 45,
  },

  cameraHint: {
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
  },

  captureButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#CBD5E1",
  },

  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#0F172A",
  },

});