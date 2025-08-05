import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

const ItineraryView = () => {
  const [activeView, setActiveView] = useState("timeline");

  // Mock data
  const itinerary = {
    id: "1",
    title: "Summer Adventure in Japan",
    description: "A 10-day journey through Tokyo, Kyoto, and Osaka exploring culture, food, and nature",
    startDate: "2024-06-15",
    endDate: "2024-06-25",
    participants: [
      { id: "1", name: "Alex Chen", avatar: "", initials: "AC" },
      { id: "2", name: "Sarah Johnson", avatar: "", initials: "SJ" },
      { id: "3", name: "Mike Wilson", avatar: "", initials: "MW" }
    ],
    locations: [
      {
        id: "1",
        name: "Tokyo",
        date: "June 15-18",
        activities: [
          { id: "1", name: "Senso-ji Temple", time: "09:00", duration: "2 hours", type: "attraction" },
          { id: "2", name: "Tsukiji Outer Market", time: "11:30", duration: "1.5 hours", type: "food" },
          { id: "3", name: "Hotel Gracery Shinjuku", time: "15:00", duration: "Check-in", type: "accommodation" }
        ]
      },
      {
        id: "2",
        name: "Kyoto",
        date: "June 19-22",
        activities: [
          { id: "4", name: "Fushimi Inari Shrine", time: "08:00", duration: "3 hours", type: "attraction" },
          { id: "5", name: "Bamboo Forest", time: "14:00", duration: "2 hours", type: "nature" },
          { id: "6", name: "Traditional Ryokan", time: "18:00", duration: "Check-in", type: "accommodation" }
        ]
      }
    ]
  };

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
              <p className="text-lg opacity-90 mb-4">{itinerary.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {itinerary.startDate} - {itinerary.endDate}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {itinerary.participants.length} participants
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {itinerary.participants.map((participant) => (
                  <Avatar key={participant.id} className="border-2 border-white">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="bg-white text-primary">
                      {participant.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
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
            {itinerary.locations.map((location, locationIndex) => (
              <Card key={location.id} className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-travel-blue rounded-full flex items-center justify-center text-white font-bold">
                      {locationIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{location.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {location.date}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {location.activities.map((activity, activityIndex) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{activity.time}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
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
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">Love the Tokyo itinerary! Should we add more time at the temple?</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Sarah • 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>MW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">Agreed! Also found a great ramen place near the temple 🍜</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Mike • 1 hour ago</p>
                    </div>
                  </div>
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