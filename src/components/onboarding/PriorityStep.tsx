import { useState } from 'react';
import { LucideIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Priority } from '@/types';
import { motion } from 'framer-motion';

interface PriorityStepProps {
  domain: 'you' | 'relationships' | 'work';
  icon: LucideIcon;
  title: string;
  examples: string[];
  priorities: Priority[];
  onPriorityChange: (priorities: Priority[]) => void;
}

export function PriorityStep({
  domain,
  icon: Icon,
  title,
  examples,
  priorities,
  onPriorityChange
}: PriorityStepProps) {
  const [newPriorityName, setNewPriorityName] = useState('');

  const addPriority = (name: string) => {
    if (!name.trim()) return;
    const newPriority: Priority = {
      id: crypto.randomUUID(),
      domain,
      name: name.trim(),
      weight: 3
    };
    onPriorityChange([...priorities, newPriority]);
    setNewPriorityName('');
  };

  const removePriority = (id: string) => {
    onPriorityChange(priorities.filter(p => p.id !== id));
  };

  const updateWeight = (id: string, weight: number) => {
    onPriorityChange(priorities.map(p => 
      p.id === id ? { ...p, weight } : p
    ));
  };

  return (
    <div className="flex-1 flex flex-col py-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">What matters most to you?</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {priorities.map((priority, index) => (
          <motion.div
            key={priority.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">{priority.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePriority(priority.id)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-8">Low</span>
              <Slider
                value={[priority.weight]}
                onValueChange={([value]) => updateWeight(priority.id, value)}
                min={1}
                max={5}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">High</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex gap-2">
          <Input
            placeholder="Add a priority..."
            value={newPriorityName}
            onChange={(e) => setNewPriorityName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPriority(newPriorityName)}
            className="flex-1"
          />
          <Button
            onClick={() => addPriority(newPriorityName)}
            size="icon"
            disabled={!newPriorityName.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-3">Suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {examples.filter(ex => !priorities.some(p => p.name === ex)).map((example) => (
            <button
              key={example}
              onClick={() => addPriority(example)}
              className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              + {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
