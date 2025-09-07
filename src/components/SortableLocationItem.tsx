import React from "react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, GripVertical } from "lucide-react";
import { Activity } from "@/hooks/useActivities";
import { DraggableActivityList } from "./DraggableActivityList";
import { toSentenceCase } from "@/lib/sentenceCase";

interface SortableLocationItemProps {
  id: string;
  locationIndex: number;
  location: string;
  activities: Activity[];
  onAddActivity: () => void;
  onReorderActivities: (reorderedActivities: Activity[]) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export function SortableLocationItem({ 
  id,
  locationIndex,
  location,
  activities,
  onAddActivity,
  onReorderActivities,
  onEditActivity,
  onDeleteActivity
}: SortableLocationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${
        isDragging 
          ? 'opacity-75 shadow-2xl scale-105 z-50' 
          : 'hover:shadow-md'
      }`}
    >
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                {...attributes}
                {...listeners}
                className={`flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label="Drag to reorder location"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {locationIndex + 1}
              </div>
              <div>
                <CardTitle className="text-xl">{toSentenceCase(location)}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Destination • {activities.length} activities
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onAddActivity}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <DraggableActivityList
            activities={activities}
            onReorder={onReorderActivities}
            onEdit={onEditActivity}
            onDelete={onDeleteActivity}
          />
        </CardContent>
      </Card>
    </div>
  );
}