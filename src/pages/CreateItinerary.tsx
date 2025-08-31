import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Plus, Search, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useItineraries } from "@/hooks/useItineraries";
import { toast } from "sonner";

const CreateItinerary = () => {
  const location = useLocation();
  const incomingData = location.state;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [locations, setLocations] = useState<Array<{ id: string; name: string; address: string }>>([]);
  const [meetingPoint, setMeetingPoint] = useState<{ name: string; link: string }>({ name: "", link: "" });
  const [isCreating, setIsCreating] = useState(false);
  
  const { createItinerary } = useItineraries();
  const navigate = useNavigate();

  // Populate form with incoming data if available
  useEffect(() => {
    if (incomingData) {
      setTitle(incomingData.title || "");
      setDescription(incomingData.description || "");
      if (incomingData.startDate) {
        setStartDate(new Date(incomingData.startDate));
      }
      if (incomingData.endDate) {
        setEndDate(new Date(incomingData.endDate));
      }
      if (incomingData.locations) {
        setLocations(incomingData.locations.map((loc: any, index: number) => ({
          id: `${index}-${Date.now()}`,
          name: loc.name || "",
          address: loc.address || ""
        })));
      }
      if (typeof incomingData.meetingPoint === 'object' && incomingData.meetingPoint !== null) {
        setMeetingPoint({
          name: incomingData.meetingPoint.name || "",
          link: incomingData.meetingPoint.link || ""
        });
      } else {
        setMeetingPoint({ name: incomingData.meetingPoint || "", link: "" });
      }
    }
  }, [incomingData]);

  const addLocation = () => {
    const newLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      address: ""
    };
    setLocations([...locations, newLocation]);
  };

  const updateLocation = (id: string, field: 'name' | 'address', value: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handlePreview = () => {
    const previewData = {
      title,
      description, 
      startDate,
      endDate,
      locations: locations.filter(loc => loc.name.trim() !== ""),
      meetingPoint
    };
    navigate("/itinerary/preview", { state: previewData });
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Please enter a trip title");
      return;
    }

    setIsCreating(true);
    try {
      const itineraryData = {
        title: title.trim(),
        description: description.trim(),
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        locations: locations.filter(loc => loc.name.trim() !== "").map(loc => `${loc.name}${loc.address ? ` - ${loc.address}` : ""}`),
        meetingPoint, 
        status: "planning" as const
      };

      const newItinerary = await createItinerary(itineraryData);
      toast.success("Draft saved successfully!");
      navigate(`/itinerary/${newItinerary.id}`);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateItinerary = async () => {
    if (!title.trim()) {
      toast.error("Please enter a trip title");
      return;
    }

    setIsCreating(true);
    try {
      const itineraryData = {
        title: title.trim(),
        description: description.trim(),
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        locations: locations.filter(loc => loc.name.trim() !== "").map(loc => `${loc.name}${loc.address ? ` - ${loc.address}` : ""}`),
        status: "planning" as const
      };

      const newItinerary = await createItinerary(itineraryData);
      toast.success("Itinerary created successfully!");
      navigate(`/itinerary/${newItinerary.id}`);
    } catch (error) {
      console.error("Error creating itinerary:", error);
      toast.error("Failed to create itinerary. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div className="bg-gradient-sunset text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Create New Itinerary</h1>
          <p className="text-lg opacity-90">Plan your perfect trip step by step</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Information</CardTitle>
              <CardDescription>Start with the basics about your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Vacation in Europe" 
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your trip plans..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Point */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Point</CardTitle>
              <CardDescription>Where will your group meet to start the trip?</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Meeting point name (e.g. Main Entrance, Lobby)"
                  value={meetingPoint.name}
                  onChange={e => setMeetingPoint(mp => ({ ...mp, name: e.target.value }))}
                  className="text-lg"
                />
                <Input
                  placeholder="Link to location (Google Maps, etc)"
                  value={meetingPoint.link}
                  onChange={e => setMeetingPoint(mp => ({ ...mp, link: e.target.value }))}
                  className="text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Destinations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Destinations</CardTitle>
                  <CardDescription>Add the places you want to visit</CardDescription>
                </div>
                <Button onClick={addLocation} className="bg-travel-blue hover:bg-travel-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No destinations added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add Location" to get started</p>
                </div>
              ) : (
                locations.map((location, index) => (
                  <Card key={location.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-travel-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <Input 
                            value={location.name}
                            onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                            placeholder="Location name"
                            className="font-medium"
                          />
                          <div className="flex gap-2">
                            <Input 
                              value={location.address}
                              onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                              placeholder="Search address or place..."
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeLocation(location.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Link to="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isCreating}
              >
                Save Draft
              </Button>
              <Button 
                variant="outline"
                onClick={handlePreview}
                disabled={!title.trim()}
              >
                Preview
              </Button>
              <Button 
                className="bg-travel-blue hover:bg-travel-blue/90"
                onClick={handleCreateItinerary}
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? "Creating..." : "Create Itinerary"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItinerary;