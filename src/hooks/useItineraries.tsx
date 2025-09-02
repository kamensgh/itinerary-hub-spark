import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  locations: string[];
  image: string;
  created_at: string;
  updated_at: string;
  participants?: ItineraryParticipant[];
  meetingPoint?: { name?: string; link?: string };
}

export interface ItineraryParticipant {
  id: string;
  itinerary_id: string;
  name: string;
  initials: string;
  email?: string;
}

export interface CreateItineraryData {
  title: string;
  description?: string;
  status?: 'planning' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  locations?: string[];
  image?: string;
  meetingPoint?: { name?: string; link?: string };
}

export const useItineraries = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItineraries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch itineraries
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itinerariesError) throw itinerariesError;

      // Fetch participants for each itinerary
      const itinerariesWithParticipants = await Promise.all(
        (itinerariesData || []).map(async (itinerary) => {
          const { data: participants, error: participantsError } = await supabase
            .from('itinerary_participants')
            .select('*')
            .eq('itinerary_id', itinerary.id);

          if (participantsError) {
            console.error('Error fetching participants:', participantsError);
            return { 
              ...itinerary, 
              participants: [],
              status: itinerary.status as 'planning' | 'active' | 'completed',
              meetingPoint: (itinerary as any).meetingpoint || { name: '', link: '' }
            };
          }

          return { 
            ...itinerary, 
            participants: participants || [],
            status: itinerary.status as 'planning' | 'active' | 'completed',
            meetingPoint: (itinerary as any).meetingpoint || { name: '', link: '' }
          };
        })
      );

      setItineraries(itinerariesWithParticipants);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      toast({
        title: "Error",
        description: "Failed to load itineraries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItinerary = async (data: CreateItineraryData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const insertData = {
        title: data.title,
        description: data.description,
        status: data.status || 'planning',
        start_date: data.start_date,
        end_date: data.end_date,
        locations: data.locations || [],
        image: data.image || 'gradient-sky',
        user_id: user.id,
        meetingpoint: data.meetingPoint || { name: '', link: '' }
      };

      const { data: newItinerary, error } = await supabase
        .from('itineraries')
        .insert([insertData as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Itinerary created successfully",
      });

      await fetchItineraries();
      return newItinerary;
    } catch (error) {
      console.error('Error creating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to create itinerary",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItinerary = async (id: string, data: Partial<CreateItineraryData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.start_date !== undefined) updateData.start_date = data.start_date;
      if (data.end_date !== undefined) updateData.end_date = data.end_date;
      if (data.locations !== undefined) updateData.locations = data.locations;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.meetingPoint !== undefined) updateData.meetingpoint = data.meetingPoint;

      const { error } = await supabase
        .from('itineraries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Itinerary updated successfully",
      });

      await fetchItineraries();
    } catch (error) {
      console.error('Error updating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to update itinerary",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItinerary = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Itinerary deleted successfully",
      });

      await fetchItineraries();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to delete itinerary",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addParticipant = async (itineraryId: string, participant: { name: string; initials: string; email?: string }) => {
    try {
      const { error } = await supabase
        .from('itinerary_participants')
        .insert([{ ...participant, itinerary_id: itineraryId }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Participant added successfully",
      });

      await fetchItineraries();
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        title: "Error",
        description: "Failed to add participant",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('itinerary_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Participant removed successfully",
      });

      await fetchItineraries();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        title: "Error",
        description: "Failed to remove participant",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [user]);

  return {
    itineraries,
    loading,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    addParticipant,
    removeParticipant,
    refreshItineraries: fetchItineraries,
  };
};