import { Phone, MapPin, Clock, Instagram, Facebook, MessageSquare } from "lucide-react";

interface ContactSectionProps {
  onOpenFeedback?: () => void;
}

const ContactSection = ({ onOpenFeedback }: ContactSectionProps) => {
  return (
    <section className="py-20 bg-background">
      {/* Visit Our Salon Header - matching hero background */}
      <div className="bg-gradient-hero py-16 mb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <span className="inline-block text-accent font-medium tracking-wider uppercase text-sm mb-3">
              Get In Touch
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Visit Our Salon
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Google Map */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="rounded-2xl overflow-hidden shadow-elevated">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d757.1653065004423!2d74.73366776644622!3d19.129355612396886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcb1000acd668d%3A0xf8552702bdfec4e2!2sAS%20unisex%20salon!5e1!3m2!1sen!2sin!4v1766761527490!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AS Unisex Salon Location"
              className="w-full"
            />
          </div>
          
          {/* Address below map */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-start gap-3 bg-card rounded-2xl px-6 py-4 shadow-card">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-sm md:text-base leading-relaxed text-left">
                Shop No.7, Krushna Anand Complex, Near Tuljabhawani Temple,
                <br />
                Pipeline Road Sawedi, Ahilyanagar 414003
              </p>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Phone */}
          <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-3">Call Us</h3>
            <a
              href="tel:+918287323232"
              className="block text-muted-foreground hover:text-accent transition-colors mb-1"
            >
              +91 8287323232
            </a>
            <a
              href="tel:+917756841757"
              className="block text-muted-foreground hover:text-accent transition-colors"
            >
              +91 7756841757
            </a>
          </div>

          {/* Hours */}
          <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-3">Working Hours</h3>
            <p className="text-muted-foreground text-sm">
              Monday - Saturday
              <br />
              10:00 AM - 8:00 PM
              <br />
              <span className="text-accent font-medium">Sunday: By Appointment</span>
            </p>
          </div>

          {/* Feedback */}
          <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-3">Share Feedback</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Help us improve your experience
            </p>
            <button
              onClick={onOpenFeedback}
              className="text-accent hover:text-accent/80 font-medium text-sm transition-colors"
            >
              Give Feedback →
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm mb-4">Follow Us</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-110"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-110"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
