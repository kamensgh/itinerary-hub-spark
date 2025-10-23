import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Pencil, Trash2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TimelineItem } from '@/hooks/useTimelineItems';

interface TimelineFormProps {
  items: TimelineItem[];
  onAdd: (data: { date: Date; description: string; url?: string }) => void;
  onEdit: (id: string, data: { date: Date; description: string; url?: string }) => void;
  onDelete: (id: string) => void;
}

export const TimelineForm = ({ items, onAdd, onEdit, onDelete }: TimelineFormProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!date || !description.trim()) {
      return;
    }

    if (editingId) {
      onEdit(editingId, { date, description, url: url || undefined });
      setEditingId(null);
    } else {
      onAdd({ date, description, url: url || undefined });
    }

    setDate(undefined);
    setDescription('');
    setUrl('');
    setIsAdding(false);
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setDate(item.date);
    setDescription(item.description);
    setUrl(item.url || '');
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setDate(undefined);
    setDescription('');
    setUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline Items
        </h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-4 space-y-4 animate-fade-in">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity or event..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">URL (Optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!date || !description.trim()}>
              {editingId ? 'Update' : 'Add'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No timeline items yet. Add your first item to get started!</p>
          </Card>
        ) : (
          items.map((item, index) => (
            <Card
              key={item.id}
              className="p-4 hover-scale transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">
                      {format(item.date, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
