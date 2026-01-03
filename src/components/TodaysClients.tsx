import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, addDoc, where } from "firebase/firestore";
import { db } from "@/firebase";
import { 
  Phone, Mail, Calendar, Clock, CheckCircle, XCircle, DollarSign, CreditCard, 
  User, Edit2, Save, X, MessageSquare, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Booking, Staff } from "@/types";

const TodaysClients = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    services: "",
    completedBy: "",
    amount: 0,
    paymentMode: ""
  });
  const [sortBy, setSortBy] = useState<"time" | "status" | "name">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Type guard function to check if booking is completed
  const isCompleted = (status: string | undefined): status is "completed" => {
    return status === "completed";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's bookings
        const today = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || "pending" // Ensure status has a default
          } as Booking)).filter(booking => booking.date === today);
          
          setBookings(bookingsData);
          setLoading(false);
        });

        // Fetch staff
        const staffSnapshot = await getDocs(collection(db, "staff"));
        const staffData = staffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Staff));
        
        // Debug: Log staff data to identify empty names
        console.log('Staff data:', staffData);
        const staffWithEmptyNames = staffData.filter(member => !member.name || member.name.trim() === "");
        if (staffWithEmptyNames.length > 0) {
          console.warn('Staff members with empty names:', staffWithEmptyNames);
        }
        
        setStaff(staffData);

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCompleteService = (bookingId: string) => {
    setEditingBooking(bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setEditForm({
        services: booking.services.join(" + "),
        completedBy: "",
        amount: 0,
        paymentMode: ""
      });
    }
  };

  const handleSaveCompletion = async (bookingId: string) => {
    try {
      // First, update the booking status
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        completedBy: editForm.completedBy,
        amount: editForm.amount,
        paymentMode: editForm.paymentMode,
        completedAt: new Date()
      });

      // Get the booking details
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Create or update client history
      await createOrUpdateClientHistory(booking, editForm);

      // Generate and send bill
      await generateAndSendBill(bookingId);
      
      // Show success message
      console.log("Service completed and client history updated");
      
      setEditingBooking(null);
    } catch (error) {
      console.error("Error completing service:", error);
    }
  };

  // Sorting function
  const sortBookings = (bookingsToSort: Booking[]) => {
    const sorted = [...bookingsToSort].sort((a, b) => {
      switch (sortBy) {
        case "time":
          const timeA = a.time ? a.time.split(':').map(Number) : [0, 0];
          const timeB = b.time ? b.time.split(':').map(Number) : [0, 0];
          const minutesA = timeA[0] * 60 + timeA[1];
          const minutesB = timeB[0] * 60 + timeB[1];
          return sortOrder === "asc" ? minutesA - minutesB : minutesB - minutesB;
        
        case "status":
          const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
          const orderA = statusOrder[a.status as keyof typeof statusOrder] || 999;
          const orderB = statusOrder[b.status as keyof typeof statusOrder] || 999;
          return sortOrder === "asc" ? orderA - orderB : orderB - orderB;
        
        case "name":
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return sortOrder === "asc" 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        
        default:
          return 0;
      }
    });
    return sorted;
  };

  const createOrUpdateClientHistory = async (booking: Booking, completionData: any) => {
    try {
      // Normalize phone number (remove +91 and spaces/dashes)
      const normalizePhoneNumber = (phone: string) => {
        return phone.replace(/\+91|\s|-/g, '').trim();
      };
      
      const normalizedBookingPhone = normalizePhoneNumber(booking.phone);
      
      // Check if client already exists (by normalized phone number)
      const clientsQuery = query(
        collection(db, "clients"),
        where("contact", "==", booking.phone) // Try exact match first
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      let existingClient = null;
      
      if (!clientsSnapshot.empty) {
        existingClient = clientsSnapshot.docs[0];
      } else {
        // If no exact match, try to find by normalized phone
        const allClientsSnapshot = await getDocs(collection(db, "clients"));
        const matchingClient = allClientsSnapshot.docs.find(doc => {
          const clientPhone = normalizePhoneNumber(doc.data().contact);
          return clientPhone === normalizedBookingPhone;
        });
        
        if (matchingClient) {
          existingClient = matchingClient;
        }
      }
      
      const serviceRecord = {
        date: booking.date,
        services: booking.services || [booking.service],
        staff: completionData.completedBy,
        amount: completionData.amount,
        paymentMode: completionData.paymentMode,
        completedAt: new Date().toISOString()
      };

      if (!existingClient) {
        // Create new client record
        await addDoc(collection(db, "clients"), {
          name: booking.name,
          contact: booking.phone,
          allergies: booking.allergies || "",
          serviceHistory: [serviceRecord],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("Created new client history for:", booking.name);
      } else {
        // Update existing client record
        const existingHistory = existingClient.data().serviceHistory || [];
        
        await updateDoc(doc(db, "clients", existingClient.id), {
          serviceHistory: [...existingHistory, serviceRecord],
          allergies: booking.allergies || existingClient.data().allergies || "",
          updatedAt: new Date()
        });
        console.log("Updated client history for:", booking.name);
      }
    } catch (error) {
      console.error("Error creating/updating client history:", error);
    }
  };

  const generateAndSendBill = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Create bill data
    const billData = {
      clientName: booking.name,
      clientPhone: booking.phone,
      services: editForm.services,
      amount: editForm.amount,
      paymentMode: editForm.paymentMode,
      date: new Date().toISOString(),
      bookingId: bookingId
    };

    // Save bill to Firebase
    await addDoc(collection(db, "bills"), billData);

    // Send WhatsApp message
    const message = `Hello ${booking.name}, this is your bill: https://your-salon-website.com/bill/${bookingId}. Total amount: ₹${editForm.amount}. Thank you for visiting!`;
    const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCancel = () => {
    setEditingBooking(null);
    setEditForm({
      services: "",
      completedBy: "",
      amount: 0,
      paymentMode: ""
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Today's Clients</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as "time" | "status" | "name")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Time</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"} {sortBy}
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No clients scheduled for today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortBookings(bookings).map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-6">
                {editingBooking === booking.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{booking.name}</h3>
                      <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Services
                        </label>
                        <Input
                          value={editForm.services}
                          onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}
                          placeholder="e.g., Hair Spa + Hair Cut"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Completed By
                        </label>
                        <Select value={editForm.completedBy} onValueChange={(value) => setEditForm({ ...editForm, completedBy: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.filter(member => member.name && member.name.trim() !== "").length > 0 ? 
                              staff.filter(member => member.name && member.name.trim() !== "").map((member) => (
                                <SelectItem key={member.id} value={member.name}>
                                  {member.name}
                                </SelectItem>
                              )) : (
                                <SelectItem value="no-staff" disabled>
                                  No staff members available
                                </SelectItem>
                              )
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (₹)
                        </label>
                        <Input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Mode
                        </label>
                        <Select value={editForm.paymentMode} onValueChange={(value) => setEditForm({ ...editForm, paymentMode: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveCompletion(booking.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Complete & Send Bill
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {booking.phone}
                          </div>
                          {booking.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {booking.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Services:</p>
                        <p className="text-sm">{booking.services.join(" + ")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Appointment:</p>
                        <p className="text-sm">{booking.date} at {booking.time}</p>
                      </div>
                      {booking.allergies && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-700">Allergies/Requirements:</p>
                          <p className="text-sm">{booking.allergies}</p>
                        </div>
                      )}
                      {booking.message && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-700">Additional Message:</p>
                          <p className="text-sm">{booking.message}</p>
                        </div>
                      )}
                    </div>

                    {isCompleted(booking.status) ? (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Completed By:</p>
                            <p>{booking.completedBy || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Amount Paid:</p>
                            <p>₹{booking.amount || 0}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Payment Mode:</p>
                            <p>{booking.paymentMode || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <Button
                            onClick={() => updateDoc(doc(db, "bookings", booking.id), { status: "confirmed" })}
                            variant="outline"
                            size="sm"
                          >
                            Confirm
                          </Button>
                        )}
                        <Button
                          onClick={() => handleCompleteService(booking.id)}
                          size="sm"
                          disabled={booking.status === "cancelled"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Service
                        </Button>
                        <Button
                          onClick={() => updateDoc(doc(db, "bookings", booking.id), { status: "cancelled" })}
                          variant="destructive"
                          size="sm"
                          disabled={isCompleted(booking.status)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaysClients;
