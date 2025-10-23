import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TimelineItem {
  id: string;
  itinerary_id: string;
  date: Date;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTimelineItemData {
  date: Date;
  description: string;
}

export const useTimelineItems = (itineraryId: string | undefined) => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTimelineItems = async () => {
    if (!itineraryId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timeline_items')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('date', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const items = (data || []).map(item => ({
        ...item,
        date: new Date(item.date),
      }));

      setTimelineItems(items);
    } catch (error) {
      console.error('Error fetching timeline items:', error);
      toast.error('Failed to load timeline items');
    } finally {
      setLoading(false);
    }
  };

  const createTimelineItem = async (data: CreateTimelineItemData) => {
    if (!itineraryId) {
      toast.error('No itinerary selected');
      return;
    }

    try {
      const { data: newItem, error } = await supabase
        .from('timeline_items')
        .insert({
          itinerary_id: itineraryId,
          date: data.date.toISOString().split('T')[0],
          description: data.description,
          sort_order: timelineItems.length,
        })
        .select()
        .single();

      if (error) throw error;

      const item: TimelineItem = {
        ...newItem,
        date: new Date(newItem.date),
      };

      setTimelineItems([...timelineItems, item].sort((a, b) => 
        a.date.getTime() - b.date.getTime()
      ));
      toast.success('Timeline item added');
      return item;
    } catch (error) {
      console.error('Error creating timeline item:', error);
      toast.error('Failed to create timeline item');
    }
  };

  const updateTimelineItem = async (id: string, data: Partial<CreateTimelineItemData>) => {
    try {
      const updateData: any = {};
      if (data.date) {
        updateData.date = data.date.toISOString().split('T')[0];
      }
      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      const { error } = await supabase
        .from('timeline_items')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setTimelineItems(
        timelineItems.map(item =>
          item.id === id
            ? { ...item, ...data }
            : item
        ).sort((a, b) => a.date.getTime() - b.date.getTime())
      );
      toast.success('Timeline item updated');
    } catch (error) {
      console.error('Error updating timeline item:', error);
      toast.error('Failed to update timeline item');
    }
  };

  const deleteTimelineItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTimelineItems(timelineItems.filter(item => item.id !== id));
      toast.success('Timeline item deleted');
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      toast.error('Failed to delete timeline item');
    }
  };

  useEffect(() => {
    if (user && itineraryId) {
      fetchTimelineItems();
    }
  }, [user, itineraryId]);

  return {
    timelineItems,
    loading,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    refetch: fetchTimelineItems,
  };
};
