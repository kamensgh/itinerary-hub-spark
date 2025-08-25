import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Share2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Itinerary } from '@/hooks/useItineraries';
import { toSentenceCase } from '@/lib/sentenceCase';
import { toast } from '@/hooks/use-toast';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onEdit: (itinerary: Itinerary) => void;
  onDelete: (id: string) => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onEdit, onDelete }) => {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/itinerary/${itinerary.id}/view`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: `${itinerary.title} share link copied`,
      description: 'The link has been copied to your clipboard.',
    });
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-all cursor-pointer group">
      <div className={`h-32 bg-${itinerary.image} rounded-t-lg relative`}>
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(itinerary.status)} text-white`}>
            {getStatusText(itinerary.status)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(itinerary)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(itinerary.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{toSentenceCase(itinerary.title)}</CardTitle>
            <CardDescription className="text-sm">
              {toSentenceCase(itinerary.description)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {(itinerary.start_date || itinerary.end_date) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {itinerary.start_date && formatDate(itinerary.start_date)}
              {itinerary.start_date && itinerary.end_date && ' - '}
              {itinerary.end_date && formatDate(itinerary.end_date)}
            </span>
          </div>
        )}

        {itinerary.locations && itinerary.locations.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{itinerary.locations.slice(0, 2).join(", ")}
              {itinerary.locations.length > 2 && ` +${itinerary.locations.length - 2} more`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {itinerary.participants?.slice(0, 3).map((participant) => (
              <Avatar key={participant.id} className="border-2 border-white w-8 h-8">
                <AvatarFallback className="text-xs">
                  {participant.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {itinerary.participants && itinerary.participants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{itinerary.participants.length - 3}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Link to={`/itinerary/${itinerary.id}`}>
              <Button size="sm" className="bg-travel-blue hover:bg-travel-blue/90">
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryCard;