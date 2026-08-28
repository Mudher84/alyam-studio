import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { cn } from '../../lib/utils';

interface StudioBadgeIconProps {
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function StudioBadgeIcon({ className = "w-3.5 h-3.5", fallbackIcon }: StudioBadgeIconProps) {
  const { settings } = useSettingsStore();
  const [imgError, setImgError] = React.useState(false);

  const rawLogo = settings?.logoUrl;
  const logo = (typeof rawLogo === 'string' ? rawLogo : ((rawLogo as any)?.originalUrl || (rawLogo as any)?.webpUrl || (rawLogo as any)?.url || ''))?.trim();

  if (logo && !imgError) {
    return (
      <img 
        src={logo} 
        alt="Studio Logo" 
        onError={() => setImgError(true)}
        className={cn("object-contain shrink-0 inline-block max-h-full", className)} 
      />
    );
  }

  if (fallbackIcon) {
    return <>{fallbackIcon}</>;
  }

  return null;
}
