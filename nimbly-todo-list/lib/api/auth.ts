import axios from "axios";
import { API_BASE_URL, apiClient } from "@/lib/api/client";
import type { AuthTokens, LoginRequest, User } from "@/lib/types/auth";

type LoginResponse = User & AuthTokens;

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
  return response.data;
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<AuthTokens> => {
  const response = await axios.post<AuthTokens>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};
