-- Create storage bucket for itinerary covers
INSERT INTO storage.buckets (id, name, public) VALUES ('itinerary-covers', 'itinerary-covers', true);

-- Create policies for itinerary covers
CREATE POLICY "Itinerary covers are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'itinerary-covers');

CREATE POLICY "Users can upload covers for their itineraries" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'itinerary-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update covers for their itineraries" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'itinerary-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete covers for their itineraries" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'itinerary-covers' AND auth.uid()::text = (storage.foldername(name))[1]);