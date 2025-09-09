import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin, Plus } from 'lucide-react';
import { SortableLocationViewItem } from './SortableLocationViewItem';

interface LocationData {
  id: string;
  name: string;
  address: string;
}

interface DraggableLocationViewProps {
  locations: LocationData[];
  onLocationsChange: (locations: LocationData[]) => void;
  onUpdateLocation: (id: string, field: 'name' | 'address', value: string) => void;
  onRemoveLocation: (id: string) => void;
  onAddLocation: () => void;
}

export const DraggableLocationView: React.FC<DraggableLocationViewProps> = ({
  locations,
  onLocationsChange,
  onUpdateLocation,
  onRemoveLocation,
  onAddLocation,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex(location => location.id === active.id);
      const newIndex = locations.findIndex(location => location.id === over.id);

      const reorderedLocations = arrayMove(locations, oldIndex, newIndex);
      onLocationsChange(reorderedLocations);
    }
  };

  return (
    <div className="space-y-4">
      {locations.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations.map(location => location.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {locations.map((location, index) => (
                <SortableLocationViewItem
                  key={location.id}
                  id={location.id}
                  location={location}
                  index={index}
                  onUpdate={onUpdateLocation}
                  onRemove={onRemoveLocation}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No destinations added yet</p>
          <p className="text-sm">Click "Add Location" to get started</p>
        </div>
      )}
    </div>
  );
};