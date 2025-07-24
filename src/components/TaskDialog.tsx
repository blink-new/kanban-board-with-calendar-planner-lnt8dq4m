import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Smile, CheckSquare } from 'lucide-react';
import { Task, Column } from '../types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task | Omit<Task, 'id'>) => void;
  task?: Task | null;
  columns: Column[];
}

const EMOJI_LIST = [
  '📝', '💡', '🎯', '🚀', '⭐', '🔥', '💪', '🎨', '🔧', '📊',
  '📱', '💻', '🌟', '⚡', '🎉', '🏆', '📈', '🔍', '💰', '🎪',
  '🌈', '🎭', '🎪', '🎨', '🎵', '🎬', '📚', '✨', '🌸', '🍀',
  '🎈', '🎁', '🎂', '🍕', '☕', '🌮', '🍎', '🥑', '🍓', '🥕'
];

export default function TaskDialog({ open, onOpenChange, onSave, task, columns }: TaskDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      emoji: formData.emoji || undefined,
      dueDate: formData.dueDate || undefined,
      dueTime: formData.dueTime || undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    if (task) {
      onSave({ ...taskData, id: task.id });
    } else {
      onSave(taskData);
    }

    onOpenChange(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, emoji }));
  };

  const handlePlatformChange = (platform: keyof typeof formData.platforms, checked: boolean) => {
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Столбец</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
                />
                <Label htmlFor="vkOk" className="text-sm font-normal">ВК/Ок</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="website"
                  checked={formData.platforms.website}
                  onCheckedChange={(checked) => handlePlatformChange('website', checked as boolean)}
                />
                <Label htmlFor="website" className="text-sm font-normal">Сайт</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="telegram"
                  checked={formData.platforms.telegram}
                  onCheckedChange={(checked) => handlePlatformChange('telegram', checked as boolean)}
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
              />
            </div>

            <div>
              <Label htmlFor="dueTime">Время</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {task ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}