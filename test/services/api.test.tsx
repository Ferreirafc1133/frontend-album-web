import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { AuthAPI } from "../../frontend-album/app/services/api";

vi.mock("axios");
const mockedAxios = axios as any;

describe("AuthAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("hace POST a /auth/login/ con credenciales", async () => {
      const mockResponse = {
        data: {
          access: "token123",
          refresh: "refresh123",
          user: { username: "testuser" },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await AuthAPI.login("testuser", "password123");

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login/", {
        username: "testuser",
        password: "password123",
      });

      expect(result.access).toBe("token123");
      expect(result.user.username).toBe("testuser");
    });

    it("lanza error si las credenciales son invalidas", async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { detail: "Credenciales invalidas" } },
      });

      await expect(AuthAPI.login("wronguser", "wrongpass")).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("hace POST a /auth/register/ con datos de usuario", async () => {
      const mockResponse = {
        data: {
          id: 1,
          username: "newuser",
          email: "new@test.com",
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const userData = {
        username: "newuser",
        email: "new@test.com",
        password: "password123",
        password_confirm: "password123",
        first_name: "New",
        last_name: "User",
      };

      const result = await AuthAPI.register(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/register/", userData);
      expect(result.username).toBe("newuser");
    });
  });

  describe("me", () => {
    it("hace GET a /auth/profile/ para obtener perfil", async () => {
      const mockResponse = {
        data: {
          username: "testuser",
          email: "test@test.com",
          first_name: "Test",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await AuthAPI.me();

      expect(mockedAxios.get).toHaveBeenCalledWith("/auth/profile/");
      expect(result.username).toBe("testuser");
    });
  });
});