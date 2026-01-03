import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDocs, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Search, Plus, CreditCard, MessageSquare, Calendar, DollarSign, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BillingItem {
  service: string;
  rate: number;
  quantity?: number;
  total: number;
}

interface BillingRecord {
  id: string;
  clientName: string;
  clientContact: string;
  staff: string;
  paymentMode: string;
  items: BillingItem[];
  totalAmount: number;
  date: string;
  createdAt: any;
  status: "pending" | "paid" | "completed";
}

const BillingSection = () => {
  const { toast } = useToast();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewBilling, setShowNewBilling] = useState(false);

  // New billing form state
  const [newBilling, setNewBilling] = useState({
    clientName: "",
    clientContact: "",
    staff: "",
    paymentMode: "",
    items: [{ service: "", rate: 0, quantity: 1, total: 0 }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff first
        const staffSnapshot = await getDocs(collection(db, "staff"));
        const staffData = staffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStaff(staffData);

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);

        // Fetch billing records with real-time updates
        const billingQuery = query(collection(db, "billing"), orderBy("createdAt", "desc"));
        const unsubscribeBilling = onSnapshot(billingQuery, (snapshot) => {
          const billingData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as BillingRecord));
          setBillingRecords(billingData);
        });

        // Fetch completed bookings with real-time updates
        const bookingsQuery = query(
          collection(db, "bookings"), 
          where("status", "==", "completed"),
          orderBy("completedAt", "desc")
        );
        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCompletedBookings(bookingsData);
        });

        setLoading(false);
        
        return () => {
          unsubscribeBilling();
          unsubscribeBookings();
        };
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separate effect to handle auto-creation of billing records
  useEffect(() => {
    if (completedBookings.length > 0 && billingRecords.length >= 0 && services.length > 0) {
      completedBookings.forEach(booking => {
        const existingBilling = billingRecords.find(
          record => record.clientContact === booking.phone && record.date === booking.date
        );
        
        if (!existingBilling) {
          createBillingFromCompletedBooking(booking);
        }
      });
    }
  }, [completedBookings, billingRecords, services]);

  const createBillingFromCompletedBooking = async (booking: any) => {
    try {
      // Create billing items from services
      const servicesList = booking.services || [booking.service];
      const billingItems = servicesList.map((serviceName: string) => {
        const service = services.find(s => s.name === serviceName);
        return {
          service: serviceName,
          rate: booking.amount || (service?.rate || 0),
          quantity: 1,
          total: booking.amount || (service?.rate || 0)
        };
      });

      // Create billing record
      const billingRecord = {
        clientName: booking.name,
        clientContact: booking.phone,
        staff: booking.completedBy || "Unknown",
        paymentMode: booking.paymentMode || "cash",
        items: billingItems,
        totalAmount: booking.amount || billingItems.reduce((sum: number, item: any) => sum + item.total, 0),
        date: booking.date,
        createdAt: new Date(),
        status: "completed" as const
      };

      await addDoc(collection(db, "billing"), billingRecord);
      
      toast({
        title: "Billing Record Created",
        description: `Automatic billing created for ${booking.name}`,
      });
    } catch (error) {
      console.error("Error creating billing from completed booking:", error);
    }
  };

  const calculateTotal = (items: BillingItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const updateBillingItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newBilling.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Update total if service or quantity changes
    if (field === "service" || field === "quantity" || field === "rate") {
      const service = services.find(s => s.name === value);
      if (service) {
        updatedItems[index].rate = service.rate;
        updatedItems[index].total = service.rate * (updatedItems[index].quantity || 1);
      } else if (field === "quantity" || field === "rate") {
        updatedItems[index].total = updatedItems[index].rate * updatedItems[index].quantity;
      }
    }
    
    setNewBilling({ ...newBilling, items: updatedItems });
  };

  const addBillingItem = () => {
    setNewBilling({
      ...newBilling,
      items: [...newBilling.items, { service: "", rate: 0, quantity: 1, total: 0 }]
    });
  };

  const removeBillingItem = (index: number) => {
    const updatedItems = newBilling.items.filter((_, i) => i !== index);
    setNewBilling({ ...newBilling, items: updatedItems });
  };

  const createBilling = async () => {
    try {
      const totalAmount = calculateTotal(newBilling.items);
      await addDoc(collection(db, "billing"), {
        ...newBilling,
        totalAmount,
        date: new Date().toISOString(),
        createdAt: new Date(),
        status: "pending"
      });
      
      // Reset form
      setNewBilling({
        clientName: "",
        clientContact: "",
        staff: "",
        paymentMode: "",
        items: [{ service: "", rate: 0, quantity: 1, total: 0 }]
      });
      setShowNewBilling(false);
    } catch (error) {
      console.error("Error creating billing:", error);
    }
  };

  const requestReview = (billingRecord: BillingRecord) => {
    const message = `Hi ${billingRecord.clientName}! Thank you for visiting our salon. We'd love to hear about your experience. Please leave us a review!`;
    const whatsappUrl = `https://wa.me/${billingRecord.clientContact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredRecords = billingRecords.filter(record =>
    record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.clientContact.includes(searchTerm) ||
    record.staff.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if a record was auto-generated from completed booking
  const isAutoGenerated = (record: BillingRecord) => {
    return completedBookings.some(booking => 
      booking.phone === record.clientContact && 
      booking.date === record.date &&
      booking.status === "completed"
    );
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
      {/* Header with Add Billing Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by client, contact, or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={showNewBilling} onOpenChange={setShowNewBilling}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Billing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Billing</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={newBilling.clientName}
                    onChange={(e) => setNewBilling({ ...newBilling, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client-contact">Client Contact</Label>
                  <Input
                    id="client-contact"
                    value={newBilling.clientContact}
                    onChange={(e) => setNewBilling({ ...newBilling, clientContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staff">Staff</Label>
                  <Select value={newBilling.staff} onValueChange={(value) => setNewBilling({ ...newBilling, staff: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-mode">Payment Mode</Label>
                  <Select value={newBilling.paymentMode} onValueChange={(value) => setNewBilling({ ...newBilling, paymentMode: value })}>
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

              {/* Services Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-medium">Services</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBillingItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newBilling.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <Select
                              value={item.service}
                              onValueChange={(value) => updateBillingItem(index, "service", value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.name}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateBillingItem(index, "rate", Number(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateBillingItem(index, "quantity", Number(e.target.value))}
                              className="w-20"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-2 font-medium">
                            ${item.total}
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBillingItem(index)}
                              disabled={newBilling.items.length === 1}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">Total: ${calculateTotal(newBilling.items)}</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button onClick={createBilling} className="w-full">
                Create Billing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Billing Records Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className={`hover:bg-gray-50 ${isAutoGenerated(record) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <p className="font-medium">{record.clientName}</p>
                          <p className="text-sm text-gray-500">{record.clientContact}</p>
                        </div>
                        {isAutoGenerated(record) && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {record.staff}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        {record.paymentMode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {record.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.service} {item.quantity > 1 && `(x${item.quantity})`}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      ${record.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestReview(record)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No billing records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSection;
