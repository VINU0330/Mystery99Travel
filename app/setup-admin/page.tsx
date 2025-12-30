"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { addAdminUser } from "@/services/admin-service";

export default function SetupAdminPage() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("vinidunirmitha10@gmail.com");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !email) {
      setMessage("Please provide both User ID and Email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addAdminUser(userId, email, "admin");
      setMessage(`✅ Successfully added admin role for ${email}`);
    } catch (error) {
      console.error("Error adding admin:", error);
      setMessage(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to add admin"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrentUser = async () => {
    if (!currentUser) {
      setMessage("❌ You must be logged in");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addAdminUser(currentUser.uid, currentUser.email || "", "admin");
      setMessage(`✅ Successfully added admin role for ${currentUser.email}`);
    } catch (error) {
      console.error("Error adding admin:", error);
      setMessage(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to add admin"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Setup Admin User
        </h1>

        {currentUser && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Currently logged in as:
            </p>
            <p className="font-semibold text-gray-900">{currentUser.email}</p>
            <p className="text-xs text-gray-500 mt-1">UID: {currentUser.uid}</p>
            <button
              onClick={handleAddCurrentUser}
              disabled={loading}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Adding..." : "Make Me Admin"}
            </button>
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Or Add Another User
          </h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Firebase User ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The user must be registered in Firebase Auth first
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? "Adding Admin..." : "Add Admin User"}
            </button>
          </form>
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-md ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            Instructions:
          </h3>
          <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>First, have the user sign up at the application</li>
            <li>
              Get their Firebase User ID from Firebase Console or use the
              current user button
            </li>
            <li>Enter the User ID and email in the form above</li>
            <li>Click "Add Admin User" to grant admin access</li>
            <li>The user can then access /admin routes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
