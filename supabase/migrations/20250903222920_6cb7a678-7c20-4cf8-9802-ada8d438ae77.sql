-- Add sort_order column to activities table
ALTER TABLE public.activities 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Update existing activities to have incremental sort_order within each location
UPDATE public.activities 
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY itinerary_id, location_index 
           ORDER BY date ASC NULLS LAST, start_time ASC NULLS LAST, created_at ASC
         ) as row_num
  FROM public.activities
) sub
WHERE activities.id = sub.id;