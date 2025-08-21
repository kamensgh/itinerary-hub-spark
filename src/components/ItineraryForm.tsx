import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreateItineraryData } from '@/hooks/useItineraries';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed']).default('planning'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  locations: z.string().optional(),
  image: z.string().default('gradient-sky'),
});

type FormData = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItineraryData) => Promise<void>;
  initialData?: Partial<CreateItineraryData>;
  title: string;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      locations: '',
      image: 'gradient-sky',
    },
  });

  // Reset form with initial data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'planning',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        locations: initialData.locations?.join(', ') || '',
        image: initialData.image || 'gradient-sky',
      });
    } else if (isOpen && !initialData) {
      // Reset to empty form for new itinerary
      form.reset({
        title: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        locations: '',
        image: 'gradient-sky',
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      const formattedData: CreateItineraryData = {
        title: data.title,
        description: data.description,
        status: data.status,
        image: data.image,
        locations: data.locations ? data.locations.split(',').map(loc => loc.trim()).filter(Boolean) : [],
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      };
      
      await onSubmit(formattedData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const imageOptions = [
    { value: 'gradient-sky', label: 'Sky Blue' },
    { value: 'gradient-sunset', label: 'Sunset Orange' },
    { value: 'gradient-ocean', label: 'Ocean Blue' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter trip title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your trip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locations</FormLabel>
                  <FormControl>
                    <Input placeholder="Tokyo, Kyoto, Osaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {imageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryForm;