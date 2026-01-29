import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}
export const LoadingSkeleton = ({
  className,
  lines = 3,
}: LoadingSkeletonProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 w-full animate-pulse rounded-md bg-muted"
        />
      ))}
    </div>
  );
};
