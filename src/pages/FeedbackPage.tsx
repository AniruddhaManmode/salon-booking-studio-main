import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

interface WebsiteFeedbackData {
  isHappy: boolean;
  rating: number;
  compliment: string;
  suggestions: string;
  clientName?: string;
  clientContact?: string;
  serviceName?: string;
}

const FeedbackPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<WebsiteFeedbackData>({
    isHappy: false,
    rating: 0,
    compliment: "",
    suggestions: "",
    clientName: "",
    clientContact: "",
    serviceName: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Parse URL parameters and auto-fill form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const contact = urlParams.get('contact');
    const service = urlParams.get('service');

    if (name || contact || service) {
      setFormData(prev => ({
        ...prev,
        clientName: name || prev.clientName,
        clientContact: contact || prev.clientContact,
        serviceName: service || prev.serviceName
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.isHappy && formData.rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating even if you're not happy with the service.",
        variant: "destructive",
      });
      return;
    }

    if (formData.isHappy && formData.rating === 0) {
      toast({
        title: "Error", 
        description: "Please provide a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "websiteFeedbacks"), {
        ...formData,
        createdAt: Timestamp.now(),
        date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form
      setFormData({
        isHappy: false,
        rating: 0,
        compliment: "",
        suggestions: "",
        clientName: "",
        clientContact: "",
        serviceName: ""
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setFormData({ ...formData, rating: star })}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredStar || formData.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Share Your Feedback</CardTitle>
            <CardDescription>
              Your feedback helps us improve our services
            </CardDescription>
            {(formData.clientName || formData.clientContact || formData.serviceName) && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✨ We've pre-filled some information for you!
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Your Name (Optional)</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientContact">Contact (Optional)</Label>
                  <Input
                    id="clientContact"
                    type="text"
                    value={formData.clientContact}
                    onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serviceName">Service Received (Optional)</Label>
                <Input
                  id="serviceName"
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="Which service did you receive?"
                />
              </div>

              {/* Happy with Service */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Are you happy with our service?</Label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={formData.isHappy ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, isHappy: true })}
                    className="flex items-center space-x-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Yes</span>
                  </Button>
                  <Button
                    type="button"
                    variant={!formData.isHappy ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, isHappy: false })}
                    className="flex items-center space-x-2"
                  >
                    <ThumbsUp className="h-4 w-4 rotate-180" />
                    <span>No</span>
                  </Button>
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Rate our service</Label>
                {renderStars()}
              </div>

              {/* Compliment - Only show if happy */}
              {formData.isHappy && (
                <div>
                  <Label htmlFor="compliment">What did you like about our service?</Label>
                  <Textarea
                    id="compliment"
                    value={formData.compliment}
                    onChange={(e) => setFormData({ ...formData, compliment: e.target.value })}
                    placeholder="Share your positive experience..."
                    rows={3}
                  />
                </div>
              )}

              {/* Suggestions */}
              <div>
                <Label htmlFor="suggestions">Any suggestions for our services? (Optional)</Label>
                <Textarea
                  id="suggestions"
                  value={formData.suggestions}
                  onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                  placeholder="How can we improve our services?"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;
