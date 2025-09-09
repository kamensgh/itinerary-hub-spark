import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, X } from 'lucide-react';

interface SortableLocationFormItemProps {
  id: string;
  location: string;
  onUpdate: (value: string) => void;
  onRemove: () => void;
}

export const SortableLocationFormItem: React.FC<SortableLocationFormItemProps> = ({
  id,
  location,
  onUpdate,
  onRemove,
}) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background border border-border rounded-md"
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <Input
        value={location}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Enter location"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};