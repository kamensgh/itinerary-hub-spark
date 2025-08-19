-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  location_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'attraction',
  start_time TIME,
  end_time TIME,
  date DATE,
  address TEXT,
  website_url TEXT,
  phone TEXT,
  price_range TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities
CREATE POLICY "Users can view activities of their itineraries" 
ON public.activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = activities.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create activities for their itineraries" 
ON public.activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = activities.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update activities of their itineraries" 
ON public.activities 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = activities.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete activities of their itineraries" 
ON public.activities 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = activities.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_activities_itinerary_id ON public.activities(itinerary_id);
CREATE INDEX idx_activities_location_index ON public.activities(itinerary_id, location_index);

-- Create storage bucket for activity images
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-images', 'activity-images', true);

-- Create storage policies for activity images
CREATE POLICY "Activity images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'activity-images');

CREATE POLICY "Users can upload activity images for their itineraries" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'activity-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their activity images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'activity-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their activity images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'activity-images' 
  AND auth.uid() IS NOT NULL
);