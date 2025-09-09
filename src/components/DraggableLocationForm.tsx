import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { SortableLocationFormItem } from './SortableLocationFormItem';

interface DraggableLocationFormProps {
  locations: string[];
  onChange: (locations: string[]) => void;
}

export const DraggableLocationForm: React.FC<DraggableLocationFormProps> = ({
  locations,
  onChange,
}) => {
  const [newLocation, setNewLocation] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex(location => `location-${locations.indexOf(location)}` === active.id);
      const newIndex = locations.findIndex(location => `location-${locations.indexOf(location)}` === over.id);

      const reorderedLocations = arrayMove(locations, oldIndex, newIndex);
      onChange(reorderedLocations);
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      onChange([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    onChange(updatedLocations);
  };

  const updateLocation = (index: number, value: string) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = value;
    onChange(updatedLocations);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLocation();
            }
          }}
        />
        <Button type="button" onClick={addLocation} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {locations.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations.map((_, index) => `location-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {locations.map((location, index) => (
                <SortableLocationFormItem
                  key={`location-${index}`}
                  id={`location-${index}`}
                  location={location}
                  onUpdate={(value) => updateLocation(index, value)}
                  onRemove={() => removeLocation(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};