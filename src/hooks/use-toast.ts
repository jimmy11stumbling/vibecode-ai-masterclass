
import { useState, useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
}

let toastCount = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000,
    ...props
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
    action?: React.ReactNode;
  }) => {
    const id = `toast-${++toastCount}`;
    
    console.log('🍞 Toast created:', { id, title, description, variant });
    
    const newToast: ToastProps = {
      id,
      title,
      description,
      variant,
      duration,
      ...props
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      console.log('🍞 Toast state updated:', updated);
      return updated;
    });

    // Also use sonner for the actual toast display
    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        duration,
        ...props
      });
    } else {
      sonnerToast.success(title, {
        description,
        duration,
        ...props
      });
    }

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => {
        const filtered = prev.filter(t => t.id !== id);
        console.log('🍞 Toast auto-removed:', id, 'remaining:', filtered.length);
        return filtered;
      });
    }, duration);

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
      update: (props: Partial<ToastProps>) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, ...props } : t));
      }
    };
  }, []);

  return { 
    toast, 
    toasts: toasts || [], // Ensure toasts is always an array
    dismiss: (toastId: string) => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }
  };
};

export const toast = sonnerToast;
