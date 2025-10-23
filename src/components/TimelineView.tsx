import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TimelineItem } from '@/hooks/useTimelineItems';
import { toSentenceCase } from '@/lib/sentenceCase';

interface TimelineViewProps {
  items: TimelineItem[];
}

export const TimelineView = ({ items }: TimelineViewProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No timeline items available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

      <div className="space-y-8">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative pl-16 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Timeline dot */}
            <div className="absolute left-[18px] top-2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{format(item.date, 'EEEE, MMMM d, yyyy')}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {toSentenceCase(item.description)}
              </p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
