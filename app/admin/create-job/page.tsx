"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/services/admin-service";

const serviceTypes = [
  { value: "drink-and-drive", label: "Drink and Drive" },
  { value: "day-time", label: "Day Time" },
  { value: "vehicle-delivery", label: "Vehicle Delivery" },
];

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    rideType: "",
    pickupLocation: "",
    dropLocation: "",
    customerName: "",
    phoneNumber: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Create the job
      await createJob(formData);

      // Format the SMS message with job details
      const rideTypeLabel =
        serviceTypes.find((type) => type.value === formData.rideType)?.label ||
        formData.rideType;

      const smsMessage = `Mystery99 Travel - New Job Booking

Ride Type: ${rideTypeLabel}
Pickup: ${formData.pickupLocation}
Drop: ${formData.dropLocation}
Customer: ${formData.customerName}

For assistance, call our help hotline: 0779621559

Thank you for choosing Mystery99 Travel!`;

      // Send SMS to customer
      try {
        const smsResponse = await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: formData.phoneNumber,
            message: smsMessage,
          }),
        });

        const smsData = await smsResponse.json();

        if (!smsData.success) {
          console.error("Failed to send SMS:", smsData.error);
          // Don't fail the job creation if SMS fails
        } else {
          console.log("SMS sent successfully:", smsData);
        }
      } catch (smsError) {
        console.error("Error sending SMS:", smsError);
        // Don't fail the job creation if SMS fails
      }

      setShowSuccess(true);
      // Reset form
      setFormData({
        rideType: "",
        pickupLocation: "",
        dropLocation: "",
        customerName: "",
        phoneNumber: "",
      });
      // Redirect after showing success message
      setTimeout(() => {
        router.push("/admin/all-rides");
      }, 2000);
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to create a new ride job
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          {/* Ride Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ride Type <span className="text-red-500">*</span>
            </label>
            <select
              name="rideType"
              value={formData.rideType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select ride type</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              placeholder="Enter pickup location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Drop Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drop Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="dropLocation"
              value={formData.dropLocation}
              onChange={handleInputChange}
              placeholder="Enter drop location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

        {/* Success Popup */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-scale-in">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 mb-6">
                  Job created successfully. Redirecting to all jobs...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
