import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Notification, PlatformSettings } from '../types/index.ts';
import { apiRequest } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  settings: PlatformSettings | null;
  notifications: Notification[];
  unreadNotifsCount: number;
  currentView: string;
  setCurrentView: (view: string) => void;
  previewClientId: string | null;
  setPreviewClientId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    categoryId?: string;
  }) => Promise<User>;
  logout: () => void;
  quickLogin: (profile: 'admin' | 'sarah' | 'brian' | 'applicant' | 'client' | 'esther') => Promise<void>;
  completeRegistrationPayment: (channel: string, phone: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('swashub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [previewClientId, setPreviewClientId] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    apiRequest('/api/settings')
      .then((res) => setSettings(res.settings))
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  // Check current session
  const refreshUser = async () => {
    const storedToken = localStorage.getItem('swashub_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: User }>('/api/auth/me');
      setUser(res.user);
      if (res.user.role === 'ADMIN' && currentView === 'landing') {
        setCurrentView('admin-overview');
      } else if (res.user.role === 'AGENT' && currentView === 'landing') {
        setCurrentView('agent-dashboard');
      } else if (res.user.role === 'PENDING_PAYMENT') {
        setCurrentView('payment-required');
      }
    } catch {
      localStorage.removeItem('swashub_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiRequest<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('swashub_token', res.token);
      setToken(res.token);
      setUser(res.user);

      if (res.user.role === 'ADMIN') {
        setCurrentView('admin-overview');
      } else if (res.user.role === 'AGENT') {
        setCurrentView('agent-dashboard');
      } else if (res.user.role === 'CLIENT') {
        setCurrentView('client-dashboard');
      } else {
        setCurrentView('payment-required');
        setIsPaymentModalOpen(true);
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    categoryId?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('swashub_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setCurrentView('payment-required');
      setIsPaymentModalOpen(true);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('swashub_token');
    setUser(null);
    setToken(null);
    setCurrentView('landing');
  };

  const quickLogin = async (profile: 'admin' | 'sarah' | 'brian' | 'applicant' | 'client' | 'esther') => {
    const credentials = {
      admin: { email: 'admin@swashub.com', password: 'admin123' },
      sarah: { email: 'sarah.mwangi@gmail.com', password: 'agent123' },
      brian: { email: 'brian.kiprono@yahoo.com', password: 'agent123' },
      esther: { email: 'esther.njoki@swashub.com', password: 'agent123' },
      client: { email: 'jane.wanjiku@gmail.com', password: 'client123' },
      applicant: { email: 'applicant@swashub.com', password: 'applicant123' },
    };

    const target = credentials[profile];
    if (target) {
      await login(target.email, target.password);
    }
  };

  const completeRegistrationPayment = async (channel: string, phone: string): Promise<User> => {
    if (!user) throw new Error('No active user session');
    const res = await apiRequest<{ user: User; status: string }>('/api/flutterwave/verify', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        channel,
        phone,
        tx_ref: `SWASHUB_PAY_${Date.now()}`,
      }),
    });
    setUser(res.user);
    setIsPaymentModalOpen(false);
    setCurrentView('agent-dashboard');
    await refreshNotifications();
    return res.user;
  };

  const markNotificationAsRead = async (id: string) => {
    await apiRequest(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    await apiRequest('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        settings,
        notifications,
        unreadNotifsCount,
        currentView,
        setCurrentView,
        previewClientId,
        setPreviewClientId,
        login,
        register,
        logout,
        quickLogin,
        completeRegistrationPayment,
        refreshUser,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
