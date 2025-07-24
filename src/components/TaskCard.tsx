import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CalendarDays
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Task } from '../types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSendToCalendar: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onSendToCalendar }: TaskCardProps) {
  console.log('🎴 [TaskCard] Рендер карточки задачи:', {
    id: task.id,
    title: task.title,
    status: task.status,
    taskStatus: task.taskStatus
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-checked': return 'bg-red-500';
      case 'deputy-checked': return 'bg-orange-500';
      case 'fully-checked': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-checked': return 'Не проверена';
      case 'deputy-checked': return 'Проверена заместителем';
      case 'fully-checked': return 'Проверена полностью';
      default: return status;
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'd MMM', { locale: ru });
  };

  const getDueDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-orange-600';
    return 'text-gray-600';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on dropdown menu
    if ((e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]') ||
        (e.target as HTMLElement).closest('[data-radix-dropdown-menu-content]')) {
      return;
    }
    
    console.log('👆 [TaskCard] Клик по карточке для редактирования:', {
      taskId: task.id,
      title: task.title
    });
    onEdit(task);
  };

  const handleMenuClick = (action: string, callback: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log(`🎯 [TaskCard] Клик по кнопке "${action}" в меню:`, {
        taskId: task.id,
        title: task.title
      });
      callback();
    };
  };

  if (isDragging) {
    return (
      <Card 
        ref={setNodeRef} 
        style={style} 
        className="p-4 opacity-50 bg-white border-2 border-dashed border-indigo-300"
      >
        <div className="h-16"></div>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          {task.emoji && (
            <span className="text-lg flex-shrink-0">{task.emoji}</span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 break-words line-clamp-2">{task.title}</h3>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              data-radix-dropdown-menu-trigger
              onClick={(e) => {
                e.stopPropagation();
                console.log('🎯 [TaskCard] Клик по кнопке меню (три точки):', {
                  taskId: task.id,
                  title: task.title
                });
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" data-radix-dropdown-menu-content>
            <DropdownMenuItem 
              onClick={handleMenuClick('Редактировать', () => onEdit(task))}
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleMenuClick('Отправить в календарь', () => onSendToCalendar(task))}
              className="text-indigo-600"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Отправить в календарь
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleMenuClick('Удалить', () => onDelete(task.id))}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${getStatusColor(task.taskStatus)}`}
            title={getStatusLabel(task.taskStatus)}
          />
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span className={getDueDateColor(task.dueDate)}>
              {formatDueDate(task.dueDate)}
            </span>
            {task.dueTime && (
              <>
                <Clock className="w-3 h-3 ml-1" />
                <span className={getDueDateColor(task.dueDate)}>
                  {task.dueTime}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}