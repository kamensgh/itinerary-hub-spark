/*
  # Add meetingPoint column to itineraries table

  1. Schema Changes
    - Add `meetingPoint` column to `itineraries` table
    - Column type: jsonb to store structured data (name and link)
    - Default value: empty JSON object for compatibility with existing rows

  2. Purpose
    - Enables storing meeting point information for itineraries
    - Supports both name and link fields as structured data
    - Maintains backward compatibility with existing itinerary records
*/

-- Add meetingPoint column to itineraries table
ALTER TABLE public.itineraries 
ADD COLUMN IF NOT EXISTS "meetingPoint" jsonb DEFAULT '{}'::jsonb;