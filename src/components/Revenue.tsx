import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { 
  DollarSign, TrendingUp, Calendar, Users, BarChart3, PieChart, 
  CreditCard, Target, Activity, ArrowUp, ArrowDown, Filter, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Booking, Service } from "@/types";

interface RevenueStats {
  totalRevenue: number;
  completedBookings: number;
  averageRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  topService: string;
  topServiceRevenue: number;
}

const Revenue = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    completedBookings: 0,
    averageRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    topService: "",
    topServiceRevenue: 0
  });

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

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));
        setServices(servicesData);

        setLoading(false);
        return () => unsubscribeBookings();
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    calculateRevenueStats();
  }, [bookings, services, timeRange]);

  const calculateRevenueStats = () => {
    const completedBookings = bookings.filter(b => b.status === "completed");
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      // Use secret price from service if available, otherwise use amount
      const service = services.find(s => s.name === booking.service);
      const price = service?.secretPrice || booking.amount || 0;
      return sum + price;
    }, 0);

    const averageRevenue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

    // Calculate time-based revenue
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyRevenue = completedBookings
      .filter(b => {
        const bookingDate = b.createdAt?.toDate?.() || new Date(b.timestamp);
        return bookingDate >= today;
      })
      .reduce((sum, booking) => {
        const service = services.find(s => s.name === booking.service);
        const price = service?.secretPrice || booking.amount || 0;
        return sum + price;
      }, 0);

    const weeklyRevenue = completedBookings
      .filter(b => {
        const bookingDate = b.createdAt?.toDate?.() || new Date(b.timestamp);
        return bookingDate >= weekAgo;
      })
      .reduce((sum, booking) => {
        const service = services.find(s => s.name === booking.service);
        const price = service?.secretPrice || booking.amount || 0;
        return sum + price;
      }, 0);

    const monthlyRevenue = completedBookings
      .filter(b => {
        const bookingDate = b.createdAt?.toDate?.() || new Date(b.timestamp);
        return bookingDate >= monthAgo;
      })
      .reduce((sum, booking) => {
        const service = services.find(s => s.name === booking.service);
        const price = service?.secretPrice || booking.amount || 0;
        return sum + price;
      }, 0);

    // Find top service
    const serviceRevenue = services.map(service => {
      const serviceBookings = completedBookings.filter(b => b.service === service.name);
      const revenue = serviceBookings.reduce((sum, booking) => sum + service.secretPrice, 0);
      return { name: service.name, revenue, count: serviceBookings.length };
    });

    const topService = serviceRevenue.reduce((top, current) => 
      current.revenue > top.revenue ? current : top, 
      { name: "", revenue: 0, count: 0 }
    );

    setRevenueStats({
      totalRevenue,
      completedBookings: completedBookings.length,
      averageRevenue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      topService: topService.name,
      topServiceRevenue: topService.revenue
    });
  };

  const getFilteredBookings = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return bookings.filter(booking => {
      const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.timestamp);
      return bookingDate >= startDate && booking.status === "completed";
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
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
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{revenueStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{revenueStats.completedBookings}</p>
                  <p className="text-xs text-gray-500 mt-1">Total services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{revenueStats.averageRevenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per booking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Service</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">{revenueStats.topService || "N/A"}</p>
                  <p className="text-xs text-gray-500 mt-1">₹{revenueStats.topServiceRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-based Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Daily Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{revenueStats.dailyRevenue.toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Weekly Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{revenueStats.weeklyRevenue.toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{revenueStats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredBookings().slice(0, 10).map((booking) => {
                  const service = services.find(s => s.name === booking.service);
                  const price = service?.secretPrice || booking.amount || 0;
                  return (
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
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{price.toLocaleString()}</p>
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Service Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const serviceBookings = bookings.filter(b => b.service === service.name && b.status === "completed");
                  const revenue = serviceBookings.reduce((sum, booking) => sum + service.secretPrice, 0);
                  const percentage = revenueStats.totalRevenue > 0 ? (revenue / revenueStats.totalRevenue) * 100 : 0;
                  
                  return (
                    <div key={service.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">{serviceBookings.length} bookings</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-green-600">₹{revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
