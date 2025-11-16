import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Share2, 
  Plane, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">TripShare</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-background opacity-50 -z-10" />
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="outline" className="mb-4 border-primary/50">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            Collaborative Travel Planning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Plan Your Perfect Trip
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Together</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, share, and collaborate on travel itineraries with your friends and family. 
            Make every journey unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 shadow-primary">
                Start Planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 hover:bg-primary/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to plan together
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make collaborative travel planning seamless and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-primary transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-glow">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Locations</CardTitle>
                <CardDescription>
                  Search and add locations with integrated Google Places. Get automatic details, photos, and recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-primary transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4 shadow-glow">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Real-time Collaboration</CardTitle>
                <CardDescription>
                  Invite friends to edit, comment, and vote on activities. Everyone stays in sync instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-primary transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-4 shadow-glow">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Easy Sharing</CardTitle>
                <CardDescription>
                  Share itineraries with custom permissions. Generate beautiful previews for your trips.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple process, amazing results
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes and create your first itinerary
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                step: "1",
                title: "Create Itinerary",
                description: "Set your trip dates and destination"
              },
              {
                icon: MapPin,
                step: "2",
                title: "Add Places",
                description: "Search and add locations to visit"
              },
              {
                icon: Users,
                step: "3",
                title: "Invite Friends",
                description: "Share with travel companions"
              },
              {
                icon: Plane,
                step: "4",
                title: "Travel Together",
                description: "Use your itinerary on the go"
              }
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Benefits Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why travelers love TripShare
              </h2>
              <div className="space-y-4">
                {[
                  "Seamless collaboration with friends and family",
                  "Organized itineraries in one place",
                  "Real-time updates and notifications",
                  "Beautiful, shareable trip previews",
                  "Works on any device"
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-2 p-8">
              <div className="space-y-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Plane className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Ready to start planning?</p>
                  <p className="text-muted-foreground">
                    Join thousands of travelers who trust TripShare for their adventures
                  </p>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full" size="lg">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-24">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Start planning your next adventure
            </h2>
            <p className="text-lg text-muted-foreground">
              Create your first itinerary in minutes. No credit card required.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              <span className="font-bold">TripShare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TripShare. Built with love for travelers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
