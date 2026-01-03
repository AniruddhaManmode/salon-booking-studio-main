import { Instagram } from "lucide-react";
import thumb1 from "@/assets/thumb1.png";
import thumb2 from "@/assets/thumb2.png";
import thumb3 from "@/assets/thumb3.png";

const InstagramReels = () => {
  // Reels with individual Instagram links
  const reels = [
    { 
      id: 1, 
      thumbnail: thumb1, 
      title: "Bluetox", 
      link: "https://www.instagram.com/reel/DODN4TYia3X/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
    },
    { 
      id: 2, 
      thumbnail: thumb2, 
      title: "Hair Styling", 
      link: "https://www.instagram.com/reel/DO5YMP2CbDU/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
    },
    { 
      id: 3, 
      thumbnail: thumb3, 
      title: "Hair Spa", 
      link: "https://www.instagram.com/reel/DODN4TYia3X/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
    },
    
  ];

  //Duplicate for seamless loop
  const allReels = [...reels, ...reels];

  return (
    <section className="py-16 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-accent font-medium tracking-wider uppercase text-sm mb-3">
            <Instagram className="w-4 h-4" />
            Follow Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Our Latest Work
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
        </div>
      </div>

      {/* Scrolling Reels */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee">
          {allReels.map((reel, index) => (
            <a
              key={`${reel.id}-${index}`}
              href={reel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 relative group cursor-pointer"
            >
              <div className="w-40 h-56 md:w-48 md:h-72 rounded-2xl overflow-hidden shadow-card">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                
                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-primary-foreground/90 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Instagram Icon */}
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-primary-foreground/80 rounded-full flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-primary-foreground text-sm font-medium truncate">{reel.title}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <a
          href="https://instagram.com/assalon"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
        >
          <Instagram className="w-5 h-5" />
          Follow @assalon on Instagram
        </a>
      </div>
    </section>
  );
};

export default InstagramReels;