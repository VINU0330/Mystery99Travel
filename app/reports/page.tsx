"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CardContainer } from "@/components/ui/card-container"
import MainLayout from "@/components/layout/main-layout"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { getUserTrips } from "@/services/trip-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CalendarIcon, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { Input } from "@/components/ui/input"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface TripReport {
  tripId: string
  date: string
  service: string
  pickupLocation: string
  dropLocation: string
  waitingTime: string
  totalDistance: string
  totalTripTime: string
  totalPayment: number
  driverCommission: number
  companyCommission: number
  customerName: string
  customerPhone: string
  paymentMethod: string
  status: string
}

export default function Reports() {
  const [trips, setTrips] = useState<TripReport[]>([])
  const [filteredTrips, setFilteredTrips] = useState<TripReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, isUsingLocalAuth } = useAuth()

  // Filter states
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [phoneNumberFilter, setPhoneNumberFilter] = useState<string>("")

  // Summary states
  const [totalPayments, setTotalPayments] = useState(0)
  const [totalDriverCommission, setTotalDriverCommission] = useState(0)
  const [totalCompanyCommission, setTotalCompanyCommission] = useState(0)

  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) return

      try {
        setIsLoading(true)
        setError(null)
        const tripsData = await getUserTrips(currentUser.uid)

        // Transform trips data for reports
        const reportTrips: TripReport[] = tripsData.map((trip) => ({
          tripId: trip.id.substring(0, 8).toUpperCase(),
          date:
            trip.createdAt instanceof Date
              ? trip.createdAt.toISOString().split("T")[0]
              : trip.createdAt.toDate().toISOString().split("T")[0],
          service: getServiceName(trip.serviceType),
          pickupLocation: trip.pickupLocation || "N/A",
          dropLocation: trip.dropLocation || "N/A",
          waitingTime: trip.waitingTime ? formatTime(trip.waitingTime) : "00:00:00",
          totalDistance: trip.distance ? `${trip.distance.toFixed(2)} KM` : "N/A",
          totalTripTime: trip.tripDuration || "N/A",
          totalPayment: trip.totalPayment,
          driverCommission: trip.driverPayment,
          companyCommission: trip.companyCommission,
          customerName: trip.customerName || "N/A",
          customerPhone: trip.phoneNumber || "N/A",
          paymentMethod: trip.paymentMethod === "cash" ? "Cash" : "Credit",
          status: trip.status === "completed" ? "Completed" : "Pending",
        }))

        setTrips(reportTrips)
        setFilteredTrips(reportTrips)
      } catch (error) {
        console.error("Error fetching trips:", error)
        setError("Failed to load trip data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [currentUser])

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...trips]

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((trip) => new Date(trip.date) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((trip) => new Date(trip.date) <= dateTo)
    }

    // Service filter
    if (serviceFilter !== "all") {
      filtered = filtered.filter((trip) => trip.service.toLowerCase().includes(serviceFilter))
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((trip) => trip.paymentMethod.toLowerCase() === paymentMethodFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((trip) => trip.status.toLowerCase() === statusFilter)
    }

    // Phone number filter
    if (phoneNumberFilter.trim() !== "") {
      filtered = filtered.filter((trip) => trip.customerPhone.toLowerCase().includes(phoneNumberFilter.toLowerCase()))
    }

    setFilteredTrips(filtered)

    // Calculate summary
    const totalPayment = filtered.reduce((sum, trip) => sum + trip.totalPayment, 0)
    const totalDriver = filtered.reduce((sum, trip) => sum + trip.driverCommission, 0)
    const totalCompany = filtered.reduce((sum, trip) => sum + trip.companyCommission, 0)

    setTotalPayments(totalPayment)
    setTotalDriverCommission(totalDriver)
    setTotalCompanyCommission(totalCompany)
  }, [trips, dateFrom, dateTo, serviceFilter, paymentMethodFilter, statusFilter, phoneNumberFilter])

  const getServiceName = (serviceType: string) => {
    switch (serviceType) {
      case "drink-and-drive":
        return "Drink and Drive"
      case "day-time":
        return "Day Time Service"
      case "vehicle-delivery":
        return "Vehicle Delivery"
      default:
        return serviceType
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const clearFilters = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setServiceFilter("all")
    setPaymentMethodFilter("all")
    setStatusFilter("all")
    setPhoneNumberFilter("")
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Trip Report", 14, 22)

    // Add user info
    doc.setFontSize(12)
    doc.text(`User: ${currentUser?.email || "N/A"}`, 14, 35)
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 45)

    // Add date range if filters applied
    if (dateFrom || dateTo) {
      const fromStr = dateFrom ? format(dateFrom, "PP") : "Start"
      const toStr = dateTo ? format(dateTo, "PP") : "End"
      doc.text(`Period: ${fromStr} - ${toStr}`, 14, 55)
    }

    // Prepare table data
    const tableData = filteredTrips.map((trip) => [
      trip.tripId,
      trip.date,
      trip.service,
      trip.pickupLocation,
      trip.dropLocation,
      trip.waitingTime,
      trip.totalDistance,
      trip.totalTripTime,
      `Rs.${trip.totalPayment.toLocaleString()}`,
      `Rs.${trip.driverCommission.toLocaleString()}`,
      `Rs.${trip.companyCommission.toLocaleString()}`,
      trip.customerName,
      trip.customerPhone,
      trip.paymentMethod,
      trip.status,
    ])

    // Add table
    doc.autoTable({
      head: [
        [
          "Trip ID",
          "Date",
          "Service",
          "Pickup",
          "Drop",
          "Waiting Time",
          "Distance",
          "Trip Time",
          "Total Payment",
          "Driver Commission",
          "Company Commission",
          "Customer",
          "Phone",
          "Payment",
          "Status",
        ],
      ],
      body: tableData,
      startY: dateFrom || dateTo ? 65 : 55,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 82, 204] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 25 },
        9: { cellWidth: 25 },
        10: { cellWidth: 25 },
        11: { cellWidth: 25 },
        12: { cellWidth: 20 },
        13: { cellWidth: 20 },
        14: { cellWidth: 20 },
      },
    })

    // Add summary at the bottom
    const finalY = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(14)
    doc.text("Summary", 14, finalY)

    doc.setFontSize(12)
    doc.text(`Total Payments: Rs.${totalPayments.toLocaleString()}`, 14, finalY + 15)
    doc.text(`Total Driver Commission: Rs.${totalDriverCommission.toLocaleString()}`, 14, finalY + 25)
    doc.text(`Total Company Commission: Rs.${totalCompanyCommission.toLocaleString()}`, 14, finalY + 35)

    // Save the PDF
    const fileName = `trip-report-${format(new Date(), "yyyy-MM-dd")}.pdf`
    doc.save(fileName)
  }

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
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContainer>
    </>
  )

  return (
    <MainLayout title="Reports">
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
            {/* Summary Cards */}
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
                </div>
              </CardContainer>

              <CardContainer className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Driver Commission</p>
                    <p className="text-2xl font-bold text-gray-800">Rs.{totalDriverCommission.toLocaleString()}</p>
                  </div>
                </div>
              </CardContainer>

              <CardContainer className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Company Commission</p>
                    <p className="text-2xl font-bold text-gray-800">Rs.{totalCompanyCommission.toLocaleString()}</p>
                  </div>
                </div>
              </CardContainer>
            </motion.div>

            {/* Filters */}
            <CardContainer>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </h2>
                <div className="flex gap-2">
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Clear Filters
                  </Button>
                  <Button onClick={generatePDF} className="bg-primary-600 hover:bg-primary-700" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Date From */}
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Service</label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="drink">Drink and Drive</SelectItem>
                      <SelectItem value="day">Day Time Service</SelectItem>
                      <SelectItem value="vehicle">Vehicle Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone Number Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Customer Phone</label>
                  <Input
                    value={phoneNumberFilter}
                    onChange={(e) => setPhoneNumberFilter(e.target.value)}
                    placeholder="Search by phone number"
                    className="h-10"
                  />
                </div>
              </div>
            </CardContainer>

            {/* Reports Table */}
            <CardContainer>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Trip Reports ({filteredTrips.length} trips)</h2>
              </div>

              {filteredTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No trips found matching the selected criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Trip ID
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Pickup
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">Drop</th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Waiting
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Distance
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="py-3 px-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTrips.map((trip, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-2 whitespace-nowrap font-mono text-xs">{trip.tripId}</td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs">{trip.date}</td>
                          <td className="py-3 px-2 text-xs">{trip.service}</td>
                          <td className="py-3 px-2 text-xs max-w-24 truncate" title={trip.pickupLocation}>
                            {trip.pickupLocation}
                          </td>
                          <td className="py-3 px-2 text-xs max-w-24 truncate" title={trip.dropLocation}>
                            {trip.dropLocation}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap font-mono text-xs">{trip.waitingTime}</td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs">{trip.totalDistance}</td>
                          <td className="py-3 px-2 whitespace-nowrap font-mono text-xs">{trip.totalTripTime}</td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs font-medium">
                            Rs.{trip.totalPayment.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs text-green-600">
                            Rs.{trip.driverCommission.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs text-blue-600">
                            Rs.{trip.companyCommission.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-xs max-w-20 truncate" title={trip.customerName}>
                            {trip.customerName}
                          </td>
                          <td className="py-3 px-2 text-xs">{trip.customerPhone}</td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs">{trip.paymentMethod}</td>
                          <td className="py-3 px-2 whitespace-nowrap text-xs">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                trip.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContainer>
          </>
        )}
      </div>
    </MainLayout>
  )
}
