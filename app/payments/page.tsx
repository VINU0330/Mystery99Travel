"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import { CardContainer } from "@/components/ui/card-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { getUserTrips, formatTripForDisplay } from "@/services/trip-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PaymentRecord {
  tripId: string
  date: string
  service: string
  totalPayment: number
  commission: number
  riderPayment: number
  status: "completed" | "pending"
}

export default function Payments() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [receivedPayments, setReceivedPayments] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, isUsingLocalAuth } = useAuth()

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return

      try {
        setIsLoading(true)
        setError(null)
        const trips = await getUserTrips(currentUser.uid)

        // Format trips for display
        const formattedTrips = trips.map(formatTripForDisplay)
        setPaymentRecords(formattedTrips)

        // Calculate summary values
        const total = formattedTrips.reduce((sum, record) => sum + record.totalPayment, 0)
        const received = formattedTrips
          .filter((record) => record.status === "completed")
          .reduce((sum, record) => sum + record.totalPayment, 0)
        const pending = formattedTrips
          .filter((record) => record.status === "pending")
          .reduce((sum, record) => sum + record.totalPayment, 0)

        setTotalPayments(total)
        setReceivedPayments(received)
        setPendingPayments(pending)
      } catch (error) {
        console.error("Error fetching payments:", error)
        setError("Failed to load payment data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [currentUser])

  const renderSkeletons = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <CardContainer key={i}>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContainer>
        ))}
      </div>
      <CardContainer>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContainer>
    </>
  )

  const filteredRecords = paymentRecords.filter((record) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return record.status === "completed"
    if (activeTab === "pending") return record.status === "pending"
    return true
  })

  return (
    <MainLayout title="Payments">
      <div className="space-y-6">
        {isUsingLocalAuth && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>Using local authentication mode. Your data is stored locally.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-700" variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {/* Payment Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <CardContainer className="bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-800">Rs.{totalPayments.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary-600"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                  </div>
                </div>
              </CardContainer>

              <CardContainer className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Received Payments</p>
                    <p className="text-2xl font-bold text-gray-800">Rs.{receivedPayments.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <path d="M12 2v20"></path>
                      <path d="m17 5-5-3-5 3"></path>
                      <path d="m17 19-5 3-5-3"></path>
                      <path d="M5 12H2"></path>
                      <path d="M22 12h-3"></path>
                    </svg>
                  </div>
                </div>
              </CardContainer>

              <CardContainer className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-800">Rs.{pendingPayments.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="6" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                </div>
              </CardContainer>
            </motion.div>

            {/* Payment Records */}
            <CardContainer>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Payment History</h2>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No payment records found. Complete a trip to see payment history.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trip ID
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Commission
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rider
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredRecords.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-3 px-4 whitespace-nowrap text-sm">{record.tripId}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm">{record.date}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm">{record.service}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm">
                                Rs.{record.totalPayment.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm">
                                Rs.{record.commission.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-green-600">
                                Rs.{record.riderPayment.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {record.status === "completed" ? "Completed" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContainer>
          </>
        )}
      </div>
    </MainLayout>
  )
}
