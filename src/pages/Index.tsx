import { useState } from "react";
import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import InstagramReels from "@/components/InstagramReels";
import BookingForm from "@/components/BookingForm";
import FeedbackForm from "@/components/FeedbackForm";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleBookService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>AS Unisex Salon | Premium Beauty & Wellness Services in Ahilyanagar</title>
        <meta
          name="description"
          content="Experience premium salon services at AS Unisex Salon in Ahilyanagar. Hair spa, facial treatments, bridal makeup, and more. Book your appointment today!"
        />
        <meta
          name="keywords"
          content="salon, unisex salon, Ahilyanagar, hair spa, facial, bridal makeup, beauty salon, AS Unisex Salon"
        />
        <link rel="canonical" href="https://as-unisex-salon.com" />
      </Helmet>

      <main className="min-h-screen">
        <HeroSection />
        <ServicesSection onBookService={handleBookService} />
        <InstagramReels />
        <ContactSection onOpenFeedback={() => setIsFeedbackOpen(true)} />
        <Footer />
        
        <BookingForm
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedService={selectedService}
        />
        
        <FeedbackForm
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      </main>
    </>
  );
};

export default Index;
