import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ClipboardList, Bug, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  // No props needed for the centered header
}

const Header: React.FC<HeaderProps> = () => {
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
      className="flex flex-col items-center px-6 py-5 shadow-xl border-b border-indigo-200/50 bg-opacity-95 backdrop-blur-lg sticky top-0 z-10"
      style={headerGradient}
    >
      {/* Centered Title */}
      <motion.div 
        className="flex items-center justify-center mb-3"
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="mr-4 p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-lg relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
          <Calendar className="h-8 w-8 text-indigo-600 relative z-10" />
        </motion.div>
        <div className="flex items-center">
          <h1 className="text-3xl font-bold tracking-tight" style={logoGradient}>Lisa AI - Your Personal AI assistant</h1>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="ml-3 px-3 py-1 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full border border-indigo-300/50 shadow-sm"
          >
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Pro</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Centered Daily Affirmation */}
      <motion.div 
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50 text-center shadow-sm">
          <h3 className="text-base font-bold text-purple-800 mb-2">Daily Affirmation</h3>
          <p className="text-sm text-purple-700 italic whitespace-nowrap">"Today I will embrace challenges as opportunities for growth and approach each moment with gratitude and purpose."</p>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
