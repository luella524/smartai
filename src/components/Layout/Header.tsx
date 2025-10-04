import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ClipboardList, Bug, Calendar, ArrowRight, Bot, Zap, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  // No props needed for the centered header
}

const Header: React.FC<HeaderProps> = () => {
  const headerGradient = {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(251, 191, 36, 0.1) 75%, rgba(34, 197, 94, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const logoGradient = {
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
    backgroundSize: '300% 300%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradientShift 3s ease infinite',
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden border-b border-white/20"
      style={headerGradient}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * 200,
              scale: Math.random() * 2 + 0.5
            }}
            animate={{ 
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              rotate: [0, 360],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-4">
        {/* Main Title Section */}
        <motion.div 
          className="flex items-center justify-center mb-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            whileHover={{ 
              rotate: [0, -15, 15, -10, 0], 
              scale: 1.1,
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="relative mr-6"
          >
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            
            {/* Robot Container */}
            <motion.div
              className="relative p-3 rounded-2xl"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bot className="h-7 w-7 text-purple-600" />
              
              {/* Floating Icons */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-3 w-3 text-yellow-400" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-1 -left-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-2 w-2 text-blue-500" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          <div className="flex items-center">
            <motion.h1 
              className="text-2xl font-black tracking-tight"
              style={logoGradient}
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              Lisa AI
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="ml-3 px-3 py-1 rounded-full"
            >
              <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Personal AI Assistant
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Daily Affirmation Section */}
        <motion.div 
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-xl p-4 border border-white/30 shadow-xl backdrop-blur-sm overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse" />
            </div>
            
            <div className="relative z-10 text-center">
              <motion.div 
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <Heart className="h-4 w-4 text-pink-500 mr-2" />
                <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Daily Affirmation
                </h3>
                <Star className="h-4 w-4 text-yellow-500 ml-2" />
              </motion.div>
              
              <motion.p 
                className="text-sm text-gray-700 font-medium italic whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                "Today I will embrace challenges as opportunities for growth and approach each moment with gratitude and purpose. ✨"
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
