import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        // Redirect non-admins to home
        setLocation("/");
        return null;
    }

    return <>{children}</>;
}
