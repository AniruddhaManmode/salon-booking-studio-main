import { useState } from "react";
import { MessageSquare, Star, Send, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackForm = ({ isOpen, onClose }: FeedbackFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatYouLike: "",
    whatWeCanImprove: "",
    rating: 5
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.whatYouLike) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, phone number, and what you liked about our service.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      name: formData.name,
      phone: formData.phone,
      rating: formData.rating,
      whatYouLike: formData.whatYouLike,
      whatWeCanImprove: formData.whatWeCanImprove,
      timestamp: new Date().toISOString(),
    };

    try {
      // Send to Firebase Firestore
      const docRef = await addDoc(collection(db, "feedbacks"), {
        ...submitData,
        createdAt: serverTimestamp()
      });

      console.log("Feedback saved to Firebase with ID:", docRef.id);

      // Show success message
      setIsSuccess(true);
      setFormData({ name: "", phone: "", whatYouLike: "", whatWeCanImprove: "", rating: 5 });
      
      toast({
        title: "Thank You!",
        description: "Your feedback has been received. We appreciate your input!",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      // Fallback to localStorage if Firebase fails
      const existingFeedbacks = JSON.parse(localStorage.getItem('salonFeedbacks') || '[]');
      existingFeedbacks.push(submitData);
      localStorage.setItem('salonFeedbacks', JSON.stringify(existingFeedbacks));
      
      console.log("Feedback saved locally (Firebase failed):", submitData);
      
      setIsSuccess(true);
      setFormData({ name: "", phone: "", whatYouLike: "", whatWeCanImprove: "", rating: 5 });
      
      toast({
        title: "Thank You!",
        description: "Your feedback has been recorded. We appreciate your input!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: "", phone: "", whatYouLike: "", whatWeCanImprove: "", rating: 5 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card rounded-2xl shadow-elevated overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-primary-foreground">
            {isSuccess ? "Thank You!" : "Share Your Feedback"}
          </h3>
          <button
            onClick={handleClose}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success Message */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h4 className="font-display text-2xl text-foreground mb-3">
              Feedback Received!
            </h4>
            <p className="text-muted-foreground mb-6">
              Thank you for taking the time to share your experience. Your feedback helps us improve our services.
            </p>
            <button
              onClick={handleClose}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                How would you rate your experience?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="p-1 transition-colors hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center">
                <span className="text-sm text-muted-foreground">
                  Your rating: {formData.rating} out of 5
                </span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                required
              />
            </div>

            {/* What You Like */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What did you like about our service? *
              </label>
              <textarea
                name="whatYouLike"
                value={formData.whatYouLike}
                onChange={handleChange}
                placeholder="Tell us what you enjoyed about your experience..."
                rows={3}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                required
              />
            </div>

            {/* What We Can Improve */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What can we improve?
              </label>
              <textarea
                name="whatWeCanImprove"
                value={formData.whatWeCanImprove}
                onChange={handleChange}
                placeholder="Any suggestions for improvement are welcome..."
                rows={3}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
