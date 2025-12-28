import { useState, useEffect } from 'react';
import { Brain, ClipboardList, Heart, Gamepad2, Moon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlockCategory, CATEGORY_LABELS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface AddBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultHour?: number | null;
}

const categories: { id: BlockCategory; icon: typeof Brain; label: string }[] = [
  { id: 'focus', icon: Brain, label: 'Deep Focus' },
  { id: 'admin', icon: ClipboardList, label: 'Admin' },
  { id: 'social', icon: Heart, label: 'Soziales' },
  { id: 'play', icon: Gamepad2, label: 'Spiel & Erholung' },
  { id: 'rest', icon: Moon, label: 'Schlaf/Puffer' },
];

const categoryStyles: Record<BlockCategory, string> = {
  focus: 'border-category-focus bg-category-focus/10 text-category-focus',
  admin: 'border-category-admin bg-category-admin/10 text-category-admin',
  social: 'border-category-social bg-category-social/10 text-category-social',
  play: 'border-category-play bg-category-play/10 text-category-play',
  rest: 'border-category-rest bg-category-rest/10 text-category-rest'
};

export function AddBlockSheet({ open, onOpenChange, defaultHour }: AddBlockSheetProps) {
  const { addTimeBlock } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('focus');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (defaultHour !== null && defaultHour !== undefined) {
      setStartTime(`${defaultHour.toString().padStart(2, '0')}:00`);
      setEndTime(`${(defaultHour + 1).toString().padStart(2, '0')}:00`);
    }
  }, [defaultHour]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    addTimeBlock({
      title: title.trim(),
      category,
      startTime,
      endTime,
      status: 'planned'
    });
    
    setTitle('');
    setCategory('focus');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Neuer Zeitblock</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-safe">
          <div className="space-y-2">
            <Label>Was möchtest du tun?</Label>
            <Input
              placeholder="z.B. Deep Work an Projekt X"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Kategorie</Label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                    category === id 
                      ? categoryStyles[id]
                      : 'border-border bg-card hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ende</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!title.trim()}
          >
            Block hinzufügen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
