export interface Task {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  status: string;
  taskStatus: 'not-checked' | 'deputy-checked' | 'fully-checked';
  platforms: {
    vkOk: boolean;
    website: boolean;
    telegram: boolean;
  };
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}