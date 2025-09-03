
import { useParams } from "react-router-dom";
import { useActivities } from "@/hooks/useActivities";
import { useEffect, useState } from "react";
import { toSentenceCase } from "@/lib/sentenceCase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Share2 } from "lucide-react";
import { ActivityCard } from "@/components/ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  meetingPoint?: { name?: string; link?: string } | string;
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
        .select('id, title, description, locations, start_date, end_date, status, image, meetingpoint, itinerary_participants(id, name, initials, email)')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        type SupabaseParticipant = Omit<ItineraryParticipant, 'itinerary_id'> & { itinerary_id?: string };
        const rawData = data as any;
        setItinerary({
          ...rawData,
          meetingPoint: rawData.meetingpoint || { name: '', link: '' },
          participants: (rawData.itinerary_participants || []).map((p: SupabaseParticipant) => ({
            ...p,
            itinerary_id: p.itinerary_id ?? rawData.id,
          })),
        });
      }
      setLoading(false);
    };
    fetchItinerary();
  }, [id]);

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
        className="text-white py-8 relative overflow-hidden"
        style={{
          background: itinerary?.image && itinerary.image !== 'gradient-sky' && !itinerary.image.startsWith('gradient-')
            ? `linear-gradient(rgba(56, 189, 248, 0.7), rgba(99, 102, 241, 0.7)), url('${itinerary.image}') center/cover no-repeat`
            : itinerary?.image?.startsWith('gradient-') 
            ? "linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)"
            : "linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold">
              {toSentenceCase(itinerary?.title) || "Itinerary"}
            </h1>
            {itinerary && (
              <div className="flex gap-2">
                 <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              </div>
            )}
          </div>
          <p className="text-lg opacity-90 mb-4">
            {toSentenceCase(itinerary?.description) || "Plan your next adventure"}
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

          {/* (Meeting Point section moved below) */}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Meeting Point Card */}
        {(() => {
          let meetingPoint = itinerary?.meetingPoint;
          
          if (typeof meetingPoint === 'string') {
            meetingPoint = { name: meetingPoint };
          }
          if (meetingPoint && (meetingPoint.name || meetingPoint.link)) {
            return (
              <Card className="mb-6 mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Point</CardTitle>
                </CardHeader>
                <div className="px-6 pb-6">
                  {meetingPoint.name && (
                    <div className="text-base font-medium mb-1">
                      {toSentenceCase(meetingPoint.name)}
                    </div>
                  )}
                  {meetingPoint.link && (
                    <a
                      href={meetingPoint.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline break-all"
                    >
                      {meetingPoint.link}
                    </a>
                  )}
                </div>
              </Card>
            );
          }
          return null;
        })()}

        {itinerary && itinerary.locations && itinerary.locations.length > 0 ? (
          itinerary.locations.map((location, idx) => {
            const locationActivities = activities.filter(a => a.location_index === idx);
            return (
              <Card key={location} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{toSentenceCase(location)}</CardTitle>
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
