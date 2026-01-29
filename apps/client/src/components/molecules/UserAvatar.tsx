import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface UserAvatarProps {
  name?: string;
  src?: string;
  className?: string;
}

const initialsFromName = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const letters = parts.map(part => part[0]).filter(Boolean);
  return letters.join('').slice(0, 2).toUpperCase();
};
export const UserAvatar = ({ name, src, className }: UserAvatarProps) => {
  const initials = initialsFromName(name);
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={name ?? 'User'} /> : null}
      <AvatarFallback>{initials || 'U'}</AvatarFallback>
    </Avatar>
  );
};
