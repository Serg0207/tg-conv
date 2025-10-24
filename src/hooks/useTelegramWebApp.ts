// src/hooks/useTelegramWebApp.ts
// ЗАМЕНИТЕ ВЕСЬ файл на этот код:

import { useEffect, useState } from 'react';
import { initData } from '@tma.js/sdk-react';

/**
 * Хук для работы с Telegram WebApp API
 */
export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    // Инициализация
    setIsReady(true);

    // Получаем данные пользователя
    try {
      initData.restore();
      const state = initData.state();
      if (state?.user) {
        setUser(state.user);
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

      // В production отправляем через window.Telegram.WebApp
      try {
        const telegram = (window as any).Telegram;
        if (telegram?.WebApp?.sendData) {
          telegram.WebApp.sendData(dataString);
          return true;
        }
        console.warn('sendData not available');
        return false;
      } catch (error) {
        console.warn('Error with sendData:', error);
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
      const telegram = (window as any).Telegram;
      if (telegram?.WebApp?.showAlert) {
        telegram.WebApp.showAlert(message);
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
      const telegram = (window as any).Telegram;
      if (telegram?.WebApp?.showConfirm) {
        return await telegram.WebApp.showConfirm(message);
      }
      return confirm(message);
    } catch (error) {
      return confirm(message);
    }
  };

  /**
   * Закрыть Mini App
   */
  const close = (): void => {
    try {
      const telegram = (window as any).Telegram;
      if (telegram?.WebApp?.close) {
        telegram.WebApp.close();
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
      // Haptic feedback не критичен
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