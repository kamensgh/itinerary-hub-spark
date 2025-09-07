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
import { SortableItem } from "./SortableActivityItem";
import { Activity } from "@/hooks/useActivities";
import { Clock } from "lucide-react";

interface DraggableActivityListProps {
  activities: Activity[];
  onReorder: (reorderedActivities: Activity[]) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export function DraggableActivityList({ 
  activities, 
  onReorder, 
  onEdit, 
  onDelete 
}: DraggableActivityListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = activities.findIndex((item) => item.id === active.id);
      const newIndex = activities.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedActivities = arrayMove(activities, oldIndex, newIndex);
        onReorder(reorderedActivities);
      }
    }
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 bg-muted/30 rounded-lg text-center">
        <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground mb-2">No activities added yet</p>
        <p className="text-sm text-muted-foreground">
          Click "Add Activity" to start planning activities for this destination
        </p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={activities.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              <SortableItem
                activity={activity}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}