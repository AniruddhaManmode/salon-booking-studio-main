import { useState, useEffect } from "react";
import { Calendar, Clock, Phone, Mail, MessageSquare, X, CheckCircle, Loader2, Send, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

interface Service {
  title: string;
  timeRequired: string;
  minDuration: number; // in minutes
  maxDuration: number; // in minutes
}

// Fallback services for when Firebase is not available
const fallbackServices: Service[] = [
  { title: "Hydra Facial", timeRequired: "60-90 min", minDuration: 60, maxDuration: 90 },
  { title: "Hair Spa", timeRequired: "45-60 min", minDuration: 45, maxDuration: 60 },
  { title: "Bridal Makeup", timeRequired: "3-4 hours", minDuration: 180, maxDuration: 240 },
  { title: "Hair Styling", timeRequired: "30-45 min", minDuration: 30, maxDuration: 45 },
  { title: "Manicure & Pedicure", timeRequired: "60-75 min", minDuration: 60, maxDuration: 75 },
  { title: "Threading & Shaping", timeRequired: "15-20 min", minDuration: 15, maxDuration: 20 },
  { title: "Full Body Waxing", timeRequired: "90-120 min", minDuration: 90, maxDuration: 120 },
  { title: "Men's Haircut", timeRequired: "20-30 min", minDuration: 20, maxDuration: 30 },
];

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string;
}

