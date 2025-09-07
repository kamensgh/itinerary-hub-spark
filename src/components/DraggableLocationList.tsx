import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableLocationItem } from "./SortableLocationItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus } from "lucide-react";
import { Activity } from "@/hooks/useActivities";
import { DraggableActivityList } from "./DraggableActivityList";
import { toSentenceCase } from "@/lib/sentenceCase";

interface DraggableLocationListProps {
  locations: string[];
  onReorder: (reorderedLocations: string[]) => void;
  getActivitiesForLocation: (locationIndex: number) => Activity[];
  onAddActivity: (locationIndex: number) => void;
  onReorderActivities: (locationIndex: number, reorderedActivities: Activity[]) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export function DraggableLocationList({ 
  locations, 
  onReorder,
  getActivitiesForLocation,
  onAddActivity,
  onReorderActivities,
  onEditActivity,
  onDeleteActivity
}: DraggableLocationListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = locations.findIndex((_, index) => index.toString() === active.id);
      const newIndex = locations.findIndex((_, index) => index.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedLocations = arrayMove(locations, oldIndex, newIndex);
        onReorder(reorderedLocations);
      }
    }
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No locations added yet</h3>
          <p className="text-muted-foreground">
            Create your itinerary first to add activities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={locations.map((_, index) => index.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {locations.map((location, locationIndex) => {
            const locationActivities = getActivitiesForLocation(locationIndex);
            
            return (
              <SortableLocationItem
                key={locationIndex}
                id={locationIndex.toString()}
                locationIndex={locationIndex}
                location={location}
                activities={locationActivities}
                onAddActivity={() => onAddActivity(locationIndex)}
                onReorderActivities={(reorderedActivities) => 
                  onReorderActivities(locationIndex, reorderedActivities)
                }
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}