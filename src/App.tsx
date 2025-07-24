import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Calendar, LayoutGrid, Plus, CalendarDays } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ToastProvider } from './components/ui/toast';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import TaskEditDialog from './components/TaskEditDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { Task, Column } from './types';

const initialColumns: Column[] = [
  { id: 'todo', title: 'К выполнению', tasks: [] },
  { id: 'in-progress', title: 'В работе', tasks: [] },
  { id: 'review', title: 'На проверке', tasks: [] },
  { id: 'done', title: 'Выполнено', tasks: [] },
];

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const [editingCalendarTask, setEditingCalendarTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState('board');

  // Load data from localStorage
  useEffect(() => {
    console.log('🔄 [App] Загрузка данных из localStorage...');
    
    const savedColumns = localStorage.getItem('kanban-columns');
    const savedCalendarTasks = localStorage.getItem('calendar-tasks');
    
    if (savedColumns) {
      try {
        console.log('📊 [App] Найдены сохраненные столбцы:', savedColumns.length, 'символов');
        const parsedColumns = JSON.parse(savedColumns);
        console.log('✅ [App] Столбцы успешно распарсены:', parsedColumns.length, 'столбцов');
        
        // Migrate old data structure if needed
        const migratedColumns = parsedColumns.map((col: Column) => ({
          ...col,
          tasks: col.tasks.map((task: any) => ({
            ...task,
            taskStatus: task.taskStatus || 'not-checked',
            platforms: task.platforms || {
              vkOk: false,
              website: false,
              telegram: false,
            },
          }))
        }));
        
        const totalTasks = migratedColumns.reduce((sum: number, col: Column) => sum + col.tasks.length, 0);
        console.log('📝 [App] Всего задач загружено:', totalTasks);
        setColumns(migratedColumns);
      } catch (error) {
        console.error('❌ [App] Ошибка загрузки сохраненных данных:', error);
        console.log('🔄 [App] Используем начальные столбцы');
        setColumns(initialColumns);
      }
    } else {
      console.log('📋 [App] Сохраненные столбцы не найдены, используем начальные');
    }

    if (savedCalendarTasks) {
      try {
        console.log('📅 [App] Найдены сохраненные задачи календаря:', savedCalendarTasks.length, 'символов');
        const parsedCalendarTasks = JSON.parse(savedCalendarTasks);
        console.log('✅ [App] Задачи календаря успешно распарсены:', parsedCalendarTasks.length, 'задач');
        setCalendarTasks(parsedCalendarTasks);
      } catch (error) {
        console.error('❌ [App] Ошибка загрузки задач календаря:', error);
        console.log('🔄 [App] Используем пустой массив задач календаря');
        setCalendarTasks([]);
      }
    } else {
      console.log('📅 [App] Сохраненные задачи календаря не найдены');
    }
    
    console.log('✅ [App] Инициализация данных завершена');
  }, []);

  // Save data to localStorage
  useEffect(() => {
    console.log('💾 [App] Сохранение столбцов в localStorage...');
    const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
    console.log('📊 [App] Сохраняем', columns.length, 'столбцов с', totalTasks, 'задачами');
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
    console.log('✅ [App] Столбцы сохранены в localStorage');
  }, [columns]);

  useEffect(() => {
    console.log('💾 [App] Сохранение задач календаря в localStorage...');
    console.log('📅 [App] Сохраняем', calendarTasks.length, 'задач календаря');
    localStorage.setItem('calendar-tasks', JSON.stringify(calendarTasks));
    console.log('✅ [App] Задачи календаря сохранены в localStorage');
  }, [calendarTasks]);

  const findTaskById = (id: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === id);
      if (task) return task;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    console.log('🖱️ [DragDrop] Начало перетаскивания задачи:', {
      taskId: active.id,
      taskTitle: task?.title,
      currentStatus: task?.status
    });
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🖱️ [DragDrop] Завершение перетаскивания:', {
      activeId: active.id,
      overId: over?.id
    });
    
    setActiveTask(null);

    if (!over) {
      console.log('⚠️ [DragDrop] Перетаскивание отменено - нет целевой области');
      return;
    }

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    // Find source column and task
    let sourceColumn: Column | undefined;
    let task: Task | undefined;
    
    for (const col of columns) {
      const foundTask = col.tasks.find(t => t.id === activeTaskId);
      if (foundTask) {
        sourceColumn = col;
        task = foundTask;
        break;
      }
    }

    const targetColumn = columns.find(col => col.id === overColumnId);

    console.log('🔍 [DragDrop] Поиск столбцов:', {
      activeTaskId,
      overColumnId,
      sourceColumnFound: !!sourceColumn,
      sourceColumnId: sourceColumn?.id,
      sourceColumnTitle: sourceColumn?.title,
      targetColumnFound: !!targetColumn,
      targetColumnId: targetColumn?.id,
      targetColumnTitle: targetColumn?.title,
      taskFound: !!task,
      taskTitle: task?.title
    });

    if (!sourceColumn || !targetColumn || !task) {
      console.error('❌ [DragDrop] Не найден исходный или целевой столбец, или задача:', {
        sourceColumn: sourceColumn?.title || 'НЕ НАЙДЕН',
        targetColumn: targetColumn?.title || 'НЕ НАЙДЕН',
        task: task?.title || 'НЕ НАЙДЕНА',
        availableColumns: columns.map(col => ({ id: col.id, title: col.title, tasksCount: col.tasks.length }))
      });
      return;
    }

    if (sourceColumn.id !== targetColumn.id) {
      console.log('✅ [DragDrop] Перемещение задачи между столбцами:', {
        taskTitle: task.title,
        from: sourceColumn.title,
        to: targetColumn.title
      });

      setColumns(prev => prev.map(col => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== activeTaskId)
          };
        }
        if (col.id === targetColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, { ...task, status: col.id }]
          };
        }
        return col;
      }));
    } else {
      console.log('ℹ️ [DragDrop] Задача осталась в том же столбце');
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      console.log('➕ [Task] Создание новой задачи:', {
        title: task.title,
        status: task.status,
        emoji: task.emoji,
        dueDate: task.dueDate
      });
      
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
      };

      console.log('✅ [Task] Задача создана с ID:', newTask.id);

      setColumns(prev => prev.map(col => 
        col.id === task.status 
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      ));
      
      console.log('📊 [Task] Задача добавлена в столбец:', task.status);
    } catch (error) {
      console.error('❌ [Task] Ошибка создания задачи:', error);
      throw error;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      console.log('✏️ [Task] Обновление задачи:', {
        id: updatedTask.id,
        title: updatedTask.title,
        newStatus: updatedTask.status
      });
      
      setColumns(prev => prev.map(col => {
        // Remove task from current column
        const filteredTasks = col.tasks.filter(task => task.id !== updatedTask.id);
        
        // Add task to correct column
        if (col.id === updatedTask.status) {
          return { ...col, tasks: [...filteredTasks, updatedTask] };
        } else {
          return { ...col, tasks: filteredTasks };
        }
      }));
      
      console.log('✅ [Task] Задача успешно обновлена');
    } catch (error) {
      console.error('❌ [Task] Ошибка обновления задачи:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('🗑️ [Task] Удаление задачи:', taskId);
      
      // Find task for logging
      const task = findTaskById(taskId) || calendarTasks.find(t => t.id === taskId);
      if (task) {
        console.log('📝 [Task] Удаляемая задача:', {
          title: task.title,
          status: task.status
        });
      }
      
      // Remove from board
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.id !== taskId)
      })));
      
      // Remove from calendar
      setCalendarTasks(prev => prev.filter(task => task.id !== taskId));
      
      console.log('✅ [Task] Задача успешно удалена из доски и календаря');
    } catch (error) {
      console.error('❌ [Task] Ошибка удаления задачи:', error);
      throw error;
    }
  };

  const deleteTaskWithConfirm = (taskId: string) => {
    console.log('❓ [Task] Запрос подтверждения удаления задачи:', taskId);
    const task = findTaskById(taskId) || calendarTasks.find(t => t.id === taskId);
    if (task) {
      console.log('📝 [Task] Задача найдена для подтверждения удаления:', task.title);
      setDeletingTask({ id: taskId, title: task.title });
    } else {
      console.error('❌ [Task] Задача не найдена для подтверждения удаления');
    }
  };

  const confirmDeleteTask = async () => {
    if (deletingTask) {
      console.log('✅ [Task] Подтверждено удаление задачи:', deletingTask.title);
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } else {
      console.error('❌ [Task] Нет задачи для подтверждения удаления');
    }
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    console.log('✏️ [Column] Обновление заголовка столбца:', {
      columnId,
      oldTitle: columns.find(col => col.id === columnId)?.title,
      newTitle
    });
    
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
    
    console.log('✅ [Column] Заголовок столбца обновлен');
  };

  const sendTaskToCalendar = (task: Task) => {
    console.log('📅 [Calendar] Отправка задачи в календарь:', {
      taskId: task.id,
      title: task.title,
      dueDate: task.dueDate,
      dueTime: task.dueTime
    });
    
    // Remove task from board
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== task.id)
    })));
    
    // Add to calendar tasks
    setCalendarTasks(prev => [...prev, task]);
    
    // Switch to calendar view
    setActiveTab('calendar');
    
    console.log('✅ [Calendar] Задача отправлена в календарь и переключена вкладка');
  };

  const updateCalendarTask = async (updatedTask: Task) => {
    try {
      console.log('✏️ [Calendar] Обновление задачи календаря:', {
        id: updatedTask.id,
        title: updatedTask.title
      });
      
      setCalendarTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      console.log('✅ [Calendar] Задача календаря успешно обновлена');
    } catch (error) {
      console.error('❌ [Calendar] Ошибка обновления задачи календаря:', error);
      throw error;
    }
  };

  const returnTaskToBoard = async (task: Task) => {
    try {
      console.log('🔄 [Calendar] Возврат задачи на доску:', {
        taskId: task.id,
        title: task.title,
        targetStatus: task.status
      });
      
      // Remove from calendar
      setCalendarTasks(prev => prev.filter(t => t.id !== task.id));
      
      // Add back to board
      setColumns(prev => prev.map(col => 
        col.id === task.status 
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      ));
      
      // Switch to board view
      setActiveTab('board');
      
      console.log('✅ [Calendar] Задача возвращена на доску и переключена вкладка');
    } catch (error) {
      console.error('❌ [Calendar] Ошибка возврата задачи на доску:', error);
      throw error;
    }
  };

  const getAllTasks = (): Task[] => {
    return [...columns.flatMap(col => col.tasks), ...calendarTasks];
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Канбан-доска</h1>
              <p className="text-gray-600 mt-1">Управляйте задачами и планируйте время</p>
            </div>
            <Button 
              onClick={() => setIsTaskDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить задачу
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="board" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Доска
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Календарь
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="mt-6">
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <KanbanBoard
                  columns={columns}
                  onUpdateColumnTitle={updateColumnTitle}
                  onEditTask={setEditingTask}
                  onDeleteTask={deleteTaskWithConfirm}
                  onSendToCalendar={sendTaskToCalendar}
                />
                <DragOverlay>
                  {activeTask && (
                    <Card className="p-4 bg-white shadow-lg rotate-3">
                      <div className="flex items-start gap-2">
                        {activeTask.emoji && (
                          <span className="text-lg">{activeTask.emoji}</span>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{activeTask.title}</h3>
                        </div>
                      </div>
                    </Card>
                  )}
                </DragOverlay>
              </DndContext>
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <CalendarView 
                tasks={calendarTasks} 
                onEditTask={setEditingCalendarTask}
              />
            </TabsContent>
          </Tabs>

          {/* Board Task Creation/Edit Dialog */}
          <TaskEditDialog
            open={isTaskDialogOpen || !!editingTask}
            onOpenChange={(open) => {
              if (!open) {
                setIsTaskDialogOpen(false);
                setEditingTask(null);
              }
            }}
            onSave={editingTask ? updateTask : addTask}
            onDelete={editingTask ? deleteTask : undefined}
            task={editingTask}
            columns={columns}
          />

          {/* Calendar Task Edit Dialog */}
          <TaskEditDialog
            open={!!editingCalendarTask}
            onOpenChange={(open) => {
              if (!open) {
                setEditingCalendarTask(null);
              }
            }}
            onSave={updateCalendarTask}
            onDelete={deleteTask}
            onReturnToBoard={returnTaskToBoard}
            task={editingCalendarTask}
            columns={columns}
            isCalendarView={true}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmDialog
            open={!!deletingTask}
            onOpenChange={(open) => {
              if (!open) {
                setDeletingTask(null);
              }
            }}
            onConfirm={confirmDeleteTask}
            taskTitle={deletingTask?.title || ''}
          />
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;