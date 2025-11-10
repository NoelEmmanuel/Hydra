"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, User, Mail } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete account");
      }

      // Clear auth state and redirect to landing page
      logout();
      router.push("/");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete account");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

            {/* User Information Section */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Account Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-base text-foreground mt-1">
                      {user?.full_name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-base text-foreground mt-1">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Account Button */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center rounded-lg px-2 py-1.5 text-red-600 hover:bg-red-50 transition-colors group mb-2"
              >
                <Trash2 className="w-5 h-5 flex-shrink-0 text-red-600 group-hover:text-red-700" />
                <span className="text-sm whitespace-nowrap ml-3">Delete Account</span>
              </button>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                <p className="text-sm text-red-900 mb-4 font-medium">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                    {deleteError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

