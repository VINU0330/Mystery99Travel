"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllTrips } from "@/services/admin-service";
import type { TripData } from "@/services/trip-service";

export default function AllRidesPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<
    Array<TripData & { id: string; rideType?: string; vehicleType?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllTrips();
  }, []);

  const fetchAllTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getAllTrips();
      setTrips(allTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      alert("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    // Filter by status
    if (filter !== "all" && trip.status !== filter) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        trip.pickupLocation?.toLowerCase().includes(search) ||
        trip.dropLocation?.toLowerCase().includes(search) ||
        trip.customerName?.toLowerCase().includes(search) ||
        trip.phoneNumber?.includes(search) ||
        trip.serviceType?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const formatDate = (timestamp: any) => {
    try {
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      } else if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  };

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case "drink-and-drive":
        return "Drink & Drive";
      case "day-time":
        return "Day Time";
      case "vehicle-delivery":
        return "Vehicle Delivery";
      default:
        return serviceType;
    }
  };

  const getRideTypeLabel = (rideType?: string) => {
    if (!rideType) return "N/A";
    switch (rideType) {
      case "airport-transfer":
        return "Airport Transfer";
      case "city-ride":
        return "City Ride";
      case "outstation":
        return "Outstation";
      case "rental":
        return "Rental";
      default:
        return rideType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Rides</h1>
          <p className="text-gray-600 mt-2">View rides from all users</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rides</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by location, customer name, phone, or service..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Rides</p>
            <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {trips.filter((t) => t.status === "completed").length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {trips.filter((t) => t.status === "pending").length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹
              {trips
                .reduce((sum, t) => sum + (t.totalPayment || 0), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ride Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup → Drop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No rides found
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(trip.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getRideTypeLabel(trip.rideType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getServiceLabel(trip.serviceType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          <p className="truncate">{trip.pickupLocation}</p>
                          <p className="text-gray-500 truncate">
                            → {trip.dropLocation}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p>{trip.customerName || "N/A"}</p>
                          <p className="text-gray-500 text-xs">
                            {trip.phoneNumber || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p className="font-semibold">
                            ₹{trip.totalPayment.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {trip.paymentMethod}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredTrips.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Payment</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹
                  {filteredTrips
                    .reduce((sum, t) => sum + t.totalPayment, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Commission</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹
                  {filteredTrips
                    .reduce((sum, t) => sum + t.companyCommission, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Driver Payment</p>
                <p className="text-xl font-bold text-green-600">
                  ₹
                  {filteredTrips
                    .reduce((sum, t) => sum + t.driverPayment, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
