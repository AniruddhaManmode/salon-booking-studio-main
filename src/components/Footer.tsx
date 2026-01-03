import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container mx-auto px-4 text-center">
        <img 
          src={logo} 
          alt="AS Salon" 
          className="h-16 w-auto mx-auto mb-4 opacity-90"
          style={{ filter: 'brightness(10) saturate(0)' }}
        />
        <p className="font-display text-lg mb-2">AS Unisex Salon</p>
        <p className="text-sm text-primary-foreground/70 mb-4">
          Where Beauty Meets Elegance
        </p>
        <div className="w-16 h-px bg-primary-foreground/20 mx-auto mb-4" />
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} AS Unisex Salon. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
