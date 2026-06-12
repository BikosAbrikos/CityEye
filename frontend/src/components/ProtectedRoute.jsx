import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="num animate-pulse text-sm text-ink/40 dark:text-white/40">
          Загрузка…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
