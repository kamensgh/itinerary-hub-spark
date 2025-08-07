import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Calendar, Share2, Plane, Camera, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Hero Section */}
      <div className="bg-gradient-sunset text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Plane className="h-8 w-8" />
              <h1 className="text-4xl md:text-6xl font-bold">TripShare</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Create, collaborate, and share amazing travel itineraries with your friends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Planning Your Trip
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan Together, Travel Better</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing features that make collaborative travel planning effortless and fun
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-travel-blue rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Location Search</CardTitle>
              <CardDescription>
                Find and add locations with integrated Google Places search and automatic details
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-travel-orange rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Real-time Collaboration</CardTitle>
              <CardDescription>
                Invite friends to collaborate, comment, and vote on activities in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-travel-green rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Easy Sharing</CardTitle>
              <CardDescription>
                Share itineraries with custom permissions and generate beautiful trip previews
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Get started in just a few simple steps</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-travel-blue rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">1. Create Itinerary</h3>
            <p className="text-sm text-muted-foreground">Set your trip dates and basic information</p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-travel-orange rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">2. Add Locations</h3>
            <p className="text-sm text-muted-foreground">Search and add places, hotels, and activities</p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-travel-green rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">3. Invite Friends</h3>
            <p className="text-sm text-muted-foreground">Share with travel companions for input</p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-travel-purple rounded-full flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">4. Travel Together</h3>
            <p className="text-sm text-muted-foreground">Use your itinerary during the trip</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-ocean text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of travelers who plan better together</p>
          <Link to="/create">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Start Your First Itinerary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
