
import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = 'default',
    ...props
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        ...props
      });
    } else {
      sonnerToast.success(title, {
        description,
        ...props
      });
    }
  };

  return { toast };
};

export { toast } from 'sonner';
