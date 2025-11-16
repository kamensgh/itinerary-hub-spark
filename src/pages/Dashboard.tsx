import { useEffect, useState } from 'react';
import { toSentenceCase } from '@/lib/sentenceCase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, MapPin, Users, Share2, Search, Filter, Plane, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useItineraries, Itinerary } from '@/hooks/useItineraries';
import ItineraryForm from '@/components/ItineraryForm';
import ItineraryCard from '@/components/ItineraryCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/ThemeToggle';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    itineraries,
    loading: itinerariesLoading,
    createItinerary,
    updateItinerary,
    deleteItinerary,
  } = useItineraries();

  // Form and filter states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter and search logic
  const filteredItineraries = itineraries.filter((itinerary) => {
    const matchesSearch =
      toSentenceCase(itinerary.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      toSentenceCase(itinerary.description)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.locations.some((location) =>
        location.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus = statusFilter === 'all' || itinerary.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const stats = {
    active: itineraries.filter((i) => i.status === 'active').length,
    planning: itineraries.filter((i) => i.status === 'planning').length,
    totalParticipants: itineraries.reduce((acc, i) => acc + (i.participants?.length || 0), 0),
    totalTrips: itineraries.length,
  };

  // Form handlers
  const handleCreateItinerary = async (data: any) => {
    await createItinerary(data);
    setIsFormOpen(false);
  };

  const handleEditItinerary = async (data: any) => {
    if (editingItinerary) {
      await updateItinerary(editingItinerary.id, data);
      setEditingItinerary(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itineraryToDelete) {
      await deleteItinerary(itineraryToDelete);
      setItineraryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
  };

  const openDeleteDialog = (id: string) => {
    setItineraryToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (itinerariesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Itineraries</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={() => navigate('/itinerary/new')}
                size="default"
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Trip</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-primary transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Active
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{stats.active}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                Planning
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">{stats.planning}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Collaborators
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">{stats.totalParticipants}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-primary" />
                Total Trips
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.totalTrips}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search your trips..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setShowFilters(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {searchTerm || statusFilter !== 'all' ? 'Search Results' : 'Your Trips'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredItineraries.length} {filteredItineraries.length === 1 ? 'trip' : 'trips'} found
            </p>
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.length === 0 && !itinerariesLoading ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Start planning your first adventure!'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button onClick={() => navigate('/itinerary/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Trip
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {filteredItineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}

              {/* Add New Card */}
              {(filteredItineraries.length > 0 || (!searchTerm && statusFilter === 'all')) && (
                <Card
                  className="border-2 border-dashed hover:border-primary hover:bg-accent/50 transition-all cursor-pointer group"
                  onClick={() => navigate('/itinerary/new')}
                >
                  <CardContent className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Create New Trip</h3>
                    <p className="text-sm text-muted-foreground">
                      Start planning your next adventure
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Forms and Dialogs */}
        <ItineraryForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateItinerary}
          title="Create New Trip"
        />

        <ItineraryForm
          isOpen={!!editingItinerary}
          onClose={() => setEditingItinerary(null)}
          onSubmit={handleEditItinerary}
          initialData={editingItinerary || undefined}
          title="Edit Trip"
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trip</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this trip? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;
