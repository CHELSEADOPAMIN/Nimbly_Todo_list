import {
  AUTH_COOKIE_NAME,
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeAuthCookie,
  removeRefreshToken,
  setAccessToken,
  setAuthCookie,
  setRefreshToken,
} from "@/lib/token";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Token Management", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Access Token", () => {
    it("should store and retrieve access token from localStorage", () => {
      setAccessToken("access-token");
      expect(getAccessToken()).toBe("access-token");
    });

    it("should return null when access token does not exist", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("should remove access token", () => {
      setAccessToken("access-token");
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("Refresh Token", () => {
    it("should store and retrieve refresh token from localStorage", () => {
      setRefreshToken("refresh-token");
      expect(getRefreshToken()).toBe("refresh-token");
    });

    it("should return null when refresh token does not exist", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("should remove refresh token", () => {
      setRefreshToken("refresh-token");
      removeRefreshToken();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("Auth Cookie", () => {
    it("should set auth cookie to '1'", () => {
      setAuthCookie();
      expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
    });

    it("should remove auth cookie by setting Max-Age=0", () => {
      const cookieSetter = vi.spyOn(document, "cookie", "set");
      removeAuthCookie();
      expect(cookieSetter).toHaveBeenCalledWith(expect.stringContaining("Max-Age=0"));
    });
  });

  describe("clearAllTokens", () => {
    it("should clear access token, refresh token, and auth cookie together", () => {
      setAccessToken("access-token");
      setRefreshToken("refresh-token");
      setAuthCookie();

      clearAllTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(document.cookie).not.toContain(`${AUTH_COOKIE_NAME}=1`);
    });
  });

  describe("Edge cases", () => {
    it("should not throw when localStorage is unavailable", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("storage blocked");
      });
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("storage blocked");
      });
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("storage blocked");
      });

      expect(() => setAccessToken("token")).not.toThrow();
      expect(() => removeAccessToken()).not.toThrow();
      expect(getAccessToken()).toBeNull();
    });

    it("should store tokens with versioned key prefixes", () => {
      setAccessToken("access-token");
      setRefreshToken("refresh-token");

      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      );

      expect(keys).toContain("nimbly:access-token:v1");
      expect(keys).toContain("nimbly:refresh-token:v1");
    });
  });
});
