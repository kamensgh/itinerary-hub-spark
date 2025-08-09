import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Share2, 
  Search,
  Filter,
  MoreHorizontal,
  Plane,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-8 w-8 animate-pulse mx-auto mb-4 text-travel-blue" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Mock data
  const itineraries = [
    {
      id: "1",
      title: "Summer Adventure in Japan",
      description: "10-day journey through Tokyo, Kyoto, and Osaka",
      status: "active",
      startDate: "2024-06-15",
      endDate: "2024-06-25",
      participants: [
        { id: "1", initials: "AC" },
        { id: "2", initials: "SJ" },
        { id: "3", initials: "MW" }
      ],
      locations: ["Tokyo", "Kyoto", "Osaka"],
      image: "gradient-sunset"
    },
    {
      id: "2",
      title: "European Road Trip",
      description: "2-week adventure across 5 countries",
      status: "planning",
      startDate: "2024-08-01",
      endDate: "2024-08-15",
      participants: [
        { id: "1", initials: "AC" },
        { id: "4", initials: "LR" }
      ],
      locations: ["Paris", "Amsterdam", "Berlin", "Prague", "Vienna"],
      image: "gradient-ocean"
    },
    {
      id: "3",
      title: "Weekend in NYC",
      description: "Quick city break with college friends",
      status: "completed",
      startDate: "2024-03-22",
      endDate: "2024-03-24",
      participants: [
        { id: "1", initials: "AC" },
        { id: "5", initials: "JD" },
        { id: "6", initials: "KL" },
        { id: "7", initials: "RP" }
      ],
      locations: ["Manhattan", "Brooklyn"],
      image: "gradient-sky"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-travel-green";
      case "planning": return "bg-travel-orange";
      case "completed": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "In Progress";
      case "planning": return "Planning";
      case "completed": return "Completed";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div className="bg-gradient-sunset text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">My Itineraries</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/create">
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut} className="text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <p className="text-lg opacity-90">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Plan your next adventure or continue working on existing trips.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search your trips..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-blue rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-muted-foreground">Active Trip</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-orange rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-muted-foreground">In Planning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-green rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-xs text-muted-foreground">Collaborators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-purple rounded-lg flex items-center justify-center mr-3">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Shared Links</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="border-2 hover:shadow-lg transition-all cursor-pointer group">
              <div className={`h-32 bg-${itinerary.image} rounded-t-lg relative`}>
                <div className="absolute top-4 left-4">
                  <Badge className={`${getStatusColor(itinerary.status)} text-white`}>
                    {getStatusText(itinerary.status)}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{itinerary.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {itinerary.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{itinerary.startDate} - {itinerary.endDate}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{itinerary.locations.slice(0, 2).join(", ")}
                    {itinerary.locations.length > 2 && ` +${itinerary.locations.length - 2} more`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {itinerary.participants.slice(0, 3).map((participant, index) => (
                      <Avatar key={participant.id} className="border-2 border-white w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {participant.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {itinerary.participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{itinerary.participants.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Link to="/itinerary/view">
                      <Button size="sm" className="bg-travel-blue hover:bg-travel-blue/90">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          <Link to="/create">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create New Trip</h3>
                <p className="text-sm text-muted-foreground">
                  Start planning your next adventure
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;