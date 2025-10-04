
import React from 'react';
import { AISuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Sparkles, ClipboardList } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApply: (suggestion: AISuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  onClearAll: () => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  onApply,
  onDismiss,
  onClearAll,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-medium">AI Suggestions</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Dismiss All
        </Button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="ai-suggestion border rounded-md p-3"
          >
            <div className="flex items-start gap-2">
              {suggestion.type === 'task' && <ClipboardList className="h-5 w-5 text-purple-500 mt-0.5" />}
              {suggestion.type === 'timeBlock' && <Clock className="h-5 w-5 text-purple-500 mt-0.5" />}
              {suggestion.type === 'schedule' && <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />}
              
              <div className="flex-1">
                <p className="text-sm mb-2">{suggestion.content}</p>
                
                {suggestion.type === 'task' && suggestion.task && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md mb-2">
                    <p className="font-medium text-sm">{suggestion.task.title}</p>
                    {suggestion.task.priority && (
                      <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300">
                        {suggestion.task.priority} priority
                      </span>
                    )}
                  </div>
                )}
                
                {suggestion.type === 'timeBlock' && suggestion.timeBlock && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md mb-2">
                    <p className="font-medium text-sm">{suggestion.timeBlock.title}</p>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {suggestion.timeBlock.startTime} - {suggestion.timeBlock.endTime}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDismiss(suggestion.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onApply(suggestion)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;
