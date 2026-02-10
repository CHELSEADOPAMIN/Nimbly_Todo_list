import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setAuthCookie,
  setRefreshToken,
} from "@/lib/token";
import type { AuthTokens } from "@/lib/types/auth";

export const API_BASE_URL = "https://dummyjson.com";

const LOGIN_PATH = "/auth/login";
const REFRESH_PATH = "/auth/refresh";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
      return;
    }

    if (!token) {
      item.reject(new Error("Missing token after refresh."));
      return;
    }

    item.resolve(token);
  });

  failedQueue = [];
};

const setAuthorizationHeader = (
  config: InternalAxiosRequestConfig | RetryableRequestConfig,
  token: string,
) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.href = "/login";
};

const handleAuthFailure = () => {
  clearAllTokens();
  redirectToLogin();
};

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const statusCode = error.response?.status;

    if (!originalRequest || statusCode !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes(LOGIN_PATH) || requestUrl.includes(REFRESH_PATH);

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            setAuthorizationHeader(originalRequest, token);
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshClient.post<AuthTokens>(REFRESH_PATH, {
        refreshToken,
      });

      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setAuthCookie();
      processQueue(null, response.data.accessToken);

      setAuthorizationHeader(originalRequest, response.data.accessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
