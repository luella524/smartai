import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Sparkles, Zap, Calendar, Clock, Sun, Moon, Star, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5 
          }}
          animate={{ 
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: Math.random() * 20 + 15, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        >
          {i % 5 === 0 ? (
            <Calendar className="text-indigo-500 h-5 w-5" />
          ) : i % 5 === 1 ? (
            <Clock className="text-purple-500 h-4 w-4" />
          ) : i % 5 === 2 ? (
            <Star className="text-yellow-500 h-3 w-3" />
          ) : i % 5 === 3 ? (
            <Wand2 className="text-pink-500 h-5 w-5" />
          ) : (
            <Sparkles className="text-cyan-500 h-4 w-4" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const suggestionMessages = [
    "Schedule a meeting tomorrow at 2pm",
    "Move my dentist appointment to Friday",
    "What events do I have next week?",
    "Add a lunch break at 1pm today",
    "Cancel my evening plans",
    "Remind me about project deadline"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator for assistant messages
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
    } else {
      // Keep typing indicator for a bit after response comes in
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Hide welcome animation after 3 seconds
  useEffect(() => {
    if (showWelcomeAnimation) {
      const timer = setTimeout(() => {
        setShowWelcomeAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeAnimation]);

  const messageBubbleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden relative bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
      {showWelcomeAnimation && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          onAnimationComplete={() => setShowWelcomeAnimation(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, times: [0, 0.2, 0.5, 1] }}
              className="relative"
            >
              <Calendar className="h-20 w-20 text-white" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: 1,
                  repeatType: "reverse"
                }}
                className="absolute top-0 right-0"
              >
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      <FloatingElements />
      
      <div className="absolute top-3 right-3 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ rotate: isDarkMode ? -10 : 10 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>
      </div>

      <div className="px-4 py-3 border-b dark:border-gray-700/30 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjUsMzAgTDc1LDMwIE01MCwzMCBMNTAsNzAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-20" />
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center relative"
        >
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 1 }}
            className="mr-3 bg-white p-2 rounded-lg shadow-lg"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 20, 
                ease: "linear", 
                repeat: Infinity 
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-[2px] opacity-50" />
              <Calendar className="h-8 w-8 text-indigo-600 relative z-10" />
            </motion.div>
          </motion.div>
          
          <div>
            <motion.h3 
              className="text-xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Lisa AI 
            </motion.h3>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-[2px] bg-gradient-to-r from-white/30 to-transparent rounded-full"
            />
          </div>
          
          <motion.div 
            className="ml-auto"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-inner"
            >
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                </motion.div>
                <span className="text-xs font-medium text-white tracking-wide">AI Powered</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-5 bg-gradient-to-b from-white/80 to-white dark:from-gray-800/70 dark:to-gray-800">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10"
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-5 relative"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-[15px] opacity-30" />
                  <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Hey there! I'm your AI Calendar Assistant
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Ask me to help manage your calendar by adding, removing, or editing events
                </motion.p>
                
                <motion.div
                  className="mt-6 space-y-3 max-w-[280px] mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {suggestionMessages.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        backgroundColor: "#f5f3ff"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-sm px-4 py-2.5 bg-white dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 shadow-sm border border-indigo-100 dark:border-gray-600 cursor-pointer flex items-center gap-2"
                    >
                      <div className="rounded-full bg-indigo-100 dark:bg-indigo-800/40 p-1">
                        {index % 3 === 0 ? (
                          <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : index % 3 === 1 ? (
                          <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      {suggestion}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={messageBubbleVariants}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200, 
                    damping: 20
                  }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center mb-1.5">
                      {message.role === 'assistant' ? (
                        <motion.div 
                          whileHover={{ rotate: 10 }}
                          className="flex items-center"
                        >
                          <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-1.5">
                            <Bot className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs font-semibold">
                            Assistant
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          whileHover={{ rotate: -10 }}
                          className="flex items-center"
                        >
                          <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-1.5">
                            <User className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span className="text-xs font-semibold">
                            You
                          </span>
                        </motion.div>
                      )}
                      <span className="text-[10px] ml-auto opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm">
                  <div className="flex items-center mb-1.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-1.5">
                      <Bot className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs font-semibold">
                      Assistant
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-indigo-600"
                      />
                    </div>
                    <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 border-t border-indigo-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/95 backdrop-blur">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="text-indigo-400 dark:text-indigo-300"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
          </div>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your AI assistant..."
            disabled={isLoading}
            className="pl-12 pr-12 py-6 rounded-xl border-indigo-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-inner"
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2"
          >
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </motion.div>
        </form>
        
        <motion.div 
          className="text-xs text-center mt-2.5 text-indigo-400 dark:text-indigo-300 font-medium"
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ✨ Smart scheduling powered by AI ✨
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatBox; 