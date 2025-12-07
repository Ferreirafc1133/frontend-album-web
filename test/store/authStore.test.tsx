import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../../frontend-album/app/store/useUserStore";

describe("useUserStore", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      loadingProfile: false,
    });
  });

  it("inicializa con valores nulos", () => {
    const state = useUserStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it("actualiza el estado con setAuth", () => {
    const { setAuth } = useUserStore.getState();

    setAuth({
      token: "test-token",
      refreshToken: "test-refresh",
      user: { username: "testuser", email: "test@test.com" },
    });

    const state = useUserStore.getState();

    expect(state.token).toBe("test-token");
    expect(state.refreshToken).toBe("test-refresh");
    expect(state.user?.username).toBe("testuser");
  });

  it("limpia el estado con logout", () => {
    const { setAuth, logout } = useUserStore.getState();

    setAuth({
      token: "test-token",
      refreshToken: "test-refresh",
      user: { username: "testuser", email: "test@test.com" },
    });

    logout();

    const state = useUserStore.getState();

    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("mantiene el token pero limpia el usuario si se pasa user null", () => {
    const { setAuth } = useUserStore.getState();

    setAuth({
      token: "test-token",
      refreshToken: "test-refresh",
      user: { username: "testuser", email: "test@test.com" },
    });

    setAuth({
      token: "test-token",
      refreshToken: "test-refresh",
      user: null,
    });

    const state = useUserStore.getState();

    expect(state.token).toBe("test-token");
    expect(state.user).toBeNull();
  });
});