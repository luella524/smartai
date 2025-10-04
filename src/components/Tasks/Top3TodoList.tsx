import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  priority: string;
}

interface Top3TodoListProps {
  tasks: Task[];
  weekProgress: { completed: number; total: number; rate: number };
}

const Top3TodoList: React.FC<Top3TodoListProps> = ({ tasks, weekProgress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center">
            <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
            Top 3 This Week
            <Badge variant="secondary" className="ml-2 text-xs">
              {weekProgress.completed}/{weekProgress.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-600 mr-2">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-gray-800 flex-1">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Circle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">No tasks for this week</p>
              <p className="text-xs text-gray-400">Add some tasks to see them here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Top3TodoList;
