import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDocs, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Download, FileText, Search, Plus, MessageSquare, Calendar, Phone, Mail, MapPin, CreditCard, CheckCircle, User } from "lucide-react";
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
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewBilling, setShowNewBilling] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

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
        const unsubscribeBilling = onSnapshot(collection(db, "billing"), (snapshot) => {
          const billingData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBillingRecords(billingData as BillingRecord[]);
        });

        const unsubscribeStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
          const staffData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setStaff(staffData);
        });

        const unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
          const servicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setServices(servicesData);
        });

        const unsubscribeClients = onSnapshot(collection(db, "clients"), (snapshot) => {
          const clientsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setClients(clientsData);
        });

        const unsubscribeBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          const completed = bookingsData.filter((booking: any) => booking.status === "completed");
          setCompletedBookings(completed);
        });

        setLoading(false);

        return () => {
          unsubscribeBilling();
          unsubscribeStaff();
          unsubscribeServices();
          unsubscribeClients();
          unsubscribeBookings();
        };
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-creation of billing records from completed bookings has been removed
  // useEffect(() => {
  //   if (completedBookings.length > 0 && billingRecords.length >= 0 && services.length > 0) {
  //     completedBookings.forEach(booking => {
  //       const existingBilling = billingRecords.find(
  //         record => record.clientContact === booking.phone && record.date === booking.date
  //       );
  //       
  //       if (!existingBilling) {
  //         createBillingFromCompletedBooking(booking);
  //       }
  //     });
  //   }
  // }, [completedBookings, billingRecords, services]);

  const calculateTotal = (items: BillingItem[]) => {
    return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  // Client search and selection functions
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone?.includes(clientSearchTerm)
  );

  const selectClient = (client: any) => {
    setSelectedClient(client);
    setNewBilling(prev => ({
      ...prev,
      clientName: client.name,
      clientContact: client.phone
    }));
    setClientSearchTerm("");
    setShowClientDropdown(false);
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
    setNewBilling(prev => ({
      ...prev,
      clientName: "",
      clientContact: ""
    }));
    setClientSearchTerm("");
  };

  const saveNewClient = async () => {
    if (newBilling.clientName && newBilling.clientContact) {
      try {
        await addDoc(collection(db, "clients"), {
          name: newBilling.clientName.trim(),
          phone: newBilling.clientContact.trim(),
          createdAt: new Date()
        });
        toast({
          title: "Client Saved",
          description: "New client has been added to the database.",
        });
      } catch (error) {
        console.error("Error saving client:", error);
      }
    }
  };

  const updateBillingItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newBilling.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Update total if service or quantity changes
    if (field === "service" || field === "quantity" || field === "rate") {
      const service = services.find(s => s.name === value);
      if (service) {
        updatedItems[index].rate = service.secretPrice || 0;
        updatedItems[index].total = (service.secretPrice || 0) * (updatedItems[index].quantity || 1);
      } else if (field === "quantity" || field === "rate") {
        updatedItems[index].total = (updatedItems[index].rate || 0) * (updatedItems[index].quantity || 1);
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
    if (!newBilling.clientName || !newBilling.clientContact || !newBilling.staff || !newBilling.paymentMode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const hasValidItems = newBilling.items.some(item => item.service && item.rate > 0);
    if (!hasValidItems) {
      toast({
        title: "Error",
        description: "Please add at least one valid service.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save new client if not exists
      if (!selectedClient && newBilling.clientName && newBilling.clientContact) {
        await saveNewClient();
      }
      
      const totalAmount = calculateTotal(newBilling.items);
      
      // Validate data structure before sending
      const billingData = {
        clientName: newBilling.clientName.trim(),
        clientContact: newBilling.clientContact.trim(),
        staff: newBilling.staff.trim(),
        paymentMode: newBilling.paymentMode.trim(),
        items: newBilling.items.filter(item => item.service && item.rate > 0),
        totalAmount,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        createdAt: new Date(),
        status: "pending" as const
      };

      console.log("Sending billing data:", billingData);
      
      const docRef = await addDoc(collection(db, "billing"), billingData);
      console.log("Billing created with ID:", docRef.id);
      
      // Reset form
      setNewBilling({
        clientName: "",
        clientContact: "",
        staff: "",
        paymentMode: "",
        items: [{ service: "", rate: 0, quantity: 1, total: 0 }]
      });
      setSelectedClient(null);
      setClientSearchTerm("");
      setShowNewBilling(false);
      
      toast({
        title: "Billing Created",
        description: `Billing record created for ${billingData.clientName}.`,
      });
    } catch (error) {
      console.error("Error creating billing:", error);
      
      let errorMessage = "Failed to create billing. Please try again.";
      
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Check Firebase rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === "invalid-argument") {
        errorMessage = "Invalid data format. Please check your inputs.";
      } else if (error.message) {
        errorMessage = `Failed to create billing: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const generatePDFBill = async (billingRecord: BillingRecord) => {
    try {
      console.log("Starting PDF generation for:", billingRecord);
      
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      
      if (!jsPDF) {
        throw new Error("Failed to load jsPDF library");
      }
      
      const doc = new jsPDF();
      
      // Set font sizes
      const titleSize = 20;
      const headerSize = 14;
      const normalSize = 12;
      
      // Add salon header
      doc.setFontSize(titleSize);
      doc.setFont("helvetica", "bold");
      doc.text("SALON BOOKING STUDIO", 105, 20, { align: "center" });
      
      // Add bill details
      doc.setFontSize(headerSize);
      doc.setFont("helvetica", "normal");
      doc.text(`Bill # ${billingRecord.id.slice(-6)}`, 20, 40);
      doc.text(`Date: ${new Date(billingRecord.date).toLocaleDateString()}`, 20, 50);
      doc.text(`Payment Mode: ${billingRecord.paymentMode.toUpperCase()}`, 20, 60);
      
      // Customer details
      doc.setFontSize(headerSize);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Details:", 20, 80);
      
      doc.setFontSize(normalSize);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${billingRecord.clientName}`, 20, 90);
      doc.text(`Contact: ${billingRecord.clientContact}`, 20, 100);
      doc.text(`Staff: ${billingRecord.staff}`, 20, 110);
      
      // Services table
      doc.setFontSize(headerSize);
      doc.setFont("helvetica", "bold");
      doc.text("Services:", 20, 130);
      
      let yPosition = 140;
      doc.setFontSize(normalSize);
      doc.setFont("helvetica", "normal");
      
      billingRecord.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.service}`, 20, yPosition);
        doc.text(`Rate: ₹${item.rate}`, 20, yPosition + 7);
        doc.text(`Quantity: ${item.quantity}`, 20, yPosition + 14);
        doc.text(`Total: ₹${item.total}`, 20, yPosition + 21);
        yPosition += 30;
      });
      
      // Total amount
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, yPosition, 170, 30);
      
      doc.setFontSize(headerSize);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount: ₹${billingRecord.totalAmount}`, 25, yPosition + 20);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for your visit!", 105, 280, { align: "center" });
      doc.text("Please share your feedback: " + `${window.location.origin}/feedback`, 105, 285, { align: "center" });
      
      // Generate PDF blob
      const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
      console.log("PDF generated successfully, blob size:", pdfBlob.size);
      
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  const requestReview = async (billingRecord: BillingRecord) => {
    try {
      // Generate PDF bill
      const pdfBlob = await generatePDFBill(billingRecord);
      const pdfDataUrl = URL.createObjectURL(pdfBlob);
      
      // Create feedback link with customer info
      const feedbackLink = `${window.location.origin}/feedback?name=${encodeURIComponent(billingRecord.clientName)}&contact=${encodeURIComponent(billingRecord.clientContact)}&service=${encodeURIComponent(billingRecord.items.map(item => item.service).join(', '))}`;
      
      // Create message with feedback link
      const message = `Hi ${billingRecord.clientName}! Thank you for visiting our salon. We'd love to hear about your experience. Please leave us a review here: ${feedbackLink}`;
      
      const whatsappUrl = `https://wa.me/${billingRecord.clientContact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Also open PDF in new tab for manual download/send
      window.open(pdfDataUrl, '_blank');
      
      toast({
        title: "Review Requested",
        description: "WhatsApp opened with feedback link. PDF also opened in new tab.",
      });
    } catch (error) {
      console.error("Error requesting review:", error);
      toast({
        title: "Error",
        description: "Failed to send review request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRecords = billingRecords.filter(record =>
    record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.clientContact.includes(searchTerm) ||
    record.staff.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <div className="relative">
                  <Label htmlFor="client-search">Search Client</Label>
                  <div className="relative">
                    <Input
                      id="client-search"
                      placeholder="Search by name or phone..."
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                    />
                    {selectedClient && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={clearClientSelection}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  
                  {/* Client Dropdown */}
                  {showClientDropdown && clientSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => selectClient(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No clients found. Enter details manually below.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    placeholder="Client name"
                    value={newBilling.clientName}
                    onChange={(e) => {
                      setNewBilling({ ...newBilling, clientName: e.target.value });
                      setSelectedClient(null); // Clear selection if manually edited
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-contact">Contact</Label>
                  <Input
                    id="client-contact"
                    placeholder="Phone number"
                    value={newBilling.clientContact}
                    onChange={(e) => {
                      setNewBilling({ ...newBilling, clientContact: e.target.value });
                      setSelectedClient(null); // Clear selection if manually edited
                    }}
                  />
                </div>
              </div>

              {/* Selected Client Info */}
              {selectedClient && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Selected: {selectedClient.name} ({selectedClient.phone})
                  </p>
                </div>
              )}

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
                            ₹{item.total}
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
                  <p className="text-lg font-semibold">Total: ₹{calculateTotal(newBilling.items)}</p>
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
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <p className="font-medium">{record.clientName}</p>
                          <p className="text-sm text-gray-500">{record.clientContact}</p>
                        </div>
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
                      ₹{record.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDFBill(record)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF Bill
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestReview(record)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Review
                        </Button>
                      </div>
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
