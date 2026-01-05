// Shared types for the salon booking system

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service?: string; // Legacy field for backward compatibility
  services?: string[]; // New field for multiple services
  message: string;
  timestamp: string;
  createdAt: any;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  date?: string;
  time?: string;
  allergies?: string;
  completedBy?: string;
  staff?: string; // Staff member who handled the booking
  amount?: number;
  paymentMode?: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  allergies?: string;
  serviceHistory?: Array<{
    date: string;
    services: string[];
    staff: string;
    amount: number;
    paymentMode: string;
    completedAt: string;
  }>;
  createdAt: any;
  updatedAt: any;
}

export interface Staff {
  id: string;
  name: string;
  contact: string;
  balance?: number;
  createdAt: any;
}

export interface Service {
  id: string;
  name: string;
  image: string;
  priceRange: {
    from: number;
    to: number;
  };
  secretPrice: number;
  timeRequired: string;
  description: string;
  createdAt: any;
  updatedAt: any;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  createdAt: any;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Feedback {
  id: string;
  name: string;
  phone: string;
  rating: number;
  whatYouLike: string;
  whatWeCanImprove: string;
  timestamp: string;
  createdAt: any;
}
