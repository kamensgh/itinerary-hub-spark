import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Share2, 
  MessageCircle, 
  Heart,
  Map,
  List,
  Settings,
  ArrowLeft,
  Camera,
  Star,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { Itinerary } from "@/hooks/useItineraries";

const ItineraryView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("timeline");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        
        // Fetch itinerary
        const { data: itineraryData, error: itineraryError } = await supabase
          .from('itineraries')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (itineraryError) {
          if (itineraryError.code === 'PGRST116') {
            toast({
              title: "Itinerary not found",
              description: "The requested itinerary doesn't exist or you don't have access to it.",
              variant: "destructive",
            });
            navigate('/dashboard');
            return;
          }
          throw itineraryError;
        }

        // Fetch participants
        const { data: participants, error: participantsError } = await supabase
          .from('itinerary_participants')
          .select('*')
          .eq('itinerary_id', id);

        if (participantsError) {
          console.error('Error fetching participants:', participantsError);
        }

        setItinerary({
          ...itineraryData,
          status: itineraryData.status as 'planning' | 'active' | 'completed',
          participants: participants || []
        });
      } catch (error) {
        console.error('Error fetching itinerary:', error);
        toast({
          title: "Error",
          description: "Failed to load itinerary",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="grid gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Itinerary not found</h1>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "attraction": return <Star className="h-4 w-4" />;
      case "food": return <Camera className="h-4 w-4" />;
      case "accommodation": return <MapPin className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "attraction": return "bg-travel-blue";
      case "food": return "bg-travel-orange";
      case "accommodation": return "bg-travel-green";
      case "nature": return "bg-travel-purple";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div className="bg-gradient-sunset text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{itinerary.title}</h1>
              <p className="text-lg opacity-90 mb-4">{itinerary.description || "No description provided"}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {itinerary.start_date && itinerary.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {itinerary.participants?.length || 0} participants
                </div>
                <Badge variant="outline" className="text-white border-white/50">
                  {itinerary.status}
                </Badge>
              </div>
            </div>

            {itinerary.participants && itinerary.participants.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {itinerary.participants.map((participant) => (
                    <Avatar key={participant.id} className="border-2 border-white">
                      <AvatarFallback className="bg-white text-primary">
                        {participant.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            {itinerary.locations && itinerary.locations.length > 0 ? (
              itinerary.locations.map((location, locationIndex) => (
                <Card key={locationIndex} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {locationIndex + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{location}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Destination
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Detailed activities coming soon</p>
                        <p className="text-sm mt-1">Add activities and timeline details to this location</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No locations added yet</h3>
                  <p className="text-muted-foreground">Start planning by adding destinations to your itinerary</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground">Map integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Discussion</CardTitle>
                <CardDescription>Collaborate with your travel companions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {itinerary.participants && itinerary.participants.length > 0 ? (
                    <>
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>{itinerary.participants[0].initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">Looking forward to this trip! 🎉</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{itinerary.participants[0].name} • Just now</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No participants yet</p>
                      <p className="text-sm mt-1">Invite travel companions to start collaborating</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button>Send</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ItineraryView;