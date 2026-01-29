import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  labels?: {
    title: string;
    levels?: string[];
  };
}

const DEFAULT_LEVELS = [
  'Very Weak',
  'Weak',
  'Fair',
  'Good',
  'Strong',
  'Very Strong',
] as const;

const DEFAULT_LABELS = {
  title: 'Password strength:',
  levels: DEFAULT_LEVELS,
} as const;

export const PasswordStrengthIndicator = ({
  password,
  className,
  labels,
}: PasswordStrengthIndicatorProps) => {
  const resolvedLabels = {
    title: labels?.title ?? DEFAULT_LABELS.title,
    levels: labels?.levels ?? DEFAULT_LEVELS,
  };
  const calculateStrength = (
    pwd: string
  ): {
    score: number;
    label: string;
    color: string;
  } => {
    let score = 0;

    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    const strengthMap = [
      { label: resolvedLabels.levels[0], color: 'bg-destructive' },
      { label: resolvedLabels.levels[1], color: 'bg-orange-500' },
      { label: resolvedLabels.levels[2], color: 'bg-yellow-500' },
      { label: resolvedLabels.levels[3], color: 'bg-lime-500' },
      { label: resolvedLabels.levels[4], color: 'bg-green-500' },
      { label: resolvedLabels.levels[5], color: 'bg-emerald-600' },
    ];

    const index = Math.min(Math.max(score, 0), strengthMap.length - 1);
    const strengthLevel = strengthMap[index]!;

    return {
      score: (score / 5) * 100,
      label: strengthLevel.label,
      color: strengthLevel.color,
    };
  };

  const strength = calculateStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {resolvedLabels.title}
        </span>
        <span
          className={cn(
            'font-medium',
            strength.score < 40 && 'text-destructive',
            strength.score >= 40 && strength.score < 80 && 'text-yellow-600',
            strength.score >= 80 && 'text-green-600'
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>
  );
};
