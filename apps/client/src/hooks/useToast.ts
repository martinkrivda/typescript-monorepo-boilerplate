import { useCallback } from 'react';
import { toast, type ToastVariant } from '@/utils';

export const useToast = () => {
  const buildParams = (
    title?: string,
    description?: string,
    variant?: ToastVariant
  ) => ({
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(variant ? { variant } : {}),
  });

  const show = useCallback(
    (params: { title?: string; description?: string; variant?: ToastVariant }) =>
      toast(params),
    []
  );

  return {
    show,
    success: (title?: string, description?: string) =>
      toast(buildParams(title, description, 'success')),
    error: (title?: string, description?: string) =>
      toast(buildParams(title, description, 'error')),
    warning: (title?: string, description?: string) =>
      toast(buildParams(title, description, 'warning')),
    info: (title?: string, description?: string) =>
      toast(buildParams(title, description, 'info')),
  };
};
