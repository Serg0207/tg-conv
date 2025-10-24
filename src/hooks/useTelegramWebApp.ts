// src/hooks/useTelegramWebApp.ts
// ЗАМЕНИТЕ ВЕСЬ код в файле на этот:

import { useEffect, useState } from 'react';
import { miniApp, initData, type User } from '@tma.js/sdk-react';

/**
 * Хук для работы с Telegram WebApp API
 */
export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    // Инициализация
    setIsReady(true);

    // Получаем данные пользователя
    try {
      const restoredData = initData.restore();
      if (restoredData?.user) {
        setUser(restoredData.user);
      }
    } catch (error) {
      console.log('Init data not available:', error);
    }
  }, []);

  /**
   * Отправить данные обратно в бота
   */
  const sendData = (data: Record<string, any>): boolean => {
    try {
      const dataString = JSON.stringify(data);
      console.log('Sending data to bot:', data);

      // В dev режиме только логируем
      if (import.meta.env.DEV) {
        console.log('DEV mode: Data would be sent:', dataString);
        return true;
      }

      // В production отправляем реальные данные
      if (miniApp.sendData) {
        miniApp.sendData(dataString);
        return true;
      } else {
        console.warn('sendData not available in this context');
        return false;
      }
    } catch (error) {
      console.error('Error sending data:', error);
      return false;
    }
  };

  /**
   * Показать всплывающее сообщение
   */
  const showAlert = (message: string): void => {
    try {
      if (miniApp.showAlert) {
        miniApp.showAlert(message);
      } else {
        alert(message);
      }
    } catch (error) {
      alert(message);
    }
  };

  /**
   * Показать подтверждение
   */
  const showConfirm = async (message: string): Promise<boolean> => {
    try {
      if (miniApp.showConfirm) {
        return await miniApp.showConfirm(message);
      } else {
        return confirm(message);
      }
    } catch (error) {
      return confirm(message);
    }
  };

  /**
   * Закрыть Mini App
   */
  const close = (): void => {
    try {
      if (miniApp.close) {
        miniApp.close();
      } else {
        console.log('Close not available in dev mode');
      }
    } catch (error) {
      console.log('Close not available:', error);
    }
  };

  /**
   * Тактильная обратная связь (вибрация)
   */
  const hapticFeedback = (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium',
  ): void => {
    try {
      // Используем Telegram Haptic Feedback если доступен
      const telegram = (window as any).Telegram;
      if (telegram?.WebApp?.HapticFeedback) {
        const feedback = telegram.WebApp.HapticFeedback;

        switch (type) {
          case 'light':
          case 'medium':
          case 'heavy':
            feedback.impactOccurred(type);
            break;
          case 'success':
          case 'warning':
          case 'error':
            feedback.notificationOccurred(type);
            break;
        }
      }
    } catch (error) {
      // Haptic feedback не критичен, просто игнорируем ошибку
    }
  };

  return {
    isReady,
    user,
    sendData,
    showAlert,
    showConfirm,
    close,
    hapticFeedback,
  };
}