import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import ServiceCard from "./ServiceCard";
import hydraFacialImg from "@/assets/hydra-facial.png";
import hairSpaImg from "@/assets/hair-spa.png";
import manicurePedicureImg from "@/assets/manicure-pedicure.jpg";
import bridalMakeupImg from "@/assets/bridal-makeup.jpg";
import hairStylingImg from "@/assets/hair-styling.jpg";
import threadingImg from "@/assets/threading.jpg";
import waxingImg from "@/assets/waxing.jpg";
import mensHaircutImg from "@/assets/mens-haircut.jpg";

interface ServicesSectionProps {
  onBookService: (serviceName: string) => void;
}

interface Service {
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

// Fallback services for when Firebase is not available
const fallbackServices = [
  {
    title: "Hydra Facial",
    priceRange: "₹1,999 - ₹3,999",
    timeRequired: "60-90 min",
    image: hydraFacialImg,
    description: "Deep cleansing hydra facial treatment for glowing, rejuvenated skin with advanced technology.",
  },
  {
    title: "Hair Spa",
    priceRange: "₹1,000 - ₹2,500",
    timeRequired: "45-60 min",
    image: hairSpaImg,
    description: "Luxurious hair spa treatment to nourish, repair and strengthen your hair from root to tip.",
  },
  {
    title: "Bridal Makeup",
    priceRange: "₹15,000 - ₹35,000",
    timeRequired: "3-4 hours",
    image: bridalMakeupImg,
    description: "Complete bridal makeup package with HD finish for your special day. Look stunning!",
  },
  {
    title: "Hair Styling",
    priceRange: "₹500 - ₹1,500",
    timeRequired: "30-45 min",
    image: hairStylingImg,
    description: "Professional haircut and styling services by expert stylists for a trendy new look.",
  },
  {
    title: "Manicure & Pedicure",
    priceRange: "₹800 - ₹2,000",
    timeRequired: "60-75 min",
    image: manicurePedicureImg,
    description: "Relaxing manicure and pedicure with premium products for beautiful hands and feet.",
  },
  {
    title: "Threading & Shaping",
    priceRange: "₹150 - ₹500",
    timeRequired: "15-20 min",
    image: threadingImg,
    description: "Expert eyebrow threading and facial hair removal for a clean, defined look.",
  },
  {
    title: "Full Body Waxing",
    priceRange: "₹2,500 - ₹5,000",
    timeRequired: "90-120 min",
    image: waxingImg,
    description: "Gentle and effective full body waxing services for smooth, hair-free skin.",
  },
  {
    title: "Men's Haircut",
    priceRange: "₹300 - ₹800",
    timeRequired: "20-30 min",
    image: mensHaircutImg,
    description: "Stylish men's haircut with modern techniques. Includes wash and styling.",
  },
];

const ServicesSection = ({ onBookService }: ServicesSectionProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (servicesData.length > 0) {
          // Transform Firebase services to match ServiceCard format
          const transformedServices = servicesData.map((service: Service) => ({
            title: service.name,
            priceRange: `₹${service.priceRange.from} - ₹${service.priceRange.to}`,
            timeRequired: service.timeRequired,
            image: service.image || getServiceImage(service.name),
            description: service.description,
          }));
          setServices(transformedServices);
        } else {
          // Use fallback services if no services in Firebase
          setServices(fallbackServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Use fallback services on error
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helper function to get default image based on service name
  const getServiceImage = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes("facial") || name.includes("hydra")) return hydraFacialImg;
    if (name.includes("hair") && name.includes("spa")) return hairSpaImg;
    if (name.includes("bridal") || name.includes("makeup")) return bridalMakeupImg;
    if (name.includes("styling") || name.includes("cut")) return hairStylingImg;
    if (name.includes("manicure") || name.includes("pedicure")) return manicurePedicureImg;
    if (name.includes("threading")) return threadingImg;
    if (name.includes("wax")) return waxingImg;
    if (name.includes("men") || name.includes("male")) return mensHaircutImg;
    return hairSpaImg; // Default fallback
  };

  if (loading) {
    return (
      <section id="services" className="py-20 bg-secondary/30 leaf-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Loading Services...
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-secondary/30 leaf-pattern">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-medium tracking-wider uppercase text-sm mb-3">
            Our Premium Services
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Beauty & Wellness
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our range of premium salon services designed to enhance your natural beauty
            and provide a relaxing experience.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-6" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id || service.title}
              {...service}
              delay={index % 6}
              onBook={() => onBookService(service.title)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
