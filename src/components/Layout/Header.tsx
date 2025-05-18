import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ClipboardList, Bug, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  date: string;
  onGenerateSuggestions: () => void;
  isGenerating: boolean;
  showActionLog?: boolean;
  onToggleActionLog?: () => void;
  onDebugContext?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  date, 
  onGenerateSuggestions, 
  isGenerating,
  showActionLog = false,
  onToggleActionLog,
  onDebugContext
}) => {
  const headerGradient = {
    background: 'linear-gradient(to right, rgba(252,252,255,0.95), rgba(248,250,255,0.92))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  const logoGradient = {
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between px-5 py-3 shadow-lg border-b border-indigo-100 bg-opacity-90 backdrop-blur-md sticky top-0 z-10"
      style={headerGradient}
    >
      <motion.div 
        className="flex items-center"
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="mr-3 p-2.5 bg-gradient-to-br from-indigo-100 to-white rounded-xl shadow-md relative group"
        >
          <div className="absolute inset-0 bg-indigo-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
          <Calendar className="h-7 w-7 text-indigo-600 relative z-10" />
        </motion.div>
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight" style={logoGradient}>AI Calendar Assistant</h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="ml-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200"
            >
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest">Pro</span>
            </motion.div>
          </div>
          <div className="flex items-center">
            <p className="text-sm font-medium text-indigo-900/70">{date}</p>
            <div className="flex items-center ml-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"
              />
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="flex gap-3 items-center">
        <motion.div 
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.97 }} 
          className="relative group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
          <Button 
            onClick={onGenerateSuggestions}
            disabled={isGenerating}
            className="relative z-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 rounded-full px-4 py-5 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span>Thinking...</span>
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Get AI Ideas</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-1 opacity-70"
                >
                  <ArrowRight className="h-3 w-3" />
                </motion.div>
              </span>
            )}
          </Button>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.97 }}
          className="relative"
        >
          <Button
            variant="outline"
            className="flex items-center rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white/80 backdrop-blur-sm shadow px-4 py-5"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with AI
          </Button>
        </motion.div>
        
        {onToggleActionLog && (
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant={showActionLog ? "default" : "outline"}
              className={`flex items-center rounded-full shadow px-4 py-5 ${
                showActionLog 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-white/80 backdrop-blur-sm border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={onToggleActionLog}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Activity
            </Button>
          </motion.div>
        )}
        
        {onDebugContext && (
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              className="flex items-center rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white/80 backdrop-blur-sm shadow px-4 py-5"
              onClick={onDebugContext}
            >
              <Bug className="mr-2 h-4 w-4 text-amber-500" />
              Debug
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
