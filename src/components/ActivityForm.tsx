import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import type { Activity, CreateActivityData } from "@/hooks/useActivities";

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityData) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  activity?: Activity;
  isEditing?: boolean;
}

const activityTypes = [
  { value: 'attraction', label: 'Attraction' },
  { value: 'food', label: 'Restaurant/Food' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'nature', label: 'Nature/Outdoor' },
  { value: 'culture', label: 'Culture/Museum' },
  { value: 'sports', label: 'Sports/Recreation' },
  { value: 'other', label: 'Other' },
];

const priceRanges = [
  { value: 'free', label: 'Free' },
  { value: '$', label: '$ - Budget friendly' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Very expensive' },
];

export const ActivityForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onImageUpload, 
  activity, 
  isEditing = false 
}: ActivityFormProps) => {
  const [formData, setFormData] = useState<CreateActivityData>({
    name: activity?.name || '',
    description: activity?.description || '',
    activity_type: activity?.activity_type || 'attraction',
    start_time: activity?.start_time || '',
    end_time: activity?.end_time || '',
    date: activity?.date || '',
    address: activity?.address || '',
    website_url: activity?.website_url || '',
    phone: activity?.phone || '',
    price_range: activity?.price_range || '',
    notes: activity?.notes || '',
    image_url: activity?.image_url || '',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(activity?.image_url || '');

  const handleInputChange = (field: keyof CreateActivityData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if a new one was selected
      if (imageFile) {
        setUploading(true);
        const uploadedUrl = await onImageUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
        setUploading(false);
      }

      await onSubmit({ ...formData, image_url: imageUrl });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        activity_type: 'attraction',
        start_time: '',
        end_time: '',
        date: '',
        address: '',
        website_url: '',
        phone: '',
        price_range: '',
        notes: '',
        image_url: '',
      });
      setImageFile(null);
      setPreviewUrl('');
      onClose();
    } catch (error) {
      console.error('Error submitting activity:', error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          <DialogDescription>
            Fill in the details for this activity. All fields are optional except the name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Activity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Visit Eiffel Tower"
                required
              />
            </div>

            <div>
              <Label htmlFor="activity_type">Category</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => handleInputChange('activity_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_range">Price Range</Label>
              <Select
                value={formData.price_range}
                onValueChange={(value) => handleInputChange('price_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the activity..."
              rows={3}
            />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address or location"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contact number"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Activity Image</Label>
            <div className="mt-2">
              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Activity preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information, tips, or reminders..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || uploading || !formData.name.trim()}
            >
              {submitting || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                isEditing ? 'Update Activity' : 'Add Activity'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};