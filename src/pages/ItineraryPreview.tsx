import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, CalendarPlus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useItineraries } from "@/hooks/useItineraries";
import { useActivities } from "@/hooks/useActivities";
import { useExpenses } from "@/hooks/useExpenses";
import { useTimelineItems } from "@/hooks/useTimelineItems";
import { useCurrency } from "@/hooks/useCurrency";
import { ActivityCard } from "@/components/ActivityCard";
import { TimelineView } from "@/components/TimelineView";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { toSentenceCase } from "@/lib/sentenceCase";
import { supabase } from "@/integrations/supabase/client";

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
  image?: string;
  meetingPoint?: { name?: string; link?: string } | string;
}

const ItineraryPreview = () => {
  const location = useLocation();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const itineraryData = location.state || {};
  const itineraryId = itineraryData.id;
  
  const { activities } = useActivities(itineraryId || "");
  const { expenses, getTotalCost } = useExpenses(itineraryId || "");
  const { timelineItems } = useTimelineItems(itineraryId);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!itineraryId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('itineraries')
        .select('id, title, description, locations, start_date, end_date, status, image, meetingpoint, itinerary_participants(id, name, initials, email)')
        .eq('id', itineraryId)
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
    
    if (itineraryId) {
      fetchItinerary();
    } else {
      setLoading(false);
    }
  }, [itineraryId]);

  const handleAddToCalendar = () => {
    if (!itinerary || !itinerary.start_date) return;
    
    const title = encodeURIComponent(itinerary.title);
    const description = encodeURIComponent(itinerary.description || '');
    const startDate = new Date(itinerary.start_date);
    const endDate = itinerary.end_date ? new Date(itinerary.end_date) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${formatDate(startDate)}/${formatDate(endDate)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div
        className="text-white py-8 relative overflow-hidden"
        style={{
          background:
            itinerary?.image &&
            itinerary.image !== 'gradient-sky' &&
            !itinerary.image.startsWith('gradient-')
              ? `linear-gradient(rgba(56, 189, 248, 0.7), rgba(99, 102, 241, 0.7)), url('${itinerary.image}') center/cover no-repeat`
              : itinerary?.image?.startsWith('gradient-')
              ? 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)'
              : 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <Link to="/create">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Preview Mode
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {toSentenceCase(itinerary?.title) || 'Itinerary Preview'}
          </h1>
          <p className="text-lg opacity-90 mb-4">
            {toSentenceCase(itinerary?.description) || 'Review your trip before finalizing'}
          </p>
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            {itinerary?.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {(() => {
                  const today = new Date();
                  const start = new Date(itinerary.start_date);
                  const daysLeft = differenceInDays(start, today);

                  if (itinerary.end_date) {
                    const end = new Date(itinerary.end_date);
                    const daysPastEnd = differenceInDays(today, end);

                    if (daysPastEnd > 0) {
                      return 'Trip ended';
                    }
                  }

                  if (daysLeft > 0) {
                    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left to start`;
                  } else if (daysLeft === 0) {
                    return 'Starting today';
                  } else {
                    return 'Trip started';
                  }
                })()}
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
                  <span
                    key={p.id}
                    className="inline-block px-2 py-1 bg-white/10 rounded text-xs font-medium"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
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
                  <CardTitle className="text-lg flex items-center justify-between">
                    Meeting Point
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToCalendar}
                      className="flex items-center gap-2"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Add to Calendar
                    </Button>
                  </CardTitle>
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

        {/* Tabs Section */}
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="mt-6">
            {itinerary && itinerary.locations && itinerary.locations.length > 0 ? (
              itinerary.locations.map((location, idx) => {
                const locationActivities = activities.filter((a) => a.location_index === idx);
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
                          {locationActivities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} readOnly />
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-muted/30 rounded-lg text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-2">
                            No activities for this location
                          </p>
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
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <TimelineView items={timelineItems} />
            </div>
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Trip Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-center">
                    {formatAmount(getTotalCost())}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Estimated Total Cost
                  </div>
                </div>

                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Expenses ({expenses.length})
                    </h4>
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="font-medium">{toSentenceCase(expense.name)}</span>
                        <span className="text-muted-foreground">
                          {formatAmount(expense.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                    <p className="text-muted-foreground">
                      Budget information will appear here when expenses are added
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ItineraryPreview;