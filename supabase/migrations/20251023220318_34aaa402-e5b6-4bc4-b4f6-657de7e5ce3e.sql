-- Create timeline_items table
CREATE TABLE public.timeline_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

-- Create policies for timeline_items
CREATE POLICY "Users can view timeline items of their itineraries"
ON public.timeline_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM itineraries
  WHERE itineraries.id = timeline_items.itinerary_id
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can create timeline items for their itineraries"
ON public.timeline_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM itineraries
  WHERE itineraries.id = timeline_items.itinerary_id
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can update timeline items of their itineraries"
ON public.timeline_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM itineraries
  WHERE itineraries.id = timeline_items.itinerary_id
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can delete timeline items of their itineraries"
ON public.timeline_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM itineraries
  WHERE itineraries.id = timeline_items.itinerary_id
  AND itineraries.user_id = auth.uid()
));

-- Create index for faster lookups
CREATE INDEX idx_timeline_items_itinerary_id ON public.timeline_items(itinerary_id);
CREATE INDEX idx_timeline_items_date ON public.timeline_items(date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timeline_items_updated_at
BEFORE UPDATE ON public.timeline_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();