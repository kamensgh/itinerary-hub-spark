import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

const ItineraryPreview = () => {
  const location = useLocation();
  const itineraryData = location.state || {};

  // Mock data for preview if no state is passed
  const mockData = {
    title: "Sample Itinerary",
    description: "A wonderful trip preview",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    locations: [
      { id: "1", name: "Central Park", address: "New York, NY" },
      { id: "2", name: "Times Square", address: "New York, NY" }
    ]
  };

  const data = Object.keys(itineraryData).length > 0 ? itineraryData : mockData;

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div className="bg-gradient-sunset text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/create">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Itinerary Preview</h1>
              <p className="text-lg opacity-90">Review your trip before finalizing</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Preview Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{data.title || "Untitled Trip"}</CardTitle>
              <CardDescription className="text-base">
                {data.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-travel-blue" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {data.startDate ? format(new Date(data.startDate), "PPP") : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-travel-blue" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {data.endDate ? format(new Date(data.endDate), "PPP") : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-travel-blue" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-muted-foreground">To be added</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinations */}
          <Card>
            <CardHeader>
              <CardTitle>Destinations</CardTitle>
              <CardDescription>
                {data.locations?.length > 0 
                  ? `${data.locations.length} destination${data.locations.length > 1 ? 's' : ''} planned`
                  : "No destinations added yet"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.locations?.length > 0 ? (
                <div className="space-y-4">
                  {data.locations.map((location: any, index: number) => (
                    <div key={location.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-travel-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{location.name || `Destination ${index + 1}`}</h3>
                        <p className="text-sm text-muted-foreground">{location.address || "Address not specified"}</p>
                      </div>
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No destinations added yet</p>
                  <Link to="/create">
                    <Button variant="outline" className="mt-4">
                      Add Destinations
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Link to="/create">
              <Button variant="outline">Edit Itinerary</Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button className="bg-travel-blue hover:bg-travel-blue/90">
                Create Itinerary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPreview;