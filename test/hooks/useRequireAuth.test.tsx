import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRequireAuth } from "../../app/hooks/useRequireAuth";

// Helper para mock del store
let mockState: any;

vi.mock("../../app/store/useUserStore", () => ({
  useUserStore: (selector: any) => selector(mockState),
}));

describe("useRequireAuth hook", () => {
  const mockFetchProfile = vi.fn();

  beforeEach(() => {
    mockFetchProfile.mockReset();
  });

  it("retorna 'unauthenticated' si no hay token", () => {
    mockState = {
      token: null,
      user: null,
      fetchProfile: mockFetchProfile,
      loadingProfile: false,
    };

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current).toBe("unauthenticated");
    expect(mockFetchProfile).not.toHaveBeenCalled();
  });

  it("retorna 'authenticated' si hay token", () => {
    mockState = {
      token: "FAKE_TOKEN",
      user: { username: "Jorge" },
      fetchProfile: mockFetchProfile,
      loadingProfile: false,
    };

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current).toBe("authenticated");
    expect(mockFetchProfile).not.toHaveBeenCalled();
  });

  it("llama a fetchProfile si hay token pero no hay usuario", () => {
    mockState = {
      token: "FAKE_TOKEN",
      user: null,
      fetchProfile: mockFetchProfile,
      loadingProfile: false,
    };

    renderHook(() => useRequireAuth());

    expect(mockFetchProfile).toHaveBeenCalled();
  });

  it("NO llama a fetchProfile si loadingProfile es true", () => {
    mockState = {
      token: "FAKE_TOKEN",
      user: null,
      fetchProfile: mockFetchProfile,
      loadingProfile: true,
    };

    renderHook(() => useRequireAuth());

    expect(mockFetchProfile).not.toHaveBeenCalled();
  });
});
