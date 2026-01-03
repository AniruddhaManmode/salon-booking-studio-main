# Salon Booking System - Chair Management

## Overview
The salon booking system now supports **2 chairs** with intelligent time slot management to prevent overbooking.

## How It Works

### Chair Capacity
- **Maximum 2 clients** can be served simultaneously
- **No 3rd client** can be booked at overlapping times
- System automatically checks existing bookings before showing available slots

### Time Slot Logic
1. **Service Duration Calculation**: Each service has a minimum duration (e.g., Hair Spa = 45-60 min)
2. **Overlap Detection**: System checks if new booking overlaps with existing appointments
3. **Chair Availability**: Only shows slots where fewer than 2 chairs are occupied
4. **Real-time Updates**: Time slots update dynamically based on existing bookings

### User Experience
- **Visual Feedback**: Shows number of available slots
- **Loading States**: Indicates when checking availability
- **Clear Messages**: Explains why slots might be unavailable
- **Smart Scheduling**: Prevents double-booking and overcrowding

## Example Scenarios

### Scenario 1: Empty Schedule
- All time slots available (9 AM - 8 PM)
- 2 clients can book same time slot

### Scenario 2: One Client Booked
- Client A books Hair Spa (45 min) at 10:00 AM
- 10:00 AM slot still shows as available (1 chair occupied)
- Another client can book at 10:00 AM

### Scenario 3: Two Clients Booked
- Client A books Hair Spa (45 min) at 10:00 AM
- Client B books Men's Haircut (30 min) at 10:00 AM
- 10:00 AM slot now shows as unavailable (2 chairs occupied)
- Third client must choose different time

### Scenario 4: Partial Overlap
- Client A books 60 min service at 10:00 AM (ends 11:00 AM)
- Client B wants 30 min service at 10:45 AM
- System detects overlap and prevents booking
- Client B must choose time before 10:00 AM or after 11:00 AM

## Technical Implementation

### Firebase Integration
- Queries existing bookings for selected date
- Filters by status (pending, confirmed)
- Calculates service durations and overlaps

### Time Calculation
```javascript
// Convert time to minutes for easy comparison
const bookingStartMinutes = hour * 60 + minute;
const bookingEndMinutes = bookingStartMinutes + serviceDuration;

// Check overlap
if (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes) {
  // Overlap detected
}
```

### Chair Limit
```javascript
const MAX_CHAIRS = 2;
if (conflictingBookings.length < MAX_CHAIRS) {
  // Slot is available
}
```

## Benefits

1. **Optimal Resource Utilization**: Maximum 2 clients served simultaneously
2. **No Overbooking**: Prevents scheduling conflicts
3. **Better Customer Experience**: Clear availability information
4. **Staff Efficiency**: Manageable workload per time slot
5. **Revenue Optimization**: Full utilization of available chairs

## Future Enhancements

- Add specific chair assignment (Chair 1, Chair 2)
- Different service types per chair (e.g., hair vs beauty)
- Staff assignment to specific chairs
- Buffer time between appointments
- Priority booking for premium services
