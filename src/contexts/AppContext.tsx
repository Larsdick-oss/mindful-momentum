import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeBlock, UserProfile, Priority } from '@/types';

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  timeBlocks: TimeBlock[];
  setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  completeOnboarding: (priorities: Priority[]) => void;
}

const defaultUserProfile: UserProfile = {
  hasCompletedOnboarding: false,
  priorities: [],
  lastPriorityAudit: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    const saved = localStorage.getItem('timeBlocks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  const addTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: crypto.randomUUID()
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(prev => 
      prev.map(block => block.id === id ? { ...block, ...updates } : block)
    );
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
  };

  const completeOnboarding = (priorities: Priority[]) => {
    setUserProfile({
      hasCompletedOnboarding: true,
      priorities,
      lastPriorityAudit: new Date().toISOString()
    });
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      setUserProfile,
      timeBlocks,
      setTimeBlocks,
      selectedDate,
      setSelectedDate,
      addTimeBlock,
      updateTimeBlock,
      deleteTimeBlock,
      completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
