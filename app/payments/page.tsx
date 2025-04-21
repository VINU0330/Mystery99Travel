"use client"

import AppLayout from "@/components/app-layout"
import { useState, useEffect } from "react"

interface PaymentRecord {
  tripId: string
  totalPayment: number
  commission: number
  riderPayment: number
}

export default function Payments() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [receivedPayments, setReceivedPayments] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)

  // Simulate loading payment data
  useEffect(() => {
    // In a real app, this would be an API call
    const mockPaymentRecords: PaymentRecord[] = [
      { tripId: "DrinkAndDrive01", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive02", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive03", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive04", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive05", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive06", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive07", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive08", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive09", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
      { tripId: "DrinkAndDrive10", totalPayment: 5000, commission: 2000, riderPayment: 3000 },
    ]

    setPaymentRecords(mockPaymentRecords)

    // Calculate summary values
    const total = mockPaymentRecords.reduce((sum, record) => sum + record.totalPayment, 0)
    setTotalPayments(total)
    setReceivedPayments(total / 2) // For demo purposes
    setPendingPayments(total / 2) // For demo purposes
  }, [])

  return (
    <AppLayout title="Payments">
      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="bg-blue-100 rounded-full py-2 px-4 flex justify-between items-center">
            <span className="font-medium">Total Payments</span>
            <span className="font-bold">Rs.{totalPayments.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center px-4">
            <span>Received Payments</span>
            <span className="text-green-500 font-medium">Rs.{receivedPayments.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center px-4">
            <span>Pending Payments</span>
            <span className="text-red-500 font-medium">Rs.{pendingPayments.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Table */}
        <div className="border rounded overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Payment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.tripId}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">Rs.{record.totalPayment.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">Rs.{record.commission.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-500">
                      Rs.{record.riderPayment.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
