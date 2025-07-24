import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Task } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export default function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  console.log('📅 [CalendarView] Рендер календаря с задачами:', {
    totalTasks: tasks.length,
    tasksWithDates: tasks.filter(t => t.dueDate).length
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-checked': return 'bg-red-500';
      case 'deputy-checked': return 'bg-orange-500';
      case 'fully-checked': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = subMonths(currentDate, 1);
                console.log('⬅️ [CalendarView] Переход к предыдущему месяцу:', format(newDate, 'LLLL yyyy', { locale: ru }));
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('📅 [CalendarView] Переход к текущему месяцу');
                setCurrentDate(new Date());
              }}
            >
              Сегодня
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = addMonths(currentDate, 1);
                console.log('➡️ [CalendarView] Переход к следующему месяцу:', format(newDate, 'LLLL yyyy', { locale: ru }));
                setCurrentDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Всего задач: {tasks.filter(t => t.dueDate).length}</span>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Header with weekdays */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  bg-white p-2 min-h-[120px] border-r border-b border-gray-100
                  ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                  ${isDayToday ? 'bg-indigo-50 border-indigo-200' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-sm font-medium
                      ${isDayToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                      title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                      onClick={() => {
                        console.log('👆 [CalendarView] Клик по задаче в календаре:', {
                          taskId: task.id,
                          title: task.title,
                          date: task.dueDate,
                          time: task.dueTime
                        });
                        onEditTask(task);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(task.taskStatus)}`}
                        />
                        {task.emoji && (
                          <span className="text-xs">{task.emoji}</span>
                        )}
                        <span className="truncate flex-1">
                          {task.title}
                        </span>
                      </div>
                      {task.dueTime && (
                        <div className="text-gray-500 mt-1">
                          {task.dueTime}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tasks summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium">Не проверена</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {tasks.filter(t => t.taskStatus === 'not-checked' && t.dueDate).length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium">Проверена заместителем</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {tasks.filter(t => t.taskStatus === 'deputy-checked' && t.dueDate).length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">Проверена полностью</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {tasks.filter(t => t.taskStatus === 'fully-checked' && t.dueDate).length}
          </div>
        </Card>
      </div>
    </div>
  );
}