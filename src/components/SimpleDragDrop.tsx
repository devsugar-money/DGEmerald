import React, { useState, useRef, useEffect } from 'react';

interface DraggableItemProps {
  id: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  id, 
  index, 
  onDragStart, 
  onDragEnter, 
  onDragEnd, 
  children, 
  className = '',
  dragHandleProps
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
    
    // Add dragging class to element for styling
    if (itemRef.current) {
      itemRef.current.classList.add('dragging');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragEnter(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    // Remove dragging class
    if (itemRef.current) {
      itemRef.current.classList.remove('dragging');
    }
    onDragEnd();
  };

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      className={`${className} transition-transform duration-200`}
      data-id={id}
    >
      {children}
    </div>
  );
};

interface DroppableAreaProps {
  onDragEnd: (result: { source: { index: number }, destination: { index: number } }) => void;
  children: React.ReactNode;
  className?: string;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({ 
  onDragEnd, 
  children, 
  className = '' 
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [targetItemIndex, setTargetItemIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setTargetItemIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedItemIndex !== null && targetItemIndex !== null && draggedItemIndex !== targetItemIndex) {
      onDragEnd({
        source: { index: draggedItemIndex },
        destination: { index: targetItemIndex }
      });
    }
    
    // Reset state
    setDraggedItemIndex(null);
    setTargetItemIndex(null);
  };

  // Clone children and pass drag-drop props
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        index,
        onDragStart: handleDragStart,
        onDragEnter: handleDragEnter,
        onDragEnd: handleDragEnd
      });
    }
    return child;
  });

  return (
    <div 
      className={`${className}`}
      onDragOver={(e) => e.preventDefault()}
    >
      {childrenWithProps}
    </div>
  );
};