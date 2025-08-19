"use client";

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success:
          'success group border-green-500 bg-green-50 text-green-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    onOpenChange?: (open: boolean) => void;
  };

export function Toast({
  className,
  variant,
  onOpenChange,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-1">
        {props.children}
      </div>
      <button
        type="button"
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
        onClick={() => onOpenChange?.(false)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

type ToastContextType = {
  toast: (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
  }) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    title: string;
    description?: string;
    variant: 'default' | 'destructive' | 'success';
  }>>([]);

  const toast = React.useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 5000,
    }: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive' | 'success';
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prevToasts) => [
        ...prevToasts,
        {
          id,
          title,
          description,
          variant,
        },
      ]);

      if (duration) {
        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== id)
          );
        }, duration);
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 z-[100] flex w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map(({ id, title, description, variant }) => (
          <Toast
            key={id}
            variant={variant}
            className="mb-2"
            onOpenChange={() => {
              setToasts((prevToasts) =>
                prevToasts.filter((toast) => toast.id !== id)
              );
            }}
          >
            <div className="grid gap-1">
              <div className="text-sm font-semibold">{title}</div>
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
