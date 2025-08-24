
import { useParams } from "react-router-dom";
import { useActivities } from "@/hooks/useActivities";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import { ActivityCard } from "@/components/ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ItineraryParticipant {
  id: string;
  itinerary_id: string;
  name: string;
  initials: string;
  email?: string;
}

interface Itinerary {
  id: string;
  title: string;
  description?: string;
  locations: string[];
  start_date?: string;
  end_date?: string;
  status?: string;
  participants?: ItineraryParticipant[];
  image?: string; // cover image url
}

const ItineraryViewOnly = () => {
  const { id } = useParams<{ id: string }>();
  const { activities } = useActivities(id || "");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('itineraries')
        .select('id, title, description, locations, start_date, end_date, status, image, itinerary_participants(id, name, initials, email)')
        .eq('id', id)
        .single();
      if (!error && data) {
        type SupabaseParticipant = Omit<ItineraryParticipant, 'itinerary_id'> & { itinerary_id?: string };
        setItinerary({
          ...data,
          participants: (data.itinerary_participants || []).map((p: SupabaseParticipant) => ({
            ...p,
            itinerary_id: p.itinerary_id ?? data.id,
          })),
        });
      }
      setLoading(false);
    };
    fetchItinerary();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const handleShare = () => {
    if (itinerary) {
      const shareUrl = `${window.location.origin}/itinerary/${itinerary.id}/view`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: `${itinerary.title} share link copied`,
        description: "The link has been copied to your clipboard.",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-sky">
      <div
        className="text-white py-8"
        style={{
          background: itinerary?.image
            ? `linear-gradient(90deg, #38bdf8 0%, #6366f1 100%), url('${itinerary.image}') center/cover no-repeat`
            : "linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold">
              {itinerary?.title || "Itinerary"}
            </h1>
            {itinerary && (
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                  title="Copy share link"
                >
                  Share
                </button>
              </div>
            )}
          </div>
          <p className="text-lg opacity-90 mb-4">
            {itinerary?.description || "Plan your next adventure"}
          </p>
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            {itinerary?.start_date && itinerary?.end_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {itinerary?.locations?.length || 0} destinations
            </div>
            {itinerary?.status && (
              <span className="px-2 py-1 rounded bg-white/20 border border-white/30 text-xs font-semibold uppercase tracking-wide">
                {itinerary.status}
              </span>
            )}
            {itinerary?.participants && itinerary.participants.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Participants:</span>
                {itinerary.participants.map((p) => (
                  <span key={p.id} className="inline-block px-2 py-1 bg-white/10 rounded text-xs font-medium">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {itinerary && itinerary.locations && itinerary.locations.length > 0 ? (
          itinerary.locations.map((location, idx) => {
            const locationActivities = activities.filter(a => a.location_index === idx);
            return (
              <Card key={location} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{location}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {locationActivities.length} activities
                  </div>
                </CardHeader>
                <CardContent>
                  {locationActivities.length > 0 ? (
                    <div className="space-y-4">
                      {locationActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} readOnly />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-muted/30 rounded-lg text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-2">No activities for this location</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No locations found</h3>
              <p className="text-muted-foreground">No activities to display</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ItineraryViewOnly;
