import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '', ...props }) => {
  // @ts-ignore
  const LucideIcon = LucideIcons[name] || LucideIcons.FileText;
  return <LucideIcon size={size} className={className} {...props} />;
};
