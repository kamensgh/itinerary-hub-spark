-- Create expenses table for itinerary budget tracking
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access through itinerary ownership
CREATE POLICY "Users can view expenses of their itineraries" 
ON public.expenses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM itineraries 
  WHERE itineraries.id = expenses.itinerary_id 
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can create expenses for their itineraries" 
ON public.expenses 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM itineraries 
  WHERE itineraries.id = expenses.itinerary_id 
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can update expenses of their itineraries" 
ON public.expenses 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM itineraries 
  WHERE itineraries.id = expenses.itinerary_id 
  AND itineraries.user_id = auth.uid()
));

CREATE POLICY "Users can delete expenses of their itineraries" 
ON public.expenses 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM itineraries 
  WHERE itineraries.id = expenses.itinerary_id 
  AND itineraries.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();