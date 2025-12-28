import { useState } from 'react';
import { Check, X, Brain, ClipboardList, Heart, Gamepad2, Moon } from 'lucide-react';
import { TimeBlock, BlockCategory, CATEGORY_LABELS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface TimeBlockCardProps {
  block: TimeBlock;
}

const categoryIcons: Record<BlockCategory, typeof Brain> = {
  focus: Brain,
  admin: ClipboardList,
  social: Heart,
  play: Gamepad2,
  rest: Moon
};

const categoryStyles: Record<BlockCategory, string> = {
  focus: 'bg-category-focus text-category-focus-foreground',
  admin: 'bg-category-admin text-category-admin-foreground',
  social: 'bg-category-social text-category-social-foreground',
  play: 'bg-category-play text-category-play-foreground',
  rest: 'bg-category-rest text-category-rest-foreground'
};

export function TimeBlockCard({ block }: TimeBlockCardProps) {
  const { updateTimeBlock, deleteTimeBlock } = useApp();
  const Icon = categoryIcons[block.category];

  const handleMarkComplete = () => {
    updateTimeBlock(block.id, { status: 'completed' });
  };

  const handleMarkDistracted = () => {
    updateTimeBlock(block.id, { status: 'distracted' });
  };

  const handleDelete = () => {
    deleteTimeBlock(block.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            'h-full rounded-xl p-3 shadow-sm cursor-pointer transition-all hover:shadow-md',
            categoryStyles[block.category],
            block.status === 'completed' && 'opacity-70',
            block.status === 'distracted' && 'opacity-50 border-2 border-destructive'
          )}
        >
          <div className="flex items-start justify-between h-full">
            <div className="flex items-start gap-2">
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm leading-tight">{block.title}</p>
                <p className="text-xs opacity-80 mt-0.5">
                  {block.startTime} – {block.endTime}
                </p>
              </div>
            </div>
            
            {block.status === 'completed' && (
              <Check className="w-4 h-4" />
            )}
            {block.status === 'distracted' && (
              <X className="w-4 h-4" />
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={handleMarkComplete}>
          <Check className="w-4 h-4 mr-2" />
          Als erledigt markieren
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMarkDistracted}>
          <X className="w-4 h-4 mr-2" />
          Als Ablenkung markieren
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          Löschen
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
