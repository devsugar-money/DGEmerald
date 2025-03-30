import React, { createContext, useContext, ReactNode } from 'react';
import * as Icons from 'lucide-react';

// Create a context to store the icons
const IconContext = createContext<Record<string, any>>({});

// Create a provider component to efficiently load and memoize icons
export const IconProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Memoize the icons to prevent unnecessary re-renders
  const iconsValue = React.useMemo(() => Icons, []);
  
  return (
    <IconContext.Provider value={iconsValue}>
      {children}
    </IconContext.Provider>
  );
};

// Hook to use icons efficiently in components
export const useIcon = (iconName: string) => {
  const icons = useContext(IconContext);
  // Return the requested icon or a placeholder if not found
  return icons[iconName] || null;
};

// Component to render an icon by name
interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  size = 24, 
  className = "", 
  ...props 
}) => {
  const IconComponent = useIcon(name);
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found`);
    return null;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
};

// Export commonly used icons directly for better tree-shaking
export const {
  Trees,
  ArrowRight,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ChevronDown,
  ArrowUpDown,
  CheckCircle,
  X,
  AlertCircle,
  Table,
  Layout,
  XCircle,
  FileText,
  ListChecks,
  AlertTriangle,
  ArrowDownRight,
  ArrowDownLeft,
  UserPlus,
  LogIn,
  PlusCircle,
  Save,
  Bold,
  List,
  CheckSquare,
  Italic,
  AlignLeft
} = Icons;