import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeBlockCard } from './TimeBlockCard';
import { AddBlockSheet } from './AddBlockSheet';
import { MagicFillSheet } from './MagicFillSheet';
import { useApp } from '@/contexts/AppContext';
import { TimeBlock } from '@/types';
import { motion } from 'framer-motion';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView() {
  const { selectedDate, setSelectedDate, timeBlocks } = useApp();
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showMagicFill, setShowMagicFill] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const dayBlocks = timeBlocks.filter(block => {
    // In a real app, you'd filter by date
    return true;
  });

  const getBlockForHour = (hour: number): TimeBlock | undefined => {
    return dayBlocks.find(block => {
      const startHour = parseInt(block.startTime.split(':')[0]);
      const endHour = parseInt(block.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const isBlockStart = (hour: number): boolean => {
    return dayBlocks.some(block => {
      const startHour = parseInt(block.startTime.split(':')[0]);
      return hour === startHour;
    });
  };

  const getBlockHeight = (block: TimeBlock): number => {
    const startHour = parseInt(block.startTime.split(':')[0]);
    const endHour = parseInt(block.endTime.split(':')[0]);
    return endHour - startHour;
  };

  const handleHourClick = (hour: number) => {
    if (!getBlockForHour(hour)) {
      setSelectedHour(hour);
      setShowAddBlock(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 pt-safe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {format(selectedDate, 'EEEE', { locale: de })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'd. MMMM', { locale: de })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(new Date())}
            className="text-primary"
          >
            <span className="text-sm font-medium">Heute</span>
          </Button>
        </div>
      </header>

      {/* Magic Fill Button */}
      <div className="px-4 py-3">
        <Button
          onClick={() => setShowMagicFill(true)}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Tag planen
        </Button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-safe">
        <div className="relative">
          {HOURS.map((hour) => {
            const block = getBlockForHour(hour);
            const isStart = isBlockStart(hour);

            return (
              <div key={hour} className="relative">
                {/* Hour label */}
                <div className="flex items-start h-16">
                  <div className="w-12 text-xs text-muted-foreground pt-1 flex-shrink-0">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {/* Hour slot */}
                  <div 
                    className="flex-1 border-t border-border h-full relative"
                    onClick={() => handleHourClick(hour)}
                  >
                    {isStart && block && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-x-0 z-10"
                        style={{ height: `${getBlockHeight(block) * 64}px` }}
                      >
                        <TimeBlockCard block={block} />
                      </motion.div>
                    )}
                    
                    {!block && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg mb-safe"
        onClick={() => {
          setSelectedHour(null);
          setShowAddBlock(true);
        }}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <AddBlockSheet 
        open={showAddBlock} 
        onOpenChange={setShowAddBlock}
        defaultHour={selectedHour}
      />
      
      <MagicFillSheet
        open={showMagicFill}
        onOpenChange={setShowMagicFill}
      />
    </div>
  );
}
