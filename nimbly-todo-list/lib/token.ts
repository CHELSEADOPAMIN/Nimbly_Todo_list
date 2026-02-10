const STORAGE_VERSION = "v1";
const ACCESS_TOKEN_KEY = `nimbly:access-token:${STORAGE_VERSION}`;
const REFRESH_TOKEN_KEY = `nimbly:refresh-token:${STORAGE_VERSION}`;

export const AUTH_COOKIE_NAME = "nimbly-auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const canUseStorage = () => typeof window !== "undefined";

const getStorageItem = (key: string) => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage can throw in private mode or when disabled.
  }
};

const removeStorageItem = (key: string) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // localStorage can throw in private mode or when disabled.
  }
};

const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") {
    return;
  }

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

export const getAccessToken = () => getStorageItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string) => setStorageItem(ACCESS_TOKEN_KEY, token);
export const removeAccessToken = () => removeStorageItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => getStorageItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string) => setStorageItem(REFRESH_TOKEN_KEY, token);
export const removeRefreshToken = () => removeStorageItem(REFRESH_TOKEN_KEY);

export const setAuthCookie = () => setCookie(AUTH_COOKIE_NAME, "1", AUTH_COOKIE_MAX_AGE);

export const removeAuthCookie = () => {
  setCookie(AUTH_COOKIE_NAME, "", 0);
};

export const clearAllTokens = () => {
  removeAccessToken();
  removeRefreshToken();
  removeAuthCookie();
};
