import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from './IconProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Don't render anything on the server or if not mounted yet
  if (!mounted || !isOpen) return null;
  
  // Create portal to render modal outside of the main component hierarchy
  // This helps avoid issues with React's async rendering
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-modal w-full max-w-xl mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary-800">{title}</h2>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            {children}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="bg-primary-700 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;