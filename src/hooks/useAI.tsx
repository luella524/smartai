import { useState, useEffect } from 'react';
import { Task, TimeBlock, AISuggestion } from '../types';
import { format } from 'date-fns';
import { Message } from '@/components/AI/ChatBox';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Create OpenAI client instance 
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Use environment variable
  dangerouslyAllowBrowser: true // This is needed for client-side usage, but be careful with your API key
});

// Function to make API calls to OpenAI
const callOpenAI = async (messages: { role: string; content: string }[]) => {
  try {
    // For development/demo mode without API key, use simulated response
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.log('No API key found, using simulated response');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "I'll help you with your calendar. What would you like to do?",
          actions: []
        }
      };
    }
    
    // Call OpenAI API using the package
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      tools: [
        {
          type: 'function',
          function: {
            name: 'add_calendar_event',
            description: 'Add a new event to the calendar',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Title of the event' },
                date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                startTime: { type: 'string', description: 'Start time in HH:MM format' },
                endTime: { type: 'string', description: 'End time in HH:MM format' },
              },
              required: ['title', 'date']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'edit_calendar_event',
            description: 'Edit an existing event in the calendar',
            parameters: {
              type: 'object',
              properties: {
                eventId: { type: 'string', description: 'ID of the event to edit' },
                title: { type: 'string', description: 'New title of the event' },
                date: { type: 'string', description: 'New date in YYYY-MM-DD format' },
                startTime: { type: 'string', description: 'New start time in HH:MM format' },
                endTime: { type: 'string', description: 'New end time in HH:MM format' },
              },
              required: ['eventId']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'delete_calendar_event',
            description: 'Delete an event from the calendar',
            parameters: {
              type: 'object',
              properties: {
                eventId: { type: 'string', description: 'ID of the event to delete' },
              },
              required: ['eventId']
            }
          }
        }
      ]
    });
    
    return {
      success: true,
      data: {
        message: response.choices[0].message.content || "I'll help with your calendar.",
        tool_calls: response.choices[0].message.tool_calls
      }
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return {
      success: false,
      error: 'Failed to connect to AI service'
    };
  }
};

// Parse AI response to extract action data
const parseAIResponse = (aiResponse: any, userMessage: string) => {
  // If we have a real response from OpenAI with function calls
  if (aiResponse.success && aiResponse.data.tool_calls?.length > 0) {
    const toolCall = aiResponse.data.tool_calls[0];
    
    try {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      let responseMessage = '';
      
      // Handle different function calls
      if (functionName === 'add_calendar_event') {
        responseMessage = `I've scheduled "${functionArgs.title}" for ${functionArgs.date} at ${functionArgs.startTime || '(no time specified)'}. Is there anything else you'd like me to add?`;
        
        return {
          action: {
            type: functionName,
            data: functionArgs
          },
          message: responseMessage
        };
      } else if (functionName === 'edit_calendar_event') {
        responseMessage = `I've updated that event for you. Is there anything else you'd like to change?`;
        
        return {
          action: {
            type: functionName,
            data: functionArgs
          },
          message: responseMessage
        };
      } else if (functionName === 'delete_calendar_event') {
        responseMessage = `I've removed that event from your calendar. Is there anything else you'd like me to help with?`;
        
        return {
          action: {
            type: functionName,
            data: functionArgs
          },
          message: responseMessage
        };
      }
    } catch (e) {
      console.error('Error parsing function call:', e);
    }
  }
  
  // Simple pattern matching for demo mode or fallback
  // Check for scheduling patterns
  if (/schedule|add|create|new meeting|new event/i.test(userMessage)) {
    const dateMatch = userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    const timeMatch = userMessage.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    
    if (dateMatch || timeMatch) {
      const title = userMessage.replace(/schedule|add|create|new meeting|new event/i, '').trim();
      
      return {
        action: {
          type: 'add_calendar_event',
          data: {
            title: title || 'New Event',
            date: dateMatch ? dateMatch[0] : 'today',
            startTime: timeMatch ? timeMatch[0] : '9:00 AM'
          }
        },
        message: `I've scheduled "${title || 'New Event'}" for ${dateMatch ? dateMatch[0] : 'today'} at ${timeMatch ? timeMatch[0] : '9:00 AM'}. Is there anything else you'd like me to add or modify?`
      };
    }
  }
  
  // Check for moving/rescheduling patterns
  if (/move|reschedule|change|update/i.test(userMessage)) {
    const dateMatch = userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    const timeMatch = userMessage.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    
    if (dateMatch || timeMatch) {
      return {
        action: null,
        message: `I'll reschedule that for ${dateMatch ? dateMatch[0] : 'today'} ${timeMatch ? `at ${timeMatch[0]}` : ''}. Consider it done!`
      };
    }
  }
  
  // Check for deletion/cancellation patterns
  if (/cancel|delete|remove/i.test(userMessage)) {
    return {
      action: null,
      message: "I've cancelled that event for you. Is there anything else you'd like me to help with?"
    };
  }
  
  // Default response for other queries
  return {
    action: null,
    message: aiResponse.data.message
  };
};

export const useAI = (tasks: Task[], timeBlocks: TimeBlock[], selectedDate: Date) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  
  // Add a welcome message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "👋 Hi there! I'm your AI calendar assistant. I can help you manage your schedule by adding, removing, or editing events. Try saying something like:\n\n• \"Schedule a meeting with John tomorrow at 2pm\"\n• \"Move my dentist appointment to Friday\"\n• \"What tasks do I have for today?\"\n• \"Cancel my 3pm meeting\"",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);
  
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
  
  // Send a chat message and get AI response
  const sendChatMessage = async (content: string, 
    // Add calendar manipulation functions as parameters with correct signatures
    addTaskFn?: (task: Omit<Task, 'id'>) => void,
    updateTaskFn?: (updatedTask: Task) => void,
    deleteTaskFn?: (taskId: string) => void,
    addTimeBlockFn?: (timeBlock: Omit<TimeBlock, 'id'>) => void,
    updateTimeBlockFn?: (updatedBlock: TimeBlock) => void,
    deleteTimeBlockFn?: (blockId: string) => void
  ) => {
    // Don't send empty messages
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    
    try {
      // Convert messages to format expected by OpenAI
      const messageHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant', 
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({ role: 'user', content });
      
      // Add system message with context
      const systemMessage = {
        role: 'system',
        content: `You are a helpful AI assistant for a calendar application. Today's date is ${format(new Date(), 'PPP')}. Help the user manage their calendar events, tasks, and schedule. The user has ${tasks.length} tasks and ${timeBlocks.length} time blocks scheduled for ${format(selectedDate, 'PPP')}.`
      };
      
      // Call OpenAI with complete message history including system message
      const aiResponse = await callOpenAI([systemMessage, ...messageHistory]);
      
      // Parse the response to get the action and message
      const { action, message } = parseAIResponse(aiResponse, content);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If there's an action to perform, handle it
      if (action) {
        console.log('AI suggested action:', action);
        
        // Create a log entry for this action
        let logEntry = `Action: ${action.type}`;
        
        // Perform the actual action based on type
        if (action.type === 'add_calendar_event' && addTaskFn && addTimeBlockFn) {
          const { title, date, startTime, endTime, priority } = action.data;
          
          // Format the date properly if it's a named day like "today" or "tomorrow"
          let formattedDate = date;
          if (date === 'today') {
            formattedDate = format(new Date(), 'yyyy-MM-dd');
          } else if (date === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            formattedDate = format(tomorrow, 'yyyy-MM-dd');
          } else if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(date)) {
            // Find the next occurrence of the day
            const today = new Date();
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
              .findIndex(day => day === date.toLowerCase());
            
            if (dayOfWeek >= 0) {
              const daysToAdd = (dayOfWeek + 7 - today.getDay()) % 7 || 7;
              const targetDate = new Date();
              targetDate.setDate(today.getDate() + daysToAdd);
              formattedDate = format(targetDate, 'yyyy-MM-dd');
            }
          }
          
          if (startTime && endTime) {
            // If we have both start and end time, create a time block
            const newTimeBlock: Omit<TimeBlock, 'id'> = {
              title,
              date: formattedDate,
              startTime,
              endTime,
              color: '#93C5FD', // Default color
            };
            
            addTimeBlockFn(newTimeBlock);
            logEntry += ` - Added time block: ${title} on ${formattedDate} from ${startTime} to ${endTime}`;
          } else {
            // Otherwise create a task
            const newTask: Omit<Task, 'id'> = {
              title,
              date: formattedDate,
              completed: false,
              priority: priority || 'medium',
              startTime,
              endTime,
            };
            
            addTaskFn(newTask);
            logEntry += ` - Added task: ${title} on ${formattedDate}`;
            
            if (startTime) {
              logEntry += ` at ${startTime}`;
            }
          }
        } else if (action.type === 'edit_calendar_event' && updateTaskFn && updateTimeBlockFn) {
          // Find the event to edit
          // This is simplified - in a real app, you'd need a better way to identify events
          const { eventId, title, date, startTime, endTime } = action.data;
          
          // Try to find the task or time block with a title containing the eventId
          const taskToEdit = tasks.find(t => t.title.toLowerCase().includes(eventId.toLowerCase()));
          const timeBlockToEdit = timeBlocks.find(tb => tb.title.toLowerCase().includes(eventId.toLowerCase()));
          
          if (taskToEdit) {
            // Create updated task with all existing properties plus the changes
            const updatedTask: Task = {
              ...taskToEdit,
              title: title || taskToEdit.title,
              date: date || taskToEdit.date,
              startTime: startTime || taskToEdit.startTime,
              endTime: endTime || taskToEdit.endTime
            };
            
            updateTaskFn(updatedTask);
            logEntry += ` - Updated task ${taskToEdit.id}: ${JSON.stringify(updatedTask)}`;
          } else if (timeBlockToEdit) {
            // Create updated time block with all existing properties plus the changes
            const updatedTimeBlock: TimeBlock = {
              ...timeBlockToEdit,
              title: title || timeBlockToEdit.title,
              date: date || timeBlockToEdit.date,
              startTime: startTime || timeBlockToEdit.startTime,
              endTime: endTime || timeBlockToEdit.endTime
            };
            
            updateTimeBlockFn(updatedTimeBlock);
            logEntry += ` - Updated time block ${timeBlockToEdit.id}: ${JSON.stringify(updatedTimeBlock)}`;
          } else {
            logEntry += ` - Could not find event to edit with identifier: ${eventId}`;
          }
        } else if (action.type === 'delete_calendar_event' && deleteTaskFn && deleteTimeBlockFn) {
          const { eventId } = action.data;
          
          // Try to find the task or time block with a title containing the eventId
          const taskToDelete = tasks.find(t => t.title.toLowerCase().includes(eventId.toLowerCase()));
          const timeBlockToDelete = timeBlocks.find(tb => tb.title.toLowerCase().includes(eventId.toLowerCase()));
          
          if (taskToDelete) {
            deleteTaskFn(taskToDelete.id);
            logEntry += ` - Deleted task ${taskToDelete.id}: ${taskToDelete.title}`;
          } else if (timeBlockToDelete) {
            deleteTimeBlockFn(timeBlockToDelete.id);
            logEntry += ` - Deleted time block ${timeBlockToDelete.id}: ${timeBlockToDelete.title}`;
          } else {
            logEntry += ` - Could not find event to delete with identifier: ${eventId}`;
          }
        } else {
          logEntry += ` - No action taken: Required functions missing or action type not supported`;
        }
        
        // Add to action log
        setActionLog(prev => [...prev, logEntry]);
        console.log(logEntry);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  // Clear the action log
  const clearActionLog = () => {
    setActionLog([]);
  };
  
  return {
    suggestions,
    isGenerating,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    clearAllSuggestions,
    // Chat-related states and functions
    messages,
    isChatLoading,
    sendChatMessage,
    actionLog,
    clearActionLog
  };
};
