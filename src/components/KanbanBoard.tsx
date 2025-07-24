import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from './ui/card';
import { Input } from './ui/input';
import TaskCard from './TaskCard';
import { Column, Task } from '../types';

interface KanbanBoardProps {
  columns: Column[];
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSendToCalendar: (task: Task) => void;
}

interface DroppableColumnProps {
  column: Column;
  onUpdateTitle: (newTitle: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSendToCalendar: (task: Task) => void;
}

function DroppableColumn({ 
  column, 
  onUpdateTitle, 
  onEditTask, 
  onDeleteTask,
  onSendToCalendar
}: DroppableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleTitleSubmit = () => {
    if (title.trim() && title !== column.title) {
      onUpdateTitle(title.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-4 bg-white min-h-[600px] w-80 flex-shrink-0">
      <div className="mb-4">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyPress}
            className="font-semibold text-gray-900 border-none p-0 h-auto focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h2 
            className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            onDoubleClick={() => setIsEditing(true)}
            title="Дважды кликните для редактирования"
          >
            {column.title}
          </h2>
        )}
        <div className="text-sm text-gray-500 mt-1">
          {column.tasks.length} {column.tasks.length === 1 ? 'задача' : 'задач'}
        </div>
      </div>
      
      <div ref={setNodeRef} className="space-y-3 min-h-[500px]">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onSendToCalendar={onSendToCalendar}
            />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}

export default function KanbanBoard({ 
  columns, 
  onUpdateColumnTitle, 
  onEditTask, 
  onDeleteTask,
  onSendToCalendar
}: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column) => (
        <DroppableColumn
          key={column.id}
          column={column}
          onUpdateTitle={(newTitle) => onUpdateColumnTitle(column.id, newTitle)}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onSendToCalendar={onSendToCalendar}
        />
      ))}
    </div>
  );
}