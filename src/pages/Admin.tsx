import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Navigate } from "react-router-dom";
import SuperAdminPanel from "@/components/dashboard/SuperAdminPanel";

export default function Admin() {
  const { isSuperAdmin, loading } = useSuperAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6">
      <SuperAdminPanel />
    </div>
  );
}
