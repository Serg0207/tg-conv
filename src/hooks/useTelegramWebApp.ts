// src/hooks/useTelegramWebApp.ts
// ЗАМЕНИТЕ ВЕСЬ файл на этот код:

import { useEffect, useState } from 'react';
import { miniApp, initData, type InitData } from '@tma.js/sdk-react';

/**
 * Хук для работы с Telegram WebApp API
 */
export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [userData, setUserData] = useState<InitData | undefined>(undefined);

  useEffect(() => {
    // Инициализация
    setIsReady(true);

    // Получаем данные пользователя
    try {
      const restoredData = initData.restore();
      if (restoredData) {
        setUserData(restoredData);
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

      // В production используем postEvent для отправки данных
      try {
        miniApp.postEvent('web_app_data_send', { data: dataString });
        return true;
      } catch (error) {
        console.warn('postEvent not available:', error);
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
      miniApp.postEvent('web_app_open_popup', {
        title: 'Уведомление',
        message: message,
        buttons: [{ id: 'ok', type: 'ok' }],
      });
    } catch (error) {
      alert(message);
    }
  };

  /**
   * Показать подтверждение
   */
  const showConfirm = async (message: string): Promise<boolean> => {
    try {
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
      miniApp.close();
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
    user: userData?.user,
    sendData,
    showAlert,
    showConfirm,
    close,
    hapticFeedback,
  };
}