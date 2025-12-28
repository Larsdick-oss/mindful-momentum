import { useState } from 'react';
import { Sparkles, Brain, ClipboardList, Heart, Gamepad2, Moon, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { BlockCategory } from '@/types';
import { motion } from 'framer-motion';

interface MagicFillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestedBlocks = [
  { title: 'Morgenroutine', category: 'rest' as BlockCategory, startTime: '06:00', endTime: '07:00' },
  { title: 'Deep Work: Hauptprojekt', category: 'focus' as BlockCategory, startTime: '07:00', endTime: '10:00' },
  { title: 'E-Mails & Admin', category: 'admin' as BlockCategory, startTime: '10:00', endTime: '11:00' },
  { title: 'Meeting-Block', category: 'social' as BlockCategory, startTime: '11:00', endTime: '12:00' },
  { title: 'Mittagspause', category: 'play' as BlockCategory, startTime: '12:00', endTime: '13:00' },
  { title: 'Deep Work: Nebenprojekt', category: 'focus' as BlockCategory, startTime: '13:00', endTime: '15:00' },
  { title: 'Kreative Zeit', category: 'focus' as BlockCategory, startTime: '15:00', endTime: '16:00' },
  { title: 'Admin & Wrap-up', category: 'admin' as BlockCategory, startTime: '16:00', endTime: '17:00' },
  { title: 'Familie & Abendessen', category: 'social' as BlockCategory, startTime: '17:00', endTime: '19:00' },
  { title: 'Freie Zeit / Hobby', category: 'play' as BlockCategory, startTime: '19:00', endTime: '21:00' },
  { title: 'Abendroutine', category: 'rest' as BlockCategory, startTime: '21:00', endTime: '22:00' },
];

const categoryIcons: Record<BlockCategory, typeof Brain> = {
  focus: Brain,
  admin: ClipboardList,
  social: Heart,
  play: Gamepad2,
  rest: Moon
};

const categoryColors: Record<BlockCategory, string> = {
  focus: 'bg-category-focus/10 text-category-focus border-category-focus/20',
  admin: 'bg-category-admin/10 text-category-admin border-category-admin/20',
  social: 'bg-category-social/10 text-category-social border-category-social/20',
  play: 'bg-category-play/10 text-category-play border-category-play/20',
  rest: 'bg-category-rest/10 text-category-rest border-category-rest/20'
};

export function MagicFillSheet({ open, onOpenChange }: MagicFillSheetProps) {
  const { addTimeBlock, setTimeBlocks } = useApp();
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const toggleBlock = (index: number) => {
    setSelectedBlocks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAll = () => {
    setSelectedBlocks(suggestedBlocks.map((_, i) => i));
  };

  const handleApply = async () => {
    setIsApplying(true);
    
    // Clear existing blocks and add selected ones
    setTimeBlocks([]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    selectedBlocks.forEach((index, i) => {
      setTimeout(() => {
        addTimeBlock({
          ...suggestedBlocks[index],
          status: 'planned'
        });
      }, i * 100);
    });
    
    setTimeout(() => {
      setIsApplying(false);
      setSelectedBlocks([]);
      onOpenChange(false);
    }, selectedBlocks.length * 100 + 300);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Intelligenter Tagesplan</SheetTitle>
              <SheetDescription>Basierend auf deinen Prioritäten</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {suggestedBlocks.map((block, index) => {
            const Icon = categoryIcons[block.category];
            const isSelected = selectedBlocks.includes(index);
            
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleBlock(index)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? categoryColors[block.category] + ' border-2'
                    : 'bg-card border-border hover:bg-muted'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? '' : 'bg-muted'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">{block.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {block.startTime} – {block.endTime}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 pb-safe border-t border-border">
          <Button
            variant="outline"
            onClick={selectAll}
            className="flex-1"
          >
            Alle auswählen
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={selectedBlocks.length === 0 || isApplying}
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                Plane...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Anwenden ({selectedBlocks.length})
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
