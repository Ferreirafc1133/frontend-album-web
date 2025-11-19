import { Outlet, Navigate } from "react-router";
import { useRequireAuth } from "../hooks/useRequireAuth";

export default function ProtectedLayout() {
  const status = useRequireAuth();
  if (status !== "authenticated") {
    console.log("ProtectedLayout_redirect");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
