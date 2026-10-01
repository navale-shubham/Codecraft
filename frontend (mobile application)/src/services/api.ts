import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ==================================================
// API CONFIGURATION
// ==================================================

// IMPORTANT:
// If you are testing on a physical phone with your
// friend's FastAPI server running on his computer,
// replace YOUR-FRIEND-PC-IP with his local IP.
//
// Example:
// http://192.168.1.5:8000/api/v1
//
// DO NOT use localhost when testing on a physical phone.


const API_BASE_URL ="http://YOUR-FRIEND-PC-IP:8000/api/v1";


// ==================================================
// TOKEN KEY
// ==================================================

const ACCESS_TOKEN_KEY ="smart_civic_access_token";


// ==================================================
// AXIOS INSTANCE
// ==================================================

export const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});


// ==================================================
// REQUEST INTERCEPTOR
// ==================================================
//
// Automatically adds:
//
// Authorization: Bearer <accessToken>
//
// to every authenticated API request.
//

api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken =
        await SecureStore.getItemAsync(
          ACCESS_TOKEN_KEY
        );

      if (accessToken) {
        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }

    } catch (error) {
      console.error(
        "Unable to read access token:",
        error
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ==================================================
// RESPONSE INTERCEPTOR
// ==================================================
//
// For now we only log authentication errors.
//
// Refresh-token handling will be added in Step 2
// / Step 3 after auth.ts and login.tsx are updated.
//

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {

    if (error.response?.status === 401) {

      console.log(
        "Authentication failed: access token may be expired."
      );

    }

    return Promise.reject(error);
  }
);