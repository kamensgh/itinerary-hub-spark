-- Create itineraries table
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  start_date DATE,
  end_date DATE,
  locations TEXT[] DEFAULT '{}',
  image TEXT DEFAULT 'gradient-sky',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own itineraries" 
ON public.itineraries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own itineraries" 
ON public.itineraries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries" 
ON public.itineraries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries" 
ON public.itineraries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create participants table for itinerary participants
CREATE TABLE public.itinerary_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for participants
ALTER TABLE public.itinerary_participants ENABLE ROW LEVEL SECURITY;

-- Participants policies - can access through itinerary ownership
CREATE POLICY "Users can manage participants of their itineraries" 
ON public.itinerary_participants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE id = itinerary_id AND user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on itineraries
CREATE TRIGGER update_itineraries_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_status ON public.itineraries(status);
CREATE INDEX idx_itineraries_dates ON public.itineraries(start_date, end_date);
CREATE INDEX idx_itinerary_participants_itinerary_id ON public.itinerary_participants(itinerary_id);