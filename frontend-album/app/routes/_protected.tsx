import { Outlet, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { useRequireAuth } from "../hooks/useRequireAuth";

export default function ProtectedLayout() {
  const status = useRequireAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  if (status !== "authenticated") {
    console.log("ProtectedLayout_redirect");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
