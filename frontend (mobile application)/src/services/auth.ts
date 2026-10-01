import * as SecureStore from "expo-secure-store";

// ==================================================
// SecureStore Keys
// ==================================================

const ACCESS_TOKEN_KEY =
  "smart_civic_access_token";

const REFRESH_TOKEN_KEY =
  "smart_civic_refresh_token";


// ==================================================
// Save Authentication Tokens
// ==================================================

export async function saveTokens(
  accessToken: string,
  refreshToken: string
) {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  await SecureStore.setItemAsync(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
}


// ==================================================
// Get Access Token
// ==================================================

export async function getAccessToken() {
  return await SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY
  );
}


// ==================================================
// Get Refresh Token
// ==================================================

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(
    REFRESH_TOKEN_KEY
  );
}


// ==================================================
// Remove Authentication Tokens
// ==================================================

export async function removeTokens() {

  await SecureStore.deleteItemAsync(
    ACCESS_TOKEN_KEY
  );

  await SecureStore.deleteItemAsync(
    REFRESH_TOKEN_KEY
  );
}


// ==================================================
// Check Whether User Is Logged In
// ==================================================

export async function isLoggedIn() {

  const accessToken =
    await getAccessToken();

  return !!accessToken;
}