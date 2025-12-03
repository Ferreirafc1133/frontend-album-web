import { useEffect } from "react";
import { useUserStore } from "../store/useUserStore";

type AuthStatus = "authenticated" | "unauthenticated";

export function useRequireAuth(): AuthStatus {
  const { token, user, fetchProfile, loadingProfile } = useUserStore((state) => ({
    token: state.token,
    user: state.user,
    fetchProfile: state.fetchProfile,
    loadingProfile: state.loadingProfile,
  }));

  useEffect(() => {
    if (token && !user && !loadingProfile) {
      console.log("useRequireAuth_fetch_profile");
      fetchProfile().catch(() => {
        console.log("useRequireAuth_fetch_profile_error");
      });
    }
  }, [token, user, loadingProfile, fetchProfile]);

  if (!token) {
    console.log("useRequireAuth_no_token");
    return "unauthenticated";
  }
  return "authenticated";
}
