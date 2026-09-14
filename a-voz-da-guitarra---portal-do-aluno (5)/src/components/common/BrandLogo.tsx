import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  className = '',
  showBorder = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const dimensionClass = sizeClasses[size] || sizeClasses.sm;

  if (hasError) {
    return (
      <div
        className={`${dimensionClass} rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      >
        <span className="text-[10px] tracking-tight">VG</span>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="A Voz da Guitarra"
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={`${dimensionClass} rounded-full object-cover shrink-0 select-none ${
        showBorder ? 'ring-1 ring-slate-900/15 shadow-sm' : ''
      } ${className}`}
    />
  );
};
