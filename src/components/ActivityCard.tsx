import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  MapPin,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Star,
  Camera,
  Utensils,
  Bed,
  Car,
  ShoppingBag,
  Music,
  Trees,
  Building,
  Dumbbell,
  MoreHorizontal,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Activity } from '@/hooks/useActivities';
import { toSentenceCase } from '@/lib/sentenceCase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'attraction':
      return <Star className="h-4 w-4" />;
    case 'food':
      return <Utensils className="h-4 w-4" />;
    case 'accommodation':
      return <Bed className="h-4 w-4" />;
    case 'transportation':
      return <Car className="h-4 w-4" />;
    case 'shopping':
      return <ShoppingBag className="h-4 w-4" />;
    case 'entertainment':
      return <Music className="h-4 w-4" />;
    case 'nature':
      return <Trees className="h-4 w-4" />;
    case 'culture':
      return <Building className="h-4 w-4" />;
    case 'sports':
      return <Dumbbell className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'attraction':
      return 'bg-travel-blue';
    case 'food':
      return 'bg-travel-orange';
    case 'accommodation':
      return 'bg-travel-green';
    case 'transportation':
      return 'bg-travel-purple';
    case 'shopping':
      return 'bg-travel-purple';
    case 'entertainment':
      return 'bg-travel-orange';
    case 'nature':
      return 'bg-travel-green';
    case 'culture':
      return 'bg-travel-blue';
    case 'sports':
      return 'bg-travel-yellow';
    default:
      return 'bg-muted';
  }
};

const formatTime = (time: string) => {
  if (!time) return '';
  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};

export const ActivityCard = ({ activity, onEdit, onDelete, readOnly }: ActivityCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const viewNote = (note: string) => {
    setShowNoteModal(true);
  };

  return (
    <div>
      <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`p-2 rounded-full ${getActivityColor(
                  activity.activity_type,
                )} text-white flex-shrink-0`}
              >
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">
                  {toSentenceCase(activity.name)}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {activity.activity_type.replace('_', ' ')}
                  </Badge>
                  {activity.price_range && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.price_range}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!readOnly && (
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit && onEdit(activity)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{activity.name}"? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete && onDelete(activity.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex justify-between md:flex-row flex-col">
          <div>
            {/* Description */}
            {activity.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activity.description}
              </p>
            )}

            {/* Time and Date */}
            {(activity.date || activity.start_time || activity.end_time) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {activity.date && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(activity.date)}
                  </div>
                )}
                {(activity.start_time || activity.end_time) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {activity.start_time && formatTime(activity.start_time)}
                    {activity.start_time && activity.end_time && ' - '}
                    {activity.end_time && formatTime(activity.end_time)}
                  </div>
                )}
              </div>
            )}

            {/* Contact and Location Info */}
            <div className="space-y-2">
              {activity.address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{toSentenceCase(activity.address)}</span>
                </div>
              )}

              {activity.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${activity.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {activity.phone}
                  </a>
                </div>
              )}

              {activity.website_url && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={activity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors truncate"
                  >
                    {activity.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Notes */}
            {activity.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="underline cursor-pointer" onClick={() => setShowNoteModal(true)}>
                  View Note
                </p>
              </div>
            )}
          </div>

          <div>
            {/* Image */}
            {activity.image_url && !imageError && (
              <div className="relative rounded-lg flex justify-end items-center">
                <img
                  src={activity.image_url}
                  alt={activity.name}
                  className="md:w-1/4 w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <Dialog open={showNoteModal} onOpenChange={() => setShowNoteModal(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{'Note'}</DialogTitle>
              <DialogDescription>
                <div className="bg-muted rounded-md text-muted-foreground p-6 mt-4">
                  {toSentenceCase(activity.notes)}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
