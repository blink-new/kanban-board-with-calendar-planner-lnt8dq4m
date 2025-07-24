import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  taskTitle: string;
}

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  taskTitle 
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Удалить карточку?
          </DialogTitle>
          <DialogDescription className="text-left">
            Вы уверены, что хотите удалить карточку <strong>"{taskTitle}"</strong>?
            <br />
            <span className="text-red-600 font-medium">
              Это действие нельзя отменить.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Да, удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}