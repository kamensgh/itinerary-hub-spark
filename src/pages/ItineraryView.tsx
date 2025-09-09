import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
  Plus,
  Edit3,
  Save,
  Eye,
  Trash2,
  Image,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useActivities } from '@/hooks/useActivities';
import { useItineraries, CreateItineraryData } from '@/hooks/useItineraries';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityCard } from '@/components/ActivityCard';
import { DraggableActivityList } from '@/components/DraggableActivityList';
import { DraggableLocationView } from '@/components/DraggableLocationView';
import type { Itinerary } from '@/hooks/useItineraries';
import type { Activity, CreateActivityData } from '@/hooks/useActivities';
import { toSentenceCase } from '@/lib/sentenceCase';

interface LocationData {
  id: string;
  name: string;
  address: string;
}

const CreateItineraryView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createItinerary, updateItinerary, updateLocationOrder } = useItineraries();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [meetingPoint, setMeetingPoint] = useState<{ name: string; link: string }>({
    name: '',
    link: '',
  });
  const [status, setStatus] = useState<'planning' | 'active' | 'completed'>('planning');
  const [image, setImage] = useState('gradient-sky');

  // View states
  const [activeView, setActiveView] = useState('form');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [existingItinerary, setExistingItinerary] = useState<Itinerary | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    activities,
    createActivity,
    updateActivity,
    deleteActivity,
    uploadActivityImage,
    reorderActivities,
    getActivitiesForLocation,
  } = useActivities(existingItinerary?.id || '');

  // Initialize form data
  useEffect(() => {
    const incomingData = location.state?.itinerary;
    if (incomingData) {
      setTitle(incomingData.title || '');
      setDescription(incomingData.description || '');
      setStartDate(incomingData.startDate || '');
      setEndDate(incomingData.endDate || '');
      if (typeof incomingData.meetingPoint === 'object' && incomingData.meetingPoint !== null) {
        setMeetingPoint({
          name: incomingData.meetingPoint.name || '',
          link: incomingData.meetingPoint.link || '',
        });
      } else {
        setMeetingPoint({ name: incomingData.meetingPoint || '', link: '' });
      }

      if (incomingData.locations && incomingData.locations.length > 0) {
        setLocations(
          incomingData.locations.map((loc: any, index: number) => ({
            id: `location-${index}`,
            name: typeof loc === 'string' ? loc : loc.name || '',
            address: typeof loc === 'string' ? '' : loc.address || '',
          })),
        );
      }
    }

    if (id && id !== 'new' && user) {
      fetchExistingItinerary();
    }
  }, [location.state, id, user]);

  const fetchExistingItinerary = async () => {
    if (!id || id === 'new' || !user) return;

    try {
      setLoading(true);

      const { data: itineraryData, error: itineraryError } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (itineraryError) {
        if (itineraryError.code === 'PGRST116') {
          // Not found, treat as new itinerary
          setIsEditing(false);
          return;
        }
        throw itineraryError;
      }

      const { data: participants, error: participantsError } = await supabase
        .from('itinerary_participants')
        .select('*')
        .eq('itinerary_id', id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
      }

      const itinerary = {
        ...itineraryData,
        status: itineraryData.status as 'planning' | 'active' | 'completed',
        participants: participants || [],
        meetingPoint: (itineraryData as any).meetingpoint || { name: '', link: '' },
      };

      setExistingItinerary(itinerary);
      setTitle(itinerary.title);
      setDescription(itinerary.description || '');
      setStartDate(itinerary.start_date || '');
      setEndDate(itinerary.end_date || '');
      setStatus(itinerary.status);
      setImage(itinerary.image || 'gradient-sky');
      setLocations(
        itinerary.locations?.map((loc: string, index: number) => ({
          id: `location-${index}`,
          name: loc,
          address: '',
        })) || [],
      );
      setIsEditing(true);
      setActiveView('timeline');
      setMeetingPoint({
        name: itinerary.meetingPoint?.name || '',
        link: itinerary.meetingPoint?.link || '',
      });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load itinerary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Location management functions
  const addLocation = () => {
    const newId = `location-${Date.now()}`;
    setLocations([...locations, { id: newId, name: '', address: '' }]);
  };

  const updateLocation = (id: string, field: 'name' | 'address', value: string) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)));
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const handleLocationsReorder = async (reorderedLocations: LocationData[]) => {
    setLocations(reorderedLocations);
    
    if (existingItinerary) {
      try {
        const locationNames = reorderedLocations.map(loc => loc.name).filter(Boolean);
        await updateLocationOrder(existingItinerary.id, locationNames);
      } catch (error) {
        console.error('Error updating location order:', error);
      }
    }
  };

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
  // Preview and save functions
  const handlePreview = () => {
    if (!title) {
      toast({
        title: 'Missing Information',
        description: 'Please add a title for your itinerary',
        variant: 'destructive',
      });
      return;
    }
    setActiveView('preview');
  };

  const handleSaveDraft = async () => {
    if (!title) {
      toast({
        title: 'Missing Information',
        description: 'Please add a title to save your itinerary',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      const itineraryData: CreateItineraryData = {
        title,
        description,
        status: 'planning',
        image,
        locations: locations.map((loc) => loc.name).filter(Boolean),
        meetingPoint,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      if (existingItinerary) {
        await updateItinerary(existingItinerary.id, itineraryData);
        toast({
          title: 'Draft Saved',
          description: 'Your itinerary draft has been updated successfully',
        });
      } else {
        const newItinerary = await createItinerary(itineraryData);
        if (newItinerary) {
          setExistingItinerary({
            ...newItinerary,
            status: newItinerary.status as 'planning' | 'active' | 'completed',
            participants: [],
          });
          setIsEditing(true);
          navigate(`/itinerary/${newItinerary.id}`, { replace: true });
        }
        toast({
          title: 'Draft Saved',
          description: 'Your itinerary draft has been saved successfully',
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateItinerary = async () => {
    if (!title) {
      toast({
        title: 'Missing Information',
        description: 'Please add a title for your itinerary',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      const itineraryData: CreateItineraryData = {
        title,
        description,
        status: 'active',
        image,
        locations: locations.map((loc) => loc.name).filter(Boolean),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        meetingPoint: { name: meetingPoint.name, link: meetingPoint.link },
      };

      let finalItinerary;
      if (existingItinerary) {
        await updateItinerary(existingItinerary.id, { ...itineraryData, status: 'active' });
        finalItinerary = { ...existingItinerary, ...itineraryData, status: 'active' as const };
      } else {
        finalItinerary = await createItinerary(itineraryData);
      }

      if (finalItinerary) {
        toast({
          title: 'Success!',
          description: 'Your itinerary has been created successfully',
        });
        navigate(`/itinerary/${finalItinerary.id}`);
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attraction':
        return <Star className="h-4 w-4" />;
      case 'food':
        return <Camera className="h-4 w-4" />;
      case 'accommodation':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddActivity = (locationIndex: number) => {
    setSelectedLocationIndex(locationIndex);
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedLocationIndex(activity.location_index);
    setShowActivityForm(true);
  };

  const handleActivitySubmit = async (data: CreateActivityData) => {
    if (editingActivity) {
      await updateActivity(editingActivity.id, data);
    } else {
      await createActivity(selectedLocationIndex, data);
    }
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const handleActivityDelete = async (activityId: string) => {
    await deleteActivity(activityId);
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div
        className="text-white relative overflow-hidden"
        style={{
          background:
            image && image !== 'gradient-sky' && !image.startsWith('gradient-')
              ? `linear-gradient(rgba(56, 189, 248, 0.7), rgba(99, 102, 241, 0.7)), url('${image}') center/cover no-repeat`
              : image?.startsWith('gradient-')
              ? 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)'
              : 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4 flex-wrap">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  if (existingItinerary?.id) {
                    const shareUrl = `${window.location.origin}/itinerary/${existingItinerary.id}/view`;
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: `${existingItinerary.title} share link copied`,
                      description: 'The link has been copied to your clipboard.',
                    });
                  } else {
                    toast({
                      title: 'Itinerary not saved yet',
                      description: 'Save your itinerary before sharing.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  try {
                    if (!e.target.files || !existingItinerary || !user) return;
                    const file = e.target.files[0];
                    if (!file) return;
                    const fileExt = file.name.split('.').pop() || 'png';
                    const filePath = `${user.id}/cover_${existingItinerary.id}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                      .from('itinerary-covers')
                      .upload(filePath, file, {
                        upsert: true,
                        contentType: file.type,
                        cacheControl: '3600',
                      });

                    if (uploadError) {
                      toast({
                        title: 'Upload failed',
                        description: uploadError.message,
                        variant: 'destructive',
                      });
                      return;
                    }

                    const { data: urlData } = supabase.storage
                      .from('itinerary-covers')
                      .getPublicUrl(filePath);

                    if (!urlData?.publicUrl) {
                      toast({ title: 'Failed to get image URL', variant: 'destructive' });
                      return;
                    }

                    await updateItinerary(existingItinerary.id, { image: urlData.publicUrl });
                    setImage(urlData.publicUrl);
                    toast({ title: 'Cover updated!' });
                  } catch (err: any) {
                    toast({
                      title: 'Cover update failed',
                      description: err?.message || 'Unknown error',
                      variant: 'destructive',
                    });
                  } finally {
                    if (coverInputRef.current) coverInputRef.current.value = '';
                  }
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Image className="h-4 w-4 mr-2" />
                    Cover
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border">
                  <DropdownMenuItem onClick={() => coverInputRef.current?.click()}>
                    <Image className="h-4 w-4 mr-2" />
                    Update Cover
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      if (!existingItinerary) return;
                      try {
                        await updateItinerary(existingItinerary.id, { image: 'gradient-sky' });
                        setImage('gradient-sky');
                        toast({ title: 'Cover removed!' });
                      } catch (err: any) {
                        toast({
                          title: 'Failed to remove cover',
                          description: err?.message,
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Cover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 normal-case">
                {toSentenceCase(title) ||
                  (isEditing ? toSentenceCase(existingItinerary?.title) : 'Create New Trip')}
              </h1>
              <p className="text-lg opacity-90 mb-4">
                {toSentenceCase(description) ||
                  (isEditing
                    ? toSentenceCase(existingItinerary?.description)
                    : 'Plan your next adventure')}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {startDate && endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(startDate).toLocaleDateString()} -{' '}
                    {new Date(endDate).toLocaleDateString()}
                  </div>
                )}
                {/* <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {existingItinerary?.participants?.length || 0} participants
                </div> */}
                <Badge variant="outline" className="text-white border-white/50">
                  {activeView === 'form'
                    ? 'Editing'
                    : activeView === 'preview'
                    ? 'Preview'
                    : status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Form
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 hidden">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="flex items-center gap-2"
              disabled={!existingItinerary}
            >
              <List className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2  hidden"
              disabled={!existingItinerary}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Form Tab */}
          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip information</CardTitle>
                <CardDescription>
                  {isEditing ? 'Edit your trip details' : 'Enter the basic details for your trip'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trip Title</label>
                    <Input
                      placeholder="Enter your trip title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Describe your trip..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select
                        value={status}
                        onValueChange={(value: 'planning' | 'active' | 'completed') =>
                          setStatus(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <Select value={image} onValueChange={setImage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradient-sky">Sky Blue</SelectItem>
                          <SelectItem value="gradient-sunset">Sunset Orange</SelectItem>
                          <SelectItem value="gradient-ocean">Ocean Blue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Point */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting point</CardTitle>
                <CardDescription>Where will your group meet?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Meeting point name (e.g. Main Entrance, Lobby)"
                    value={meetingPoint.name}
                    onChange={(e) => setMeetingPoint((mp) => ({ ...mp, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Link to location (Google Maps, etc)"
                    value={meetingPoint.link}
                    onChange={(e) => setMeetingPoint((mp) => ({ ...mp, link: e.target.value }))}
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
                  <Button onClick={addLocation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DraggableLocationView
                  locations={locations}
                  onLocationsChange={handleLocationsReorder}
                  onUpdateLocation={updateLocation}
                  onRemoveLocation={removeLocation}
                  onAddLocation={addLocation}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-3">
                <Button onClick={handleSaveDraft} variant="outline" disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button onClick={handlePreview} variant="outline" disabled={!title}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              <Button onClick={handleCreateItinerary} disabled={!title || isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isEditing ? 'Update Itinerary' : 'Create Itinerary'}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="secondary">Preview Mode</Badge>
              <Button onClick={() => setActiveView('form')} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{toSentenceCase(title) || 'Untitled Trip'}</CardTitle>
                {description && <CardDescription>{toSentenceCase(description)}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {startDate && endDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(startDate).toLocaleDateString()} -{' '}
                      {new Date(endDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {locations.filter((l) => l.name).length} Destination(s)
                  </div>
                </div>

                {(meetingPoint.name || meetingPoint.link) && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">Meeting Point</span>
                    </div>
                    {meetingPoint.name && (
                      <p className="text-sm font-medium">{meetingPoint.name}</p>
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
                )}

                {locations.filter((l) => l.name).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Destinations</h4>
                    <div className="space-y-2">
                      {locations
                        .filter((l) => l.name)
                        .map((location, index) => (
                          <div
                            key={location.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{toSentenceCase(location.name)}</p>
                              {location.address && (
                                <p className="text-sm text-muted-foreground">{location.address}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button onClick={() => setActiveView('form')} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Itinerary
              </Button>
              <Button onClick={handleCreateItinerary} disabled={!title || isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isEditing ? 'Update Itinerary' : 'Create Itinerary'}
              </Button>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {existingItinerary?.locations && existingItinerary.locations.length > 0 ? (
              existingItinerary.locations.map((location, locationIndex) => {
                const locationActivities = getActivitiesForLocation(locationIndex);

                return (
                  <Card key={locationIndex} className="border-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {locationIndex + 1}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{toSentenceCase(location)}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Destination • {locationActivities.length} activities
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddActivity(locationIndex)}
                          size="sm"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <DraggableActivityList
                        activities={locationActivities}
                        onReorder={(reorderedActivities) =>
                          reorderActivities(locationIndex, reorderedActivities)
                        }
                        onEdit={handleEditActivity}
                        onDelete={handleActivityDelete}
                      />
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No locations added yet</h3>
                  <p className="text-muted-foreground">
                    Create your itinerary first to add activities
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team discussion</CardTitle>
                <CardDescription>Collaborate with your travel companions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {existingItinerary?.participants && existingItinerary.participants.length > 0 ? (
                    <>
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {existingItinerary.participants[0].initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">Looking forward to this trip! 🎉</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {existingItinerary.participants[0].name} • Just now
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No participants yet</p>
                      <p className="text-sm mt-1">
                        Invite travel companions to start collaborating
                      </p>
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

        <ActivityForm
          isOpen={showActivityForm}
          onClose={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
          }}
          onSubmit={handleActivitySubmit}
          onImageUpload={uploadActivityImage}
          activity={editingActivity || undefined}
          isEditing={!!editingActivity}
        />
      </div>
    </div>
  );
};

export default CreateItineraryView;