const BookingForm = ({ isOpen, onClose, selectedService }: BookingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [selectedServices, setSelectedServices] = useState<string[]>([selectedService]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    allergies: "",
    message: "",
  });

  // Fetch services from Firebase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (servicesData.length > 0) {
          // Transform Firebase services to match BookingForm format
          const transformedServices = servicesData.map((service: any) => {
            // Parse time required to get min/max duration
            const timeStr = service.timeRequired.toLowerCase();
            let minDuration = 30, maxDuration = 60; // defaults
            
            if (timeStr.includes("hour")) {
              const hours = parseInt(timeStr) || 1;
              minDuration = hours * 60;
              maxDuration = hours * 60 + 30;
            } else if (timeStr.includes("min")) {
              const minutes = parseInt(timeStr) || 30;
              minDuration = minutes;
              maxDuration = minutes + 15;
            }
            
            return {
              title: service.name,
              timeRequired: service.timeRequired,
              minDuration,
              maxDuration
            };
          });
          setServices(transformedServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Keep fallback services on error
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Generate time slots based on selected services and chair availability
  const generateTimeSlots = async () => {
    if (!selectedDate || selectedServices.length === 0) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);

    // Calculate total duration needed
    const totalDuration = selectedServices.reduce((total, serviceName) => {
      const service = services.find(s => s.title === serviceName);
      return total + (service?.minDuration || 30);
    }, 0);

    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 20; // 8 PM
    const now = new Date();
    const MAX_CHAIRS = 2; // You have 2 chairs
    
    // Fetch existing bookings for the selected date
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", "==", selectedDate),
        where("status", "in", ["pending", "confirmed"])
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const existingBookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any)); // Use 'any' for flexibility with existing data structure

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = new Date(`${selectedDate}T${slotTime}:00`);
          
          // Check if slot is in the future and has enough time before closing
          if (slotDateTime > now && (hour * 60 + minute + totalDuration) <= (endHour * 60)) {
            
            // Check chair availability for this time slot
            const conflictingBookings = existingBookings.filter(booking => {
              if (!booking.time) return false;
              
              const bookingTime = booking.time;
              const bookingHour = parseInt(bookingTime.split(':')[0]);
              const bookingMinute = parseInt(bookingTime.split(':')[1]);
              const bookingStartMinutes = bookingHour * 60 + bookingMinute;
              
              // Calculate booking duration (default 60 minutes if not specified)
              const bookingServices = booking.services || [booking.service];
              const bookingDuration = bookingServices.reduce((total: number, service: string) => {
                const foundService = services.find(s => s.title === service);
                return total + (foundService?.minDuration || 60);
              }, 0);
              
              const bookingEndMinutes = bookingStartMinutes + bookingDuration;
              const slotStartMinutes = hour * 60 + minute;
              const slotEndMinutes = slotStartMinutes + totalDuration;
              
              // Check if time slots overlap
              return (
                (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes)
              );
            });
            
            // Only allow slot if fewer than 2 chairs are occupied
            if (conflictingBookings.length < MAX_CHAIRS) {
              slots.push(slotTime);
            }
          }
        }
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching existing bookings:", error);
      // Fallback to basic time slot generation if Firebase fails
      const fallbackSlots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = new Date(`${selectedDate}T${slotTime}:00`);
          
          if (slotDateTime > now && (hour * 60 + minute + totalDuration) <= (endHour * 60)) {
            fallbackSlots.push(slotTime);
          }
        }
      }
      setAvailableSlots(fallbackSlots);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate, selectedServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addService = () => {
    if (selectedServices.length < services.length) {
      const availableServices = services.filter(s => !selectedServices.includes(s.title));
      if (availableServices.length > 0) {
        setSelectedServices([...selectedServices, availableServices[0].title]);
      }
    }
  };

  const removeService = (serviceToRemove: string) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter(s => s !== serviceToRemove));
    }
  };

  const updateService = (index: number, newService: string) => {
    const updatedServices = [...selectedServices];
    updatedServices[index] = newService;
    setSelectedServices(updatedServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      allergies: formData.allergies,
      message: formData.message,
      timestamp: new Date().toISOString(),
    };

    try {
      // Send to Firebase Firestore
      const docRef = await addDoc(collection(db, "bookings"), {
        ...submitData,
        createdAt: serverTimestamp(),
        status: "pending"
      });

      console.log("Booking saved to Firebase with ID:", docRef.id);

      // Show success message
      setIsSuccess(true);
      setFormData({ name: "", phone: "", email: "", allergies: "", message: "" });
      setSelectedServices([selectedService]);
      setSelectedDate("");
      setSelectedTime("");
      
      toast({
        title: "Booking Successful!",
        description: "Your appointment request has been received. We'll contact you soon!",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Fallback to localStorage if Firebase fails
      const existingBookings = JSON.parse(localStorage.getItem('salonBookings') || '[]');
      existingBookings.push(submitData);
      localStorage.setItem('salonBookings', JSON.stringify(existingBookings));
      
      console.log("Booking saved locally (Firebase failed):", submitData);
      
      setIsSuccess(true);
      setFormData({ name: "", phone: "", email: "", allergies: "", message: "" });
      setSelectedServices([selectedService]);
      setSelectedDate("");
      setSelectedTime("");
      
      toast({
        title: "Booking Received!",
        description: "Your appointment has been recorded. We'll contact you soon!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: "", phone: "", email: "", allergies: "", message: "" });
    setSelectedServices([selectedService]);
    setSelectedDate("");
    setSelectedTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 mb-4 sm:mb-0 bg-card rounded-2xl shadow-elevated overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-primary-foreground">
            {isSuccess ? "Thank You!" : "Book Appointment"}
          </h3>
          <button
            onClick={handleClose}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success Message */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h4 className="font-display text-2xl text-foreground mb-3">
              Booking Request Sent!
            </h4>
            <p className="text-muted-foreground mb-6">
              Thank you for choosing AS Unisex Salon. We will contact you shortly to confirm your appointment.
            </p>
            <button
              onClick={handleClose}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Services Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Services *
              </label>
              <div className="space-y-2">
                {selectedServices.map((service, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={service}
                      onChange={(e) => updateService(index, e.target.value)}
                      className="flex-1 bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    >
                      {services.map((s) => (
                        <option key={s.title} value={s.title}>
                          {s.title} ({s.timeRequired})
                        </option>
                      ))}
                    </select>
                    {selectedServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {selectedServices.length < services.length && (
                  <button
                    type="button"
                    onClick={addService}
                    className="w-full py-2 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Service
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time Slot *
                </label>
                {isLoadingSlots && (
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      Checking available time slots...
                    </p>
                  </div>
                )}
                {!isLoadingSlots && selectedDate && availableSlots.length === 0 && (
                  <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <Clock className="w-4 h-4 inline mr-2" />
                      No available time slots for the selected services and date. 
                      All chairs are occupied or the salon is closed.
                    </p>
                  </div>
                )}
                {!isLoadingSlots && selectedDate && availableSlots.length > 0 && (
                  <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {availableSlots.length} time slot{availableSlots.length > 1 ? 's' : ''} available 
                      (Maximum 2 clients at a time)
                    </p>
                  </div>
                )}
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                  disabled={!selectedDate || availableSlots.length === 0 || isLoadingSlots}
                >
                  <option value="">
                    {isLoadingSlots ? "Loading..." : "Select time"}
                  </option>
                  {!isLoadingSlots && availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} - Available
                    </option>
                  ))}
                </select>
                {!selectedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Please select a date first to see available time slots
                  </p>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Allergies or Specific Requirements
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Please mention any allergies or specific requirements..."
                rows={2}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
              />
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any other requirements or questions..."
                rows={3}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Booking Request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
