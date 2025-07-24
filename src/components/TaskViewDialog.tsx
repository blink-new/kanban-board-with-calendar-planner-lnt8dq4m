import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CalendarDays,
  CheckSquare
} from 'lucide-react';
import { Task } from '../types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSendToCalendar: (task: Task) => void;
}

export default function TaskViewDialog({ 
  open, 
  onOpenChange, 
  task, 
  onEdit, 
  onDelete, 
  onSendToCalendar 
}: TaskViewDialogProps) {
  if (!task) return null;

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
      case 'not-checked': return 'Не проверена руководителем и заместителем';
      case 'deputy-checked': return 'Проверена только заместителем';
      case 'fully-checked': return 'Проверена руководителем и заместителем';
      default: return status;
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'd MMMM yyyy', { locale: ru });
  };

  const getDueDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getPlatformsList = () => {
    const platforms = [];
    if (task.platforms.vkOk) platforms.push('ВК/Ок');
    if (task.platforms.website) platforms.push('Сайт');
    if (task.platforms.telegram) platforms.push('Telegram');
    return platforms;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.emoji && <span className="text-xl">{task.emoji}</span>}
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Статус задачи */}
          <div className="flex items-center gap-3">
            <div 
              className={`w-4 h-4 rounded-full ${getStatusColor(task.taskStatus)}`}
            />
            <span className="text-sm text-gray-600">
              {getStatusLabel(task.taskStatus)}
            </span>
          </div>

          {/* Описание */}
          {task.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Описание</h4>
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {task.description}
              </p>
            </div>
          )}

          {/* Платформы */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Платформы
            </h4>
            <div className="flex flex-wrap gap-2">
              {getPlatformsList().length > 0 ? (
                getPlatformsList().map((platform) => (
                  <Badge key={platform} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {platform}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Платформы не выбраны</span>
              )}
            </div>
          </div>

          {/* Дата и время */}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className={`text-sm ${getDueDateColor(task.dueDate)}`}>
                {formatDueDate(task.dueDate)}
              </span>
              {task.dueTime && (
                <>
                  <Clock className="w-4 h-4 text-gray-500 ml-2" />
                  <span className={`text-sm ${getDueDateColor(task.dueDate)}`}>
                    {task.dueTime}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Дата создания */}
          <div className="text-xs text-gray-500">
            Создано: {format(new Date(task.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </div>
        </div>

        {/* Действия */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onEdit(task);
                onOpenChange(false);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onSendToCalendar(task);
                onOpenChange(false);
              }}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              В календарь
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}