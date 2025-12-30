"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createJob, getAllUsers } from "@/services/admin-service";

const rideTypes = [
  { value: "airport-transfer", label: "Airport Transfer" },
  { value: "city-ride", label: "City Ride" },
  { value: "outstation", label: "Outstation" },
  { value: "rental", label: "Rental" },
];

const serviceTypes = [
  { value: "drink-and-drive", label: "Drink and Drive" },
  { value: "day-time", label: "Day Time" },
  { value: "vehicle-delivery", label: "Vehicle Delivery" },
];

const vehicleTypes = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "luxury", label: "Luxury" },
];

export default function CreateJobPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [formData, setFormData] = useState({
    rideType: "city-ride",
    vehicleType: "sedan",
    serviceType: "day-time",
    assignedUserId: "",
    pickupLocation: "",
    dropLocation: "",
    pickupArea: "",
    dropArea: "",
    customerName: "",
    phoneNumber: "",
    distance: "",
    basePayment: "",
    waitingCharges: "0",
    foodCharges: "0",
    totalPayment: "",
    companyCommission: "",
    driverPayment: "",
    paymentMethod: "cash",
    status: "pending" as "pending" | "completed",
    specialInstructions: "",
    tripDuration: "00:00:00",
    elapsedTime: "0",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const calculatePayments = (base: number, waiting: number, food: number) => {
    const total = base + waiting + food;
    const commission = total * 0.2; // 20% commission
    const driverPay = total - commission;

    setFormData((prev) => ({
      ...prev,
      totalPayment: total.toFixed(2),
      companyCommission: commission.toFixed(2),
      driverPayment: driverPay.toFixed(2),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate payments when base, waiting, or food charges change
    if (
      name === "basePayment" ||
      name === "waitingCharges" ||
      name === "foodCharges"
    ) {
      const base =
        parseFloat(name === "basePayment" ? value : formData.basePayment) || 0;
      const waiting =
        parseFloat(
          name === "waitingCharges" ? value : formData.waitingCharges
        ) || 0;
      const food =
        parseFloat(name === "foodCharges" ? value : formData.foodCharges) || 0;
      calculatePayments(base, waiting, food);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assignedUserId) {
      alert("Please select a user to assign this job");
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        rideType: formData.rideType as
          | "airport-transfer"
          | "city-ride"
          | "outstation"
          | "rental",
        vehicleType: formData.vehicleType,
        serviceType: formData.serviceType,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        pickupArea: formData.pickupArea,
        dropArea: formData.dropArea,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        distance: parseFloat(formData.distance) || 0,
        basePayment: parseFloat(formData.basePayment) || 0,
        waitingCharges: parseFloat(formData.waitingCharges) || 0,
        foodCharges: parseFloat(formData.foodCharges) || 0,
        totalPayment: parseFloat(formData.totalPayment) || 0,
        companyCommission: parseFloat(formData.companyCommission) || 0,
        driverPayment: parseFloat(formData.driverPayment) || 0,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        specialInstructions: formData.specialInstructions,
        tripDuration: formData.tripDuration,
        elapsedTime: parseFloat(formData.elapsedTime) || 0,
      };

      await createJob(jobData, formData.assignedUserId);
      alert("Job created successfully!");
      router.push("/admin/all-rides");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-2">
            Manually create a ride job for a user
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          {/* Ride Type Selection */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ride Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ride Type *
                </label>
                <select
                  name="rideType"
                  value={formData.rideType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {rideTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to User *
                </label>
                <select
                  name="assignedUserId"
                  value={formData.assignedUserId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop Location *
                </label>
                <input
                  type="text"
                  name="dropLocation"
                  value={formData.dropLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Area
                </label>
                <input
                  type="text"
                  name="pickupArea"
                  value={formData.pickupArea}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop Area
                </label>
                <input
                  type="text"
                  name="dropArea"
                  value={formData.dropArea}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Payment *
                </label>
                <input
                  type="number"
                  name="basePayment"
                  value={formData.basePayment}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waiting Charges
                </label>
                <input
                  type="number"
                  name="waitingCharges"
                  value={formData.waitingCharges}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Charges
                </label>
                <input
                  type="number"
                  name="foodCharges"
                  value={formData.foodCharges}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Payment (Auto-calculated)
                </label>
                <input
                  type="number"
                  name="totalPayment"
                  value={formData.totalPayment}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Commission (Auto-calculated)
                </label>
                <input
                  type="number"
                  name="companyCommission"
                  value={formData.companyCommission}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Payment (Auto-calculated)
                </label>
                <input
                  type="number"
                  name="driverPayment"
                  value={formData.driverPayment}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Additional Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
