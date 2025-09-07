import React from "react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActivityCard } from "./ActivityCard";
import { Activity } from "@/hooks/useActivities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export function SortableItem({ activity, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

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
          ? 'opacity-75 z-50 bg-background rounded-lg'
          : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className={`flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 rounded-lg overflow-hidden shadow-sm border">
          <ActivityCard activity={activity} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}