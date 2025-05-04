
import { useState } from 'react';
import { Task, TimeBlock, AISuggestion } from '../types';
import { format } from 'date-fns';

export const useAI = (tasks: Task[], timeBlocks: TimeBlock[], selectedDate: Date) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate AI suggestions based on tasks and time blocks
  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // In a real app, this would be an API call to an AI service
    // For demo purposes, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'timeBlock',
        content: 'I notice you have a free slot in the morning. Would you like to schedule some focus time from 8:00 to 9:00 AM before your team meeting?',
        timeBlock: {
          title: 'Focus Time',
          startTime: '08:00',
          endTime: '09:00',
          date: format(selectedDate, 'yyyy-MM-dd'),
        }
      },
      {
        id: '2',
        type: 'task',
        content: 'You might want to prepare for your team meeting. Would you like me to add a preparation task?',
        task: {
          title: 'Prepare for team meeting',
          date: format(selectedDate, 'yyyy-MM-dd'),
          priority: 'high',
          completed: false,
        }
      },
      {
        id: '3',
        type: 'schedule',
        content: 'I\'ve noticed you often schedule workouts in the evening. Would you like to continue this habit today?',
      }
    ];
    
    setSuggestions(mockSuggestions);
    setIsGenerating(false);
  };
  
  // Apply a suggestion
  const applySuggestion = (suggestion: AISuggestion) => {
    // This would actually create the task or time block
    // For demo purposes, we'll just remove the suggestion
    setSuggestions(prevSuggestions => 
      prevSuggestions.filter(s => s.id !== suggestion.id)
    );
  };
  
  // Dismiss a suggestion
  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.filter(s => s.id !== suggestionId)
    );
  };
  
  // Clear all suggestions
  const clearAllSuggestions = () => {
    setSuggestions([]);
  };
  
  return {
    suggestions,
    isGenerating,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    clearAllSuggestions
  };
};
