import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Smile, CheckSquare, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { Task, Column } from '../types';
import { useToast } from './ui/toast';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task | Omit<Task, 'id'>) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
  onReturnToBoard?: (task: Task) => Promise<void> | void;
  task?: Task | null;
  columns: Column[];
  isCalendarView?: boolean;
}

const EMOJI_LIST = [
  '📝', '💡', '🎯', '🚀', '⭐', '🔥', '💪', '🎨', '🔧', '📊',
  '📱', '💻', '🌟', '⚡', '🎉', '🏆', '📈', '🔍', '💰', '🎪',
  '🌈', '🎭', '🎪', '🎨', '🎵', '🎬', '📚', '✨', '🌸', '🍀',
  '🎈', '🎁', '🎂', '🍕', '☕', '🌮', '🍎', '🥑', '🍓', '🥕'
];

export default function TaskEditDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  onDelete,
  onReturnToBoard,
  task, 
  columns,
  isCalendarView = false
}: TaskEditDialogProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '',
    status: 'todo',
    taskStatus: 'not-checked' as 'not-checked' | 'deputy-checked' | 'fully-checked',
    platforms: {
      vkOk: false,
      website: false,
      telegram: false,
    },
    dueDate: '',
    dueTime: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        emoji: task.emoji || '',
        status: task.status,
        taskStatus: task.taskStatus,
        platforms: task.platforms,
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        emoji: '',
        status: 'todo',
        taskStatus: 'not-checked',
        platforms: {
          vkOk: false,
          website: false,
          telegram: false,
        },
        dueDate: '',
        dueTime: '',
      });
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('💾 [TaskEditDialog] Начало сохранения задачи:', {
      isEdit: !!task,
      taskId: task?.id,
      formData: {
        title: formData.title,
        status: formData.status,
        taskStatus: formData.taskStatus,
        platforms: formData.platforms,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime
      }
    });
    
    if (!formData.title.trim()) {
      console.warn('⚠️ [TaskEditDialog] Валидация не пройдена - пустое название');
      addToast({
        type: 'error',
        title: 'Ошибка валидации',
        description: 'Название задачи не может быть пустым'
      });
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        emoji: formData.emoji || undefined,
        dueDate: formData.dueDate || undefined,
        dueTime: formData.dueTime || undefined,
        createdAt: task?.createdAt || new Date().toISOString(),
      };

      console.log('📝 [TaskEditDialog] Данные для сохранения подготовлены:', taskData);

      if (task) {
        console.log('✏️ [TaskEditDialog] Обновление существующей задачи');
        await onSave({ ...taskData, id: task.id });
        console.log('✅ [TaskEditDialog] Задача успешно обновлена');
        addToast({
          type: 'success',
          title: 'Задача обновлена',
          description: 'Изменения успешно сохранены'
        });
      } else {
        console.log('➕ [TaskEditDialog] Создание новой задачи');
        await onSave(taskData);
        console.log('✅ [TaskEditDialog] Новая задача успешно создана');
        addToast({
          type: 'success',
          title: 'Задача создана',
          description: 'Новая задача добавлена на доску'
        });
      }

      console.log('🔄 [TaskEditDialog] Закрытие диалога');
      onOpenChange(false);
    } catch (error) {
      console.error('❌ [TaskEditDialog] Ошибка сохранения задачи:', error);
      addToast({
        type: 'error',
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить задачу. Попробуйте еще раз.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) {
      console.error('❌ [TaskEditDialog] Нет задачи или функции удаления');
      return;
    }

    console.log('🗑️ [TaskEditDialog] Начало удаления задачи:', {
      taskId: task.id,
      title: task.title
    });

    setIsDeleting(true);

    try {
      await onDelete(task.id);
      console.log('✅ [TaskEditDialog] Задача успешно удалена');
      addToast({
        type: 'success',
        title: 'Задача удалена',
        description: 'Задача была успешно удалена'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('❌ [TaskEditDialog] Ошибка удаления задачи:', error);
      addToast({
        type: 'error',
        title: 'Ошибка удаления',
        description: 'Не удалось удалить задачу. Попробуйте еще раз.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReturnToBoard = async () => {
    if (!task || !onReturnToBoard) {
      console.error('❌ [TaskEditDialog] Нет задачи или функции возврата на доску');
      return;
    }

    console.log('🔄 [TaskEditDialog] Начало возврата задачи на доску:', {
      taskId: task.id,
      title: task.title,
      targetStatus: task.status
    });

    setIsReturning(true);

    try {
      await onReturnToBoard(task);
      console.log('✅ [TaskEditDialog] Задача успешно возвращена на доску');
      addToast({
        type: 'success',
        title: 'Задача возвращена',
        description: 'Задача перемещена обратно на канбан-доску'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('❌ [TaskEditDialog] Ошибка возврата задачи на доску:', error);
      addToast({
        type: 'error',
        title: 'Ошибка перемещения',
        description: 'Не удалось вернуть задачу на доску. Попробуйте еще раз.'
      });
    } finally {
      setIsReturning(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    console.log('😀 [TaskEditDialog] Выбор эмодзи:', { emoji, taskId: task?.id });
    setFormData(prev => ({ ...prev, emoji }));
  };

  const handlePlatformChange = (platform: keyof typeof formData.platforms, checked: boolean) => {
    console.log('📱 [TaskEditDialog] Изменение платформы:', { 
      platform, 
      checked, 
      taskId: task?.id 
    });
    setFormData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: checked,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Редактировать задачу' : 'Создать задачу'}
            {isCalendarView && <span className="text-sm font-normal text-gray-500 ml-2">(из календаря)</span>}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="title">Название задачи</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название задачи..."
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-col">
              <Label>Эмодзи</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-12 h-10 p-0"
                    disabled={isLoading}
                  >
                    {formData.emoji || <Smile className="w-4 h-4" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-8 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-8 h-8 p-0 text-gray-400"
                      onClick={() => handleEmojiSelect('')}
                    >
                      ✕
                    </Button>
                    {EMOJI_LIST.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        className="w-8 h-8 p-0"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Подробное описание задачи..."
              rows={4}
              className="resize-y min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Столбец</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taskStatus">Статус задачи</Label>
              <Select 
                value={formData.taskStatus} 
                onValueChange={(value: 'not-checked' | 'deputy-checked' | 'fully-checked') => 
                  setFormData(prev => ({ ...prev, taskStatus: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-checked">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Не проверена
                    </div>
                  </SelectItem>
                  <SelectItem value="deputy-checked">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Проверена заместителем
                    </div>
                  </SelectItem>
                  <SelectItem value="fully-checked">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Проверена полностью
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4" />
              Платформы
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vkOk"
                  checked={formData.platforms.vkOk}
                  onCheckedChange={(checked) => handlePlatformChange('vkOk', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="vkOk" className="text-sm font-normal">ВК/Ок</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="website"
                  checked={formData.platforms.website}
                  onCheckedChange={(checked) => handlePlatformChange('website', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="website" className="text-sm font-normal">Сайт</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="telegram"
                  checked={formData.platforms.telegram}
                  onCheckedChange={(checked) => handlePlatformChange('telegram', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="telegram" className="text-sm font-normal">Telegram</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Дата выполнения</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="dueTime">Время</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              {isCalendarView && task && onReturnToBoard && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleReturnToBoard}
                  disabled={isLoading || isReturning}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  {isReturning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  )}
                  Вернуть на доску
                </Button>
              )}
              
              {task && onDelete && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isLoading || isDeleting}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Удалить
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  task ? 'Сохранить' : 'Создать'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}