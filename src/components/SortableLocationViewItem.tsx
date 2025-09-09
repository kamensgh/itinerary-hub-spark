import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2 } from 'lucide-react';

interface LocationData {
  id: string;
  name: string;
  address: string;
}

interface SortableLocationViewItemProps {
  id: string;
  location: LocationData;
  index: number;
  onUpdate: (id: string, field: 'name' | 'address', value: string) => void;
  onRemove: (id: string) => void;
}

export const SortableLocationViewItem: React.FC<SortableLocationViewItemProps> = ({
  id,
  location,
  index,
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
    transition: isDragging ? 'none' : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-background"
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors mt-3"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
        {index + 1}
      </div>
      
      <div className="flex-1 space-y-3">
        <Input
          placeholder="Location name"
          value={location.name}
          onChange={(e) => onUpdate(location.id, 'name', e.target.value)}
        />
        <Input
          placeholder="Address (optional)"
          value={location.address}
          onChange={(e) => onUpdate(location.id, 'address', e.target.value)}
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(location.id)}
        className="text-destructive hover:text-destructive mt-1"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};