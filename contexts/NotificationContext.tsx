import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, NotificationType } from '../types';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  notify: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, message: string, duration = 3000) => {
    // Generate a unique ID (fallback for older browsers included)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString() + Math.random().toString(36).substring(2);
      
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), duration);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
           <div key={n.id} className="pointer-events-auto bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 shadow-xl rounded-lg p-4 flex items-start gap-3 w-80 animate-in slide-in-from-right fade-in duration-300">
              {n.type === 'success' && <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />}
              {n.type === 'error' && <AlertCircle className="text-red-500 flex-shrink-0" size={20} />}
              {n.type === 'info' && <Info className="text-blue-500 flex-shrink-0" size={20} />}
              <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white leading-tight">{n.message}</p>
              </div>
              <button onClick={() => removeNotification(n.id)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X size={16} />
              </button>
           </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};