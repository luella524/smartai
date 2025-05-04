
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  date: string;
  onGenerateSuggestions: () => void;
  isGenerating: boolean;
}

const Header: React.FC<HeaderProps> = ({ date, onGenerateSuggestions, isGenerating }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-card shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">SmartDay</h1>
        <p className="text-muted-foreground">{date}</p>
      </div>
      <Button 
        onClick={onGenerateSuggestions}
        disabled={isGenerating}
        className="bg-accent hover:bg-accent/90"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? 'Thinking...' : 'Get AI Suggestions'}
      </Button>
    </header>
  );
};

export default Header;
