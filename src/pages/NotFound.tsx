import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero leaf-pattern flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-elegant text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="font-display text-2xl text-foreground mb-4">
          Oops! Page not found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back to our salon.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
