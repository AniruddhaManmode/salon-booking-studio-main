import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  priceRange?: string;
  price?: string;
  timeRequired?: string;
  image: string;
  description: string;
  onBook: () => void;
  delay?: number;
}

const ServiceCard = ({ title, priceRange, price, timeRequired, image, description, onBook, delay = 0 }: ServiceCardProps) => {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 opacity-0 animate-fade-in-up hover:-translate-y-2",
        delay === 1 && "animation-delay-100",
        delay === 2 && "animation-delay-200",
        delay === 3 && "animation-delay-300",
        delay === 4 && "animation-delay-400",
        delay === 5 && "animation-delay-500",
        delay === 6 && "animation-delay-600"
      )}
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        
        {/* Decorative overlay on hover */}
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 pt-5">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-xl text-foreground group-hover:text-accent transition-colors leading-tight">
            {title}
          </h3>
          <div className="flex-shrink-0 bg-accent/15 text-accent px-3 py-1 rounded-full">
            <span className="font-display text-base font-semibold whitespace-nowrap">
              {priceRange || `₹${price}`}
            </span>
          </div>
        </div>

        {/* Time Required */}
        {timeRequired && (
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-muted-foreground">{timeRequired}</span>
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Book Button */}
        <button
          onClick={onBook}
          className="w-full relative overflow-hidden bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-3 rounded-xl font-medium transition-all duration-300 group/btn border border-primary/20 hover:border-transparent"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Book Appointment
            <svg
              className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-accent/20 transform rotate-45 translate-x-14 -translate-y-14" />
      </div>
    </div>
  );
};

export default ServiceCard;
