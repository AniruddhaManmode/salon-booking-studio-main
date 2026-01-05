import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, Mail, Calendar, Clock, CheckCircle, XCircle, Trash2, Search, Filter,
  Users, DollarSign, MessageSquare, Star, TrendingUp, Plus, Edit2, Eye,
  Package, CreditCard, AlertTriangle, BarChart3, PieChart, Activity, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Booking, Client, Staff, Service, Product, Review, Feedback } from "@/types";
import BillingSection from "./BillingSection";
import TodaysClients from "./TodaysClients";

// comment nahi karunga - yeh comment kaise likhna hai?
// ye comment hindi mein likha gaya hai

const AdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  
  // Sorting states for inquiries
  const [inquiriesSortBy, setInquiriesSortBy] = useState<"name" | "service" | "date" | "status">("date");
  const [inquiriesSortOrder, setInquiriesSortOrder] = useState<"asc" | "desc">("desc");
  const [websiteInquiriesSortBy, setWebsiteInquiriesSortBy] = useState<"name" | "service" | "date">("date");
  const [websiteInquiriesSortOrder, setWebsiteInquiriesSortOrder] = useState<"asc" | "desc">("desc");

  // Sorting and searching states for clients
  const [clientsSortBy, setClientsSortBy] = useState<"name" | "phone" | "visits" | "lastVisit">("name");
  const [clientsSortOrder, setClientsSortOrder] = useState<"asc" | "desc">("asc");
  const [historySortBy, setHistorySortBy] = useState<"date" | "service" | "amount" | "staff">("date");
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  // Form states
  const [newClient, setNewClient] = useState({ name: "", contact: "", allergies: "" });
  const [newStaff, setNewStaff] = useState({ name: "", contact: "" });
  const [newService, setNewService] = useState({ 
    name: "", 
    image: "", 
    priceRange: { from: 0, to: 0 }, 
    secretPrice: 0, 
    timeRequired: "", 
    description: "" 
  });
  const [newProduct, setNewProduct] = useState({ name: "", brand: "", quantity: 0, price: 0 });

  // Modal states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [clientHistorySize, setClientHistorySize] = useState<"small" | "large">("small");
  const [showMoreServices, setShowMoreServices] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState<any>(null);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Booking));
          setBookings(bookingsData);
        });

        // Fetch clients
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Client));
        setClients(clientsData);

        // Fetch staff with real-time updates
        const staffQuery = query(collection(db, "staff"), orderBy("createdAt", "desc"));
        const unsubscribeStaff = onSnapshot(staffQuery, (snapshot) => {
          const staffData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Staff));
          setStaff(staffData);
        });

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));
        setServices(servicesData);

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsData);

        // Fetch reviews
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        setReviews(reviewsData);

        // Fetch feedbacks
        const feedbacksSnapshot = await getDocs(collection(db, "feedbacks"));
        const feedbacksData = feedbacksSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          phone: doc.data().phone || '',
          rating: doc.data().rating || 0,
          whatYouLike: doc.data().whatYouLike || '',
          whatWeCanImprove: doc.data().whatWeCanImprove || '',
          timestamp: doc.data().timestamp || '',
          createdAt: doc.data().createdAt || null
        }));
        setFeedbacks(feedbacksData);

        setLoading(false);
        return () => {
          unsubscribeBookings();
          unsubscribeStaff();
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const stats = {
    services: services.length,
    inquiries: bookings.filter(b => b.status === "pending").length,
    feedbacks: feedbacks.length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    totalBookings: bookings.length,
    lowStockProducts: products.filter(p => p.quantity < 5).length
  };

  // Calculate Client Happiness Index
  const calculateHappinessIndex = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    return Math.round((averageRating / 5) * 100);
  };

  const happinessIndex = calculateHappinessIndex();

  // Add functions
  const addClient = async () => {
    try {
      await addDoc(collection(db, "clients"), {
        ...newClient,
        createdAt: new Date()
      });
      setNewClient({ name: "", contact: "", allergies: "" });
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const addStaff = async () => {
    try {
      await addDoc(collection(db, "staff"), {
        ...newStaff,
        createdAt: new Date()
      });
      setNewStaff({ name: "", contact: "" });
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const deleteStaff = async (staffId: string, staffName: string) => {
    try {
      await deleteDoc(doc(db, "staff", staffId));
      console.log("Staff member deleted successfully");
      toast({
        title: "Staff Member Removed",
        description: `${staffName} has been removed from the staff list.`,
      });
      // The onSnapshot listener will automatically update the staff list
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: "Failed to remove staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addService = async () => {
    try {
      await addDoc(collection(db, "services"), {
        ...newService,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewService({ 
        name: "", 
        image: "", 
        priceRange: { from: 0, to: 0 }, 
        secretPrice: 0, 
        timeRequired: "", 
        description: "" 
      });
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const updateService = async (serviceId: string, updatedService: Partial<Service>) => {
    try {
      await updateDoc(doc(db, "services", serviceId), {
        ...updatedService,
        updatedAt: new Date()
      });
      toast({
        title: "Service Updated",
        description: "Service has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteService = async (serviceId: string, serviceName: string) => {
    try {
      await deleteDoc(doc(db, "services", serviceId));
      toast({
        title: "Service Deleted",
        description: `${serviceName} has been removed from the services list.`,
      });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addProduct = async () => {
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        createdAt: new Date()
      });
      setNewProduct({ name: "", brand: "", quantity: 0, price: 0 });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Sorting functions for inquiries
  const handleInquiriesSort = (field: "name" | "service" | "date" | "status") => {
    if (inquiriesSortBy === field) {
      setInquiriesSortOrder(inquiriesSortOrder === "asc" ? "desc" : "asc");
    } else {
      setInquiriesSortBy(field);
      setInquiriesSortOrder("asc");
    }
  };

  const handleWebsiteInquiriesSort = (field: "name" | "service" | "date") => {
    if (websiteInquiriesSortBy === field) {
      setWebsiteInquiriesSortOrder(websiteInquiriesSortOrder === "asc" ? "desc" : "asc");
    } else {
      setWebsiteInquiriesSortBy(field);
      setWebsiteInquiriesSortOrder("asc");
    }
  };

  const getSortIcon = (field: string, currentSortBy: string, sortOrder: "asc" | "desc") => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUpDown className="h-4 w-4 text-blue-600" />
      : <ArrowUpDown className="h-4 w-4 text-blue-600 transform rotate-180" />;
  };

  const sortBookings = (bookingsToSort: Booking[], sortBy: string, sortOrder: "asc" | "desc") => {
    return bookingsToSort.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return sortOrder === "asc" 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        
        case "service":
          const serviceA = a.service.toLowerCase();
          const serviceB = b.service.toLowerCase();
          return sortOrder === "asc" 
            ? serviceA.localeCompare(serviceB) 
            : serviceB.localeCompare(serviceA);
        
        case "status":
          const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
          const orderA = statusOrder[a.status as keyof typeof statusOrder] || 999;
          const orderB = statusOrder[b.status as keyof typeof statusOrder] || 999;
          return sortOrder === "asc" ? orderA - orderB : orderB - orderA;
        
        case "date":
          const dateA = a.createdAt?.toDate?.() || new Date(a.timestamp);
          const dateB = b.createdAt?.toDate?.() || new Date(b.timestamp);
          return sortOrder === "asc" 
            ? dateA.getTime() - dateB.getTime() 
            : dateB.getTime() - dateA.getTime();
        
        default:
          return 0;
      }
    });
  };

  // Sorting functions for clients
  const handleClientsSort = (field: "name" | "phone" | "visits" | "lastVisit") => {
    if (clientsSortBy === field) {
      setClientsSortOrder(clientsSortOrder === "asc" ? "desc" : "asc");
    } else {
      setClientsSortBy(field);
      setClientsSortOrder("asc");
    }
  };

  const handleHistorySort = (field: "date" | "service" | "amount" | "staff") => {
    if (historySortBy === field) {
      setHistorySortOrder(historySortOrder === "asc" ? "desc" : "asc");
    } else {
      setHistorySortBy(field);
      setHistorySortOrder("desc");
    }
  };

  const sortClients = (clientsToSort: any[], sortBy: string, sortOrder: "asc" | "desc") => {
    return clientsToSort.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.primaryClient.name.toLowerCase();
          const nameB = b.primaryClient.name.toLowerCase();
          return sortOrder === "asc" 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        
        case "phone":
          const phoneA = a.primaryClient.contact;
          const phoneB = b.primaryClient.contact;
          return sortOrder === "asc" 
            ? phoneA.localeCompare(phoneB) 
            : phoneB.localeCompare(phoneA);
        
        case "visits":
          const visitsA = a.sortedHistory.length;
          const visitsB = b.sortedHistory.length;
          return sortOrder === "asc" ? visitsA - visitsB : visitsB - visitsA;
        
        case "lastVisit":
          const lastA = a.sortedHistory.length > 0 ? Math.max(...a.sortedHistory.map((s: any) => new Date(s.completedAt).getTime())) : 0;
          const lastB = b.sortedHistory.length > 0 ? Math.max(...b.sortedHistory.map((s: any) => new Date(s.completedAt).getTime())) : 0;
          return sortOrder === "asc" ? lastA - lastB : lastB - lastA;
        
        default:
          return 0;
      }
    });
  };

  const sortHistory = (historyToSort: any[], sortBy: string, sortOrder: "asc" | "desc") => {
    return historyToSort.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        
        case "service":
          const serviceA = a.services.join(" + ").toLowerCase();
          const serviceB = b.services.join(" + ").toLowerCase();
          return sortOrder === "asc" 
            ? serviceA.localeCompare(serviceB) 
            : serviceB.localeCompare(serviceA);
        
        case "amount":
          return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
        
        case "staff":
          const staffA = (a.staff || "").toLowerCase();
          const staffB = (b.staff || "").toLowerCase();
          return sortOrder === "asc" 
            ? staffA.localeCompare(staffB) 
            : staffB.localeCompare(staffA);
        
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="today">Today's Clients</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="clients">Clients History</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Services</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.services}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                      <MessageSquare className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Inquiries</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.inquiries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Feedbacks</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.feedbacks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Happiness Index */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Client Happiness Index</h3>
                    <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{happinessIndex}%</div>
                    <Progress value={happinessIndex} className="w-32 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Inquiries */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Inquiries</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInquiriesSort("name")}
                        className="flex items-center gap-1"
                      >
                        Name
                        {getSortIcon("name", inquiriesSortBy, inquiriesSortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInquiriesSort("service")}
                        className="flex items-center gap-1"
                      >
                        Service
                        {getSortIcon("service", inquiriesSortBy, inquiriesSortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInquiriesSort("date")}
                        className="flex items-center gap-1"
                      >
                        Date
                        {getSortIcon("date", inquiriesSortBy, inquiriesSortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInquiriesSort("status")}
                        className="flex items-center gap-1"
                      >
                        Status
                        {getSortIcon("status", inquiriesSortBy, inquiriesSortOrder)}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortBookings(bookings.slice(0, 5), inquiriesSortBy, inquiriesSortOrder).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-gray-500">{booking.service}</p>
                          <p className="text-xs text-gray-400">
                            {booking.createdAt?.toDate?.() ? 
                              new Date(booking.createdAt.toDate()).toLocaleDateString() : 
                              new Date(booking.timestamp).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <Badge variant={booking.status === "pending" ? "secondary" : "default"}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Client Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Client Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{review.clientName}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients History Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Clients History</h2>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientsSort("name")}
                className="flex items-center gap-1"
              >
                Name
                {getSortIcon("name", clientsSortBy, clientsSortOrder)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientsSort("phone")}
                className="flex items-center gap-1"
              >
                Phone
                {getSortIcon("phone", clientsSortBy, clientsSortOrder)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientsSort("visits")}
                className="flex items-center gap-1"
              >
                Visits
                {getSortIcon("visits", clientsSortBy, clientsSortOrder)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientsSort("lastVisit")}
                className="flex items-center gap-1"
              >
                Last Visit
                {getSortIcon("lastVisit", clientsSortBy, clientsSortOrder)}
              </Button>
            </div>

            {/* Client Rows */}
            <Card>
              <CardContent className="p-0">
                {(() => {
                  // Group clients by normalized phone number
                  const normalizePhone = (phone: string) => phone.replace(/\+91|\s|-/g, '').trim();
                  
                  const groupedClients = clients.reduce((groups, client) => {
                    const normalizedPhone = normalizePhone(client.contact);
                    if (!groups[normalizedPhone]) {
                      groups[normalizedPhone] = {
                        normalizedPhone,
                        clients: [],
                        allServiceHistory: [],
                        allAllergies: new Set()
                      };
                    }
                    groups[normalizedPhone].clients.push(client);
                    
                    // Combine all service histories
                    if (client.serviceHistory) {
                      groups[normalizedPhone].allServiceHistory.push(...client.serviceHistory);
                    }
                    
                    // Combine all allergies
                    if (client.allergies) {
                      groups[normalizedPhone].allAllergies.add(client.allergies);
                    }
                    
                    return groups;
                  }, {} as Record<string, {
                    normalizedPhone: string;
                    clients: typeof clients;
                    allServiceHistory: any[];
                    allAllergies: Set<string>;
                  }>);

                  // Filter and sort grouped clients
                  const filteredGroups = Object.values(groupedClients)
                    .filter(group => {
                      const normalizedSearchTerm = clientSearchTerm.replace(/\+91|\s|-/g, '').trim();
                      
                      return (
                        group.clients.some(client => 
                          client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
                        ) ||
                        group.normalizedPhone.includes(normalizedSearchTerm)
                      );
                    })
                    .map(group => {
                      // Use the most recent client's name as the display name
                      const primaryClient = group.clients.reduce((latest, client) => {
                        const latestDate = new Date(latest.updatedAt || latest.createdAt).getTime();
                        const clientDate = new Date(client.updatedAt || client.createdAt).getTime();
                        return clientDate > latestDate ? client : latest;
                      });

                      // Sort service history by date (newest first)
                      const sortedHistory = group.allServiceHistory
                        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

                      return {
                        ...group,
                        primaryClient,
                        sortedHistory
                      };
                    });

                  const sortedGroups = sortClients(filteredGroups, clientsSortBy, clientsSortOrder);

                  return sortedGroups.length > 0 ? (
                    <div className="divide-y">
                      {sortedGroups.map((group) => (
                        <div
                          key={group.normalizedPhone}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedClientForModal(group);
                            setShowClientDetailsModal(true);
                            setHistorySearchTerm("");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">{group.primaryClient.name}</h3>
                                  <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {group.primaryClient.contact}
                                  </p>
                                </div>
                                {group.clients.length > 1 && (
                                  <Badge variant="outline" className="text-blue-600">
                                    {group.clients.length} entries merged
                                  </Badge>
                                )}
                                {group.allAllergies.size > 0 && (
                                  <Badge variant="outline" className="text-yellow-600">
                                    Allergies: {Array.from(group.allAllergies).join(", ")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{group.sortedHistory.length} Visits</p>
                                <p className="text-xs text-gray-500">
                                  {group.sortedHistory.length > 0 
                                    ? `Last: ${new Date(group.sortedHistory[0].completedAt).toLocaleDateString()}`
                                    : "No visits"
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">
                                  ₹{group.sortedHistory.reduce((total, service) => total + service.amount, 0)}
                                </p>
                                <p className="text-xs text-gray-500">Total spent</p>
                              </div>
                              <ArrowUpDown className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        {clientSearchTerm ? "No clients found matching your search." : "No clients found. Complete some services to see client history here."}
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Client Details Modal */}
            <Dialog open={showClientDetailsModal} onOpenChange={setShowClientDetailsModal}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Details - {selectedClientForModal?.primaryClient?.name}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedClientForModal && (
                  <div className="space-y-6">
                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Name</p>
                        <p className="font-semibold">{selectedClientForModal.primaryClient.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="font-semibold">{selectedClientForModal.primaryClient.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Visits</p>
                        <p className="font-semibold">{selectedClientForModal.sortedHistory.length}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Spent</p>
                        <p className="font-semibold text-green-600">
                          ₹{selectedClientForModal.sortedHistory.reduce((total, service) => total + service.amount, 0)}
                        </p>
                      </div>
                      {selectedClientForModal.allAllergies.size > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-700">Allergies</p>
                          <p className="text-sm text-yellow-600">{Array.from(selectedClientForModal.allAllergies).join(", ")}</p>
                        </div>
                      )}
                    </div>

                    {/* Service History Search and Sort */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search services..."
                          value={historySearchTerm}
                          onChange={(e) => setHistorySearchTerm(e.target.value)}
                          className="w-48"
                        />
                      </div>
                    </div>

                    {/* History Sorting Controls */}
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistorySort("date")}
                        className="flex items-center gap-1"
                      >
                        Date
                        {getSortIcon("date", historySortBy, historySortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistorySort("service")}
                        className="flex items-center gap-1"
                      >
                        Service
                        {getSortIcon("service", historySortBy, historySortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistorySort("amount")}
                        className="flex items-center gap-1"
                      >
                        Amount
                        {getSortIcon("amount", historySortBy, historySortOrder)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistorySort("staff")}
                        className="flex items-center gap-1"
                      >
                        Staff
                        {getSortIcon("staff", historySortBy, historySortOrder)}
                      </Button>
                    </div>

                    {/* Service History Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(() => {
                            const filteredHistory = selectedClientForModal.sortedHistory.filter(service => 
                              service.services.some((s: string) => 
                                s.toLowerCase().includes(historySearchTerm.toLowerCase())
                              ) ||
                              (service.staff && service.staff.toLowerCase().includes(historySearchTerm.toLowerCase()))
                            );
                            
                            const sortedHistory = sortHistory(filteredHistory, historySortBy, historySortOrder);
                            
                            return sortedHistory.length > 0 ? (
                              sortedHistory.map((service, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(service.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {service.services.join(" + ")}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {service.staff || "N/A"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                    ₹{service.amount}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {service.paymentMode}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                  {historySearchTerm ? "No services found matching your search." : "No service history available."}
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="staff-name">Name</Label>
                      <Input
                        id="staff-name"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        placeholder="Enter staff member name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="staff-contact">Contact</Label>
                      <Input
                        id="staff-contact"
                        value={newStaff.contact}
                        onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <Button onClick={addStaff} className="w-full">Add Staff</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staff
                        .filter(member => 
                          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.contact.includes(searchTerm)
                        )
                        .map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{member.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{member.contact}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${member.name} from staff?`)) {
                                  deleteStaff(member.id, member.name);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {staff.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No staff members added yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Click "Add Staff" to add your first team member.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input
                        id="service-name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        placeholder="e.g., Hair Spa, Facial, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-image">Service Image URL</Label>
                      <Input
                        id="service-image"
                        value={newService.image}
                        onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price-from">Price From (₹)</Label>
                        <Input
                          id="price-from"
                          type="number"
                          value={newService.priceRange.from}
                          onChange={(e) => setNewService({ 
                            ...newService, 
                            priceRange: { ...newService.priceRange, from: Number(e.target.value) }
                          })}
                          placeholder="199"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price-to">Price To (₹)</Label>
                        <Input
                          id="price-to"
                          type="number"
                          value={newService.priceRange.to}
                          onChange={(e) => setNewService({ 
                            ...newService, 
                            priceRange: { ...newService.priceRange, to: Number(e.target.value) }
                          })}
                          placeholder="549"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secret-price">Secret Price (₹) - For Revenue Calculation</Label>
                      <Input
                        id="secret-price"
                        type="number"
                        value={newService.secretPrice}
                        onChange={(e) => setNewService({ ...newService, secretPrice: Number(e.target.value) })}
                        placeholder="Actual price for revenue (not shown to customers)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This price is used for revenue calculations but won't be displayed to customers
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="service-time">Time Required</Label>
                      <Input
                        id="service-time"
                        value={newService.timeRequired}
                        onChange={(e) => setNewService({ ...newService, timeRequired: e.target.value })}
                        placeholder="e.g., 30 mins, 1 hour, 2 hours"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-description">Description</Label>
                      <textarea
                        id="service-description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        placeholder="Describe the service in detail..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button onClick={addService} className="w-full">Add Service</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secret Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services
                        .filter(service => 
                          service.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {service.image && (
                                <img 
                                  src={service.image} 
                                  alt={service.name}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium">
                              ₹{service.priceRange.from} - ₹{service.priceRange.to}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-green-600 font-medium">
                              ₹{service.secretPrice}
                            </span>
                            <p className="text-xs text-gray-500">Hidden</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.timeRequired}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit Service</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="edit-service-name">Service Name</Label>
                                      <Input
                                        id="edit-service-name"
                                        defaultValue={service.name}
                                        placeholder="e.g., Hair Spa, Facial, etc."
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-service-image">Service Image URL</Label>
                                      <Input
                                        id="edit-service-image"
                                        defaultValue={service.image}
                                        placeholder="https://example.com/image.jpg"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="edit-price-from">Price From (₹)</Label>
                                        <Input
                                          id="edit-price-from"
                                          type="number"
                                          defaultValue={service.priceRange.from}
                                          placeholder="199"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-price-to">Price To (₹)</Label>
                                        <Input
                                          id="edit-price-to"
                                          type="number"
                                          defaultValue={service.priceRange.to}
                                          placeholder="549"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-secret-price">Secret Price (₹)</Label>
                                      <Input
                                        id="edit-secret-price"
                                        type="number"
                                        defaultValue={service.secretPrice}
                                        placeholder="Actual price for revenue"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-service-time">Time Required</Label>
                                      <Input
                                        id="edit-service-time"
                                        defaultValue={service.timeRequired}
                                        placeholder="e.g., 30 mins, 1 hour, 2 hours"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-service-description">Description</Label>
                                      <textarea
                                        id="edit-service-description"
                                        defaultValue={service.description}
                                        placeholder="Describe the service in detail..."
                                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <Button 
                                      onClick={() => {
                                        const updatedService = {
                                          name: (document.getElementById('edit-service-name') as HTMLInputElement)?.value || service.name,
                                          image: (document.getElementById('edit-service-image') as HTMLInputElement)?.value || service.image,
                                          priceRange: {
                                            from: Number((document.getElementById('edit-price-from') as HTMLInputElement)?.value) || service.priceRange.from,
                                            to: Number((document.getElementById('edit-price-to') as HTMLInputElement)?.value) || service.priceRange.to
                                          },
                                          secretPrice: Number((document.getElementById('edit-secret-price') as HTMLInputElement)?.value) || service.secretPrice,
                                          timeRequired: (document.getElementById('edit-service-time') as HTMLInputElement)?.value || service.timeRequired,
                                          description: (document.getElementById('edit-service-description') as HTMLTextAreaElement)?.value || service.description
                                        };
                                        updateService(service.id, updatedService);
                                      }}
                                      className="w-full"
                                    >
                                      Update Service
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteService(service.id, service.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {stats.lowStockProducts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">
                      {stats.lowStockProducts} products are low on stock (less than 5 items)
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-brand">Brand</Label>
                      <Input
                        id="product-brand"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-quantity">Quantity</Label>
                      <Input
                        id="product-quantity"
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      />
                    </div>
                    <Button onClick={addProduct} className="w-full">Add Product</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.brand}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={product.quantity < 5 ? "destructive" : "default"}>
                              {product.quantity}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today's Clients Tab */}
          <TabsContent value="today" className="space-y-6">
            <TodaysClients />
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Feedbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbacks.slice(0, 3).map((feedback) => (
                    <div key={feedback.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{feedback.name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{feedback.whatYouLike}</p>
                      {feedback.whatWeCanImprove && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-sm font-medium text-blue-800">Suggestion:</p>
                          <p className="text-sm text-gray-700">{feedback.whatWeCanImprove}</p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reels Posting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage Instagram reels and social media content</p>
                <Button className="mt-4">Manage Reels</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Client History Modal */}
      <Dialog open={showClientHistory} onOpenChange={setShowClientHistory}>
        <DialogContent className={clientHistorySize === "large" ? "max-w-6xl" : "max-w-2xl"}>
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Client History</DialogTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">View Size:</Label>
              <Select value={clientHistorySize} onValueChange={(value: "small" | "large") => setClientHistorySize(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          {selectedClient && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Customer Info</TabsTrigger>
                <TabsTrigger value="history">Service History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Name</Label>
                    <p className="font-medium text-lg">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Contact</Label>
                    <p className="font-medium text-lg">{selectedClient.contact}</p>
                  </div>
                  {selectedClient.allergies && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-500">Allergies</Label>
                      <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">{selectedClient.allergies}</p>
                    </div>
                  )}
                  {selectedClient.serviceHistory && selectedClient.serviceHistory.length > 0 && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-500">Total Visits</Label>
                      <p className="text-2xl font-bold text-blue-600">{selectedClient.serviceHistory.length}</p>
                    </div>
                  )}
                </div>

                {/* Recent Service Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-medium text-gray-700">Recent Service</Label>
                    {bookings.filter(b => b.name === selectedClient.name && b.status === "completed").length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowMoreServices(!showMoreServices)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {showMoreServices ? "Show Less" : "Show More"}
                      </Button>
                    )}
                  </div>
                  
                  {bookings
                    .filter(b => b.name === selectedClient.name && b.status === "completed")
                    .slice(0, showMoreServices ? undefined : 1)
                    .map((booking, index) => (
                      <div key={booking.id} className={`border rounded-lg p-4 mb-3 ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-lg">
                                {booking.services ? booking.services.join(" + ") : booking.service}
                              </p>
                              {index === 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Most Recent
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <Label className="text-xs">Date</Label>
                                <p>{booking.createdAt?.toDate()?.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Staff</Label>
                                <p>{booking.staff || "Not assigned"}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Amount</Label>
                                <p className="font-medium">₹{booking.amount || 0}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Status</Label>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  Completed
                                </Badge>
                              </div>
                            </div>
                            {booking.message && (
                              <div className="mt-2">
                                <Label className="text-xs">Message</Label>
                                <p className="text-sm text-gray-600 italic">"{booking.message}"</p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Button variant="outline" size="sm">View Bill</Button>
                            <Button variant="outline" size="sm">Book Again</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings
                        .filter(b => b.name === selectedClient.name && b.status === "completed")
                        .slice(0, clientHistorySize === "large" ? 20 : 5)
                        .map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {booking.createdAt?.toDate()?.toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div>
                                <p className="font-medium">{booking.services ? booking.services.join(" + ") : booking.service}</p>
                                {booking.message && (
                                  <p className="text-xs text-gray-500 mt-1">{booking.message}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {booking.staff || "Not assigned"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              ₹{booking.amount || 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">View Bill</Button>
                                <Button variant="outline" size="sm">Book Again</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {bookings.filter(b => b.name === selectedClient.name && b.status === "completed").length > (clientHistorySize === "large" ? 20 : 5) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Showing {clientHistorySize === "large" ? 20 : 5} of {bookings.filter(b => b.name === selectedClient.name && b.status === "completed").length} bookings
                      </p>
                      {clientHistorySize === "small" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setClientHistorySize("large")}
                          className="mt-2"
                        >
                          View All
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
