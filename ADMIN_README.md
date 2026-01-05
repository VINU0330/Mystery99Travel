# Admin System Documentation

## Overview

The admin system allows authorized users to manage jobs, view all rides from all users, and manage user accounts.

## Features

### 1. Admin Role Management

- Admin users are stored in Firestore under the `admins` collection
- Each admin has an email and role (admin or super-admin)
- Only authenticated users with admin role can access admin routes

### 2. Admin Dashboard (`/admin`)

- Overview of total rides, completed, pending, and active users
- Quick action buttons to create jobs, view rides, and manage users
- Clean, intuitive interface

### 3. Create Job Form (`/admin/create-job`)

- **Ride Type Selection**: Choose from:
  - Airport Transfer
  - City Ride
  - Outstation
  - Rental
- **Vehicle Type**: Sedan, SUV, Hatchback, Luxury
- **Service Type**: Drink and Drive, Day Time, Vehicle Delivery
- **Location Details**: Pickup/Drop locations with area information
- **Customer Details**: Name and phone number
- **Payment Details**:
  - Auto-calculating total payment
  - Auto-calculating company commission (20%)
  - Auto-calculating driver payment
- **Assign to User**: Select which user the job belongs to
- **Special Instructions**: Additional notes for the ride

### 4. All Rides View (`/admin/all-rides`)

- View all rides from all users in the system
- Filter by status (All, Completed, Pending)
- Search by location, customer name, phone, or service type
- Summary statistics: Total rides, completed, pending, total revenue
- Detailed table showing:
  - Date, Ride Type, Service Type
  - Pickup and Drop locations
  - Customer information
  - Payment details
  - Status
- Financial summary at the bottom

### 5. Users Management (`/admin/users`)

- View all registered users
- Search by email or user ID
- Quick actions to create jobs for specific users

## Setup Instructions

### Step 1: Sign up the Admin User

1. Go to your app and sign up with email `vinidunirmitha10@gmail.com`
2. Complete the signup process

### Step 2: Grant Admin Access

**Option A: Using the Setup Page (Recommended)**

1. Navigate to `/setup-admin` in your browser
2. If logged in as the user you want to make admin, click "Make Me Admin"
3. If adding another user, enter their User ID and email, then click "Add Admin User"

**Option B: Manual Firestore Entry**

1. Go to Firebase Console > Firestore Database
2. Create a new collection called `admins`
3. Add a document with the User ID as the document ID
4. Add fields:
   ```
   email: "vinidunirmitha10@gmail.com"
   role: "admin"
   createdAt: [Current timestamp]
   ```

### Step 3: Access Admin Dashboard

1. Log in with the admin account
2. Go to `/service-selection` - you'll see an "Admin Access" banner at the top
3. Click "Go to Admin Dashboard" or navigate directly to `/admin`

## Routes

- `/admin` - Admin dashboard
- `/admin/create-job` - Create new job form
- `/admin/all-rides` - View all rides from all users
- `/admin/users` - View and manage users
- `/setup-admin` - Setup page to grant admin access (accessible to any logged-in user)

## Security

- Admin routes are protected by middleware
- Only authenticated users can access admin routes
- Admin verification happens in the layout component
- Non-admin users are redirected to service selection
- The `isAdmin` function checks Firestore for admin role

## Data Models

### AdminUser Interface

```typescript
{
  email: string;
  role: "admin" | "super-admin";
  createdAt: Timestamp | Date;
}
```

### JobData Interface (extends TripData)

```typescript
{
  rideType: "airport-transfer" | "city-ride" | "outstation" | "rental"
  vehicleType?: string
  specialInstructions?: string
  scheduledTime?: Timestamp | Date
  // ... all TripData fields
}
```

## Usage Examples

### Creating a Job

1. Go to `/admin/create-job`
2. Select ride type (e.g., "City Ride")
3. Select vehicle type (e.g., "Sedan")
4. Select service type (e.g., "Day Time")
5. Choose the user to assign the job to
6. Fill in location details
7. Add customer information
8. Enter base payment (other fields auto-calculate)
9. Add any special instructions
10. Click "Create Job"

### Viewing All Rides

1. Go to `/admin/all-rides`
2. Use filters to narrow down rides by status
3. Use search to find specific rides
4. View summary statistics at the top
5. See financial breakdown at the bottom

### Managing Users

1. Go to `/admin/users`
2. Search for specific users
3. Click "Create Job" next to a user to assign them a job
4. View user details and activity

## Troubleshooting

### Issue: Can't access admin routes

- **Solution**: Ensure the user has been added to the `admins` collection in Firestore
- Check that you're logged in with the correct account
- Verify the User ID matches the document ID in the `admins` collection

### Issue: Admin button not showing on service selection

- **Solution**: The button appears only for users with admin role
- Refresh the page after granting admin access
- Clear browser cache if needed

### Issue: Jobs not appearing in user's account

- **Solution**: Verify you selected the correct user when creating the job
- Check the `userId` field in the trip document
- Ensure the trip was saved successfully

## Future Enhancements

Potential features to add:

- Edit existing jobs
- Delete jobs
- User role management (promote/demote admins)
- Advanced analytics and reporting
- Bulk job creation
- Job scheduling and notifications
- Driver assignment system
- Real-time ride tracking integration
