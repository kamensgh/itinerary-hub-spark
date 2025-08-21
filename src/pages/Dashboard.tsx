import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Share2, 
  Search,
  Filter,
  Plane,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useItineraries, Itinerary } from "@/hooks/useItineraries";
import ItineraryForm from "@/components/ItineraryForm";
import ItineraryCard from "@/components/ItineraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    itineraries, 
    loading: itinerariesLoading, 
    createItinerary, 
    updateItinerary, 
    deleteItinerary 
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
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-8 w-8 animate-pulse mx-auto mb-4 text-travel-blue" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Filter and search logic
  const filteredItineraries = itineraries.filter(itinerary => {
    const matchesSearch = itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itinerary.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itinerary.locations.some(location => location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || itinerary.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const stats = {
    active: itineraries.filter(i => i.status === 'active').length,
    planning: itineraries.filter(i => i.status === 'planning').length,
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
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-8 w-8 animate-pulse mx-auto mb-4 text-travel-blue" />
          <p>Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <div className="bg-gradient-sunset text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">My Itineraries</h1>
            </div>
            <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/itinerary/new')} className="bg-white text-primary hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
              <Button variant="ghost" onClick={handleSignOut} className="text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <p className="text-lg opacity-90">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Plan your next adventure or continue working on existing trips.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            Filter
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-background border rounded-lg">
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
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-blue rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Trip{stats.active !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-orange rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.planning}</p>
                  <p className="text-xs text-muted-foreground">In Planning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-green rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                  <p className="text-xs text-muted-foreground">Collaborators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-travel-purple rounded-lg flex items-center justify-center mr-3">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTrips}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.length === 0 && !itinerariesLoading ? (
            <div className="col-span-full text-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "Start planning your first adventure!"
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={() => navigate('/itinerary/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Button>
              )}
            </div>
          ) : (
            filteredItineraries.map((itinerary) => (
              <ItineraryCard 
                key={itinerary.id} 
                itinerary={itinerary}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ))
          )}

          {/* Add New Card - only show if we have trips or no filters */}
          {(filteredItineraries.length > 0 || (!searchTerm && statusFilter === 'all')) && (
            <Card 
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/itinerary/new')}
            >
              <CardContent className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create New Trip</h3>
                <p className="text-sm text-muted-foreground">
                  Start planning your next adventure
                </p>
              </CardContent>
            </Card>
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
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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