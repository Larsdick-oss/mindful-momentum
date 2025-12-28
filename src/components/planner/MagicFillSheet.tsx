import { useState, useEffect } from 'react';
import { Sparkles, Brain, ClipboardList, Heart, Gamepad2, Moon, Check, Mic, MicOff, RefreshCw, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { BlockCategory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { toast } from 'sonner';

interface MagicFillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SuggestedBlock {
  title: string;
  category: BlockCategory;
  startTime: string;
  endTime: string;
}

const fallbackBlocks: SuggestedBlock[] = [
  { title: 'Morgenroutine', category: 'rest', startTime: '06:00', endTime: '07:00' },
  { title: 'Deep Work: Hauptprojekt', category: 'focus', startTime: '07:00', endTime: '10:00' },
  { title: 'E-Mails & Admin', category: 'admin', startTime: '10:00', endTime: '11:00' },
  { title: 'Meeting-Block', category: 'social', startTime: '11:00', endTime: '12:00' },
  { title: 'Mittagspause', category: 'play', startTime: '12:00', endTime: '13:00' },
  { title: 'Deep Work: Nebenprojekt', category: 'focus', startTime: '13:00', endTime: '15:00' },
  { title: 'Kreative Zeit', category: 'focus', startTime: '15:00', endTime: '16:00' },
  { title: 'Admin & Wrap-up', category: 'admin', startTime: '16:00', endTime: '17:00' },
  { title: 'Familie & Abendessen', category: 'social', startTime: '17:00', endTime: '19:00' },
  { title: 'Freie Zeit / Hobby', category: 'play', startTime: '19:00', endTime: '21:00' },
  { title: 'Abendroutine', category: 'rest', startTime: '21:00', endTime: '22:00' },
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
  const { addTimeBlock, setTimeBlocks, userProfile } = useApp();
  const [suggestedBlocks, setSuggestedBlocks] = useState<SuggestedBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [addedBlocks, setAddedBlocks] = useState<Set<number>>(new Set());
  
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();

  // Load AI suggestions when sheet opens
  useEffect(() => {
    if (open && suggestedBlocks.length === 0) {
      loadAISuggestions();
    }
  }, [open]);

  // Handle voice input completion
  useEffect(() => {
    if (!isListening && transcript) {
      loadAISuggestions(transcript);
    }
  }, [isListening, transcript]);

  const loadAISuggestions = async (voiceInput?: string) => {
    setIsLoading(true);
    setAddedBlocks(new Set());
    
    try {
      const currentTime = new Date().toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const { data, error } = await supabase.functions.invoke('generate-schedule', {
        body: {
          priorities: userProfile.priorities,
          voiceInput,
          currentTime,
        }
      });

      if (error) throw error;

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestedBlocks(data.suggestions);
        if (voiceInput) {
          toast.success('Vorschläge basierend auf deiner Eingabe erstellt');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      setSuggestedBlocks(fallbackBlocks);
      toast.error('KI-Vorschläge konnten nicht geladen werden. Zeige Standardvorschläge.');
    } finally {
      setIsLoading(false);
      resetTranscript();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const addSingleBlock = (index: number) => {
    const block = suggestedBlocks[index];
    addTimeBlock({
      ...block,
      status: 'planned'
    });
    setAddedBlocks(prev => new Set([...prev, index]));
    toast.success(`"${block.title}" hinzugefügt`);
  };

  const addAllRemaining = async () => {
    setIsApplying(true);
    
    const remainingIndices = suggestedBlocks
      .map((_, i) => i)
      .filter(i => !addedBlocks.has(i));
    
    for (let i = 0; i < remainingIndices.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      const index = remainingIndices[i];
      addTimeBlock({
        ...suggestedBlocks[index],
        status: 'planned'
      });
      setAddedBlocks(prev => new Set([...prev, index]));
    }
    
    setTimeout(() => {
      setIsApplying(false);
      onOpenChange(false);
      toast.success('Alle Blöcke hinzugefügt');
    }, 300);
  };

  const remainingCount = suggestedBlocks.length - addedBlocks.size;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>Intelligenter Tagesplan</SheetTitle>
                <SheetDescription>
                  {isLoading ? 'KI generiert Vorschläge...' : 'Basierend auf deinen Prioritäten'}
                </SheetDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadAISuggestions()}
                disabled={isLoading}
                className="h-9 w-9"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Voice input button - subtle */}
              {isSupported && (
                <Button
                  variant={isListening ? 'default' : 'ghost'}
                  size="icon"
                  onClick={handleVoiceToggle}
                  disabled={isLoading}
                  className={`h-9 w-9 transition-all ${isListening ? 'bg-primary text-primary-foreground animate-pulse' : ''}`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Voice transcript display */}
          <AnimatePresence>
            {(isListening || transcript) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-muted rounded-lg"
              >
                <p className="text-sm text-muted-foreground">
                  {isListening ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      {transcript || 'Höre zu...'}
                    </span>
                  ) : (
                    transcript
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Erstelle personalisierte Vorschläge...</p>
            </div>
          ) : (
            suggestedBlocks.map((block, index) => {
              const Icon = categoryIcons[block.category];
              const isAdded = addedBlocks.has(index);
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isAdded ? 0.5 : 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => !isAdded && addSingleBlock(index)}
                  disabled={isAdded}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isAdded 
                      ? 'bg-muted border-border cursor-default'
                      : `${categoryColors[block.category]} hover:scale-[1.02] active:scale-[0.98]`
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isAdded ? 'bg-muted' : ''
                  }`}>
                    {isAdded ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium text-sm ${isAdded ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {block.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {block.startTime} – {block.endTime}
                    </p>
                  </div>
                  {isAdded && (
                    <span className="text-xs text-muted-foreground">Hinzugefügt</span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        <div className="flex gap-3 pt-4 pb-safe border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Schließen
          </Button>
          <Button
            onClick={addAllRemaining}
            className="flex-1"
            disabled={remainingCount === 0 || isApplying || isLoading}
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Füge hinzu...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Alle hinzufügen ({remainingCount})
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
