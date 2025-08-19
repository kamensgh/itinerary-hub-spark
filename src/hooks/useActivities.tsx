import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Activity {
  id: string;
  itinerary_id: string;
  location_index: number;
  name: string;
  description?: string;
  activity_type: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  address?: string;
  website_url?: string;
  phone?: string;
  price_range?: string;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  name: string;
  description?: string;
  activity_type: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  address?: string;
  website_url?: string;
  phone?: string;
  price_range?: string;
  notes?: string;
  image_url?: string;
}

export const useActivities = (itineraryId: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user || !itineraryId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('location_index', { ascending: true })
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (locationIndex: number, data: CreateActivityData) => {
    if (!user || !itineraryId) return;

    try {
      const { data: newActivity, error } = await supabase
        .from('activities')
        .insert([{
          itinerary_id: itineraryId,
          location_index: locationIndex,
          ...data,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        toast({
          title: "Error",
          description: "Failed to create activity",
          variant: "destructive",
        });
        return;
      }

      setActivities(prev => [...prev, newActivity]);
      toast({
        title: "Success",
        description: "Activity created successfully",
      });

      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    }
  };

  const updateActivity = async (id: string, data: Partial<CreateActivityData>) => {
    if (!user) return;

    try {
      const { data: updatedActivity, error } = await supabase
        .from('activities')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity:', error);
        toast({
          title: "Error",
          description: "Failed to update activity",
          variant: "destructive",
        });
        return;
      }

      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? updatedActivity : activity
        )
      );

      toast({
        title: "Success",
        description: "Activity updated successfully",
      });

      return updatedActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    }
  };

  const deleteActivity = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity",
          variant: "destructive",
        });
        return;
      }

      setActivities(prev => prev.filter(activity => activity.id !== id));
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const uploadActivityImage = async (file: File, activityId?: string) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activityId || crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return null;
      }

      const { data } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user, itineraryId]);

  const getActivitiesForLocation = (locationIndex: number) => {
    return activities.filter(activity => activity.location_index === locationIndex);
  };

  return {
    activities,
    loading,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    uploadActivityImage,
    getActivitiesForLocation,
  };
};