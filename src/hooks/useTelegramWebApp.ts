// src/hooks/useTelegramWebApp.ts
// ФИНАЛЬНАЯ ВЕРСИЯ для @tma.js/sdk-react v3.0.4

import { useEffect, useState, useCallback } from 'react';
import { 
  initData,
  miniApp,
  themeParams,
  viewport,
  backButton,
  mainButton,
  settingsButton,
  closingBehavior,
  swipeBehavior,
  cloudStorage,
  postEvent,
} from '@tma.js/sdk-react';

/**
 * Расширенный хук для работы с Telegram WebApp API
 * Совместим с @tma.js/sdk-react v3.0.4
 */
export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(undefined);
  const [theme, setTheme] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing Telegram Mini App...');

        // 1. Получаем данные пользователя
        try {
          const state = initData.state();
          if (state?.user && isMounted) {
            setUser(state.user);
            console.log('👤 User data:', state.user);
          }
        } catch (error) {
          console.warn('⚠️ Init data not available:', error);
        }

        // 2. Получаем тему
        try {
          const currentTheme = themeParams.state();
          if (currentTheme && isMounted) {
            setTheme(currentTheme);
            console.log('🎨 Theme loaded:', currentTheme);
          }
        } catch (error) {
          console.warn('⚠️ Theme not available:', error);
        }

        // 3. Уведомляем Telegram что приложение готово
        try {
          miniApp.ready();
          console.log('✅ App ready signal sent');
        } catch (error) {
          console.warn('⚠️ Could not send ready signal:', error);
        }

        // 4. Разворачиваем приложение
        try {
          if (!viewport.state().isExpanded) {
            viewport.expand();
            console.log('📱 App expanded');
          }
        } catch (error) {
          console.warn('⚠️ Could not expand viewport:', error);
        }

        // 5. Применяем цвета темы
        try {
          const currentTheme = themeParams.state();
          if (currentTheme?.backgroundColor) {
            miniApp.setBgColor(currentTheme.backgroundColor);
          }
          if (currentTheme?.headerBgColor) {
            miniApp.setHeaderColor(currentTheme.headerBgColor);
          }
          console.log('🎨 Theme colors applied');
        } catch (error) {
          console.warn('⚠️ Could not set theme colors:', error);
        }

        // 6. Настраиваем поведение закрытия
        try {
          closingBehavior.enableConfirmation();
          console.log('🔒 Closing confirmation enabled');
        } catch (error) {
          console.warn('⚠️ Could not enable closing confirmation:', error);
        }

        // 7. Отключаем вертикальный свайп (правильный метод)
        try {
          swipeBehavior.disableVerticalFp();
          console.log('👆 Vertical swipe disabled');
        } catch (error) {
          console.warn('⚠️ Could not disable swipe:', error);
        }

        if (isMounted) {
          setIsReady(true);
          console.log('✅ Telegram Mini App fully initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing Telegram Mini App:', error);
        if (isMounted) {
          setIsReady(true); // Все равно показываем приложение
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Отправить данные обратно в бота
   */
  const sendData = useCallback((data: Record<string, any>): boolean => {
    try {
      const dataString = JSON.stringify(data);
      console.log('📤 Sending data to bot:', data);

      // В dev режиме только логируем
      if (import.meta.env.DEV) {
        console.log('🔧 DEV mode: Data would be sent:', dataString);
        return true;
      }

      // В production отправляем через postEvent
      postEvent('web_app_data_send', { data: dataString });
      return true;
    } catch (error) {
      console.error('❌ Error sending data:', error);
      return false;
    }
  }, []);

  /**
   * Показать всплывающее сообщение (используя нативный API)
   */
  const showAlert = useCallback(async (message: string): Promise<void> => {
    try {
      // Используем нативный Telegram WebApp API
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.showAlert(message);
      } else {
        alert(message);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
      alert(message);
    }
  }, []);

  /**
   * Показать подтверждение (используя нативный API)
   */
  const showConfirm = useCallback(async (message: string): Promise<boolean> => {
    try {
      // Используем нативный Telegram WebApp API
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        return new Promise((resolve) => {
          (window as any).Telegram.WebApp.showConfirm(message, (confirmed: boolean) => {
            resolve(confirmed);
          });
        });
      } else {
        return confirm(message);
      }
    } catch (error) {
      console.error('Error showing confirm:', error);
      return confirm(message);
    }
  }, []);

  /**
   * Показать popup с кнопками (используя нативный API)
   */
  const showPopup = useCallback(async (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }): Promise<string> => {
    try {
      // Используем нативный Telegram WebApp API
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.showPopup) {
        return new Promise((resolve) => {
          (window as any).Telegram.WebApp.showPopup(
            {
              title: params.title || '',
              message: params.message,
              buttons: params.buttons || [{ id: 'close', type: 'close' }],
            },
            (buttonId: string) => {
              resolve(buttonId);
            }
          );
        });
      } else {
        // Fallback к confirm
        const confirmed = confirm(params.message);
        return confirmed ? 'ok' : 'cancel';
      }
    } catch (error) {
      console.error('Error showing popup:', error);
      return 'close';
    }
  }, []);

  /**
   * Закрыть Mini App
   */
  const close = useCallback((): void => {
    try {
      miniApp.close();
    } catch (error) {
      console.log('Close not available:', error);
    }
  }, []);

  /**
   * Тактильная обратная связь (вибрация)
   */
  const hapticFeedback = useCallback((
    type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' = 'medium'
  ): void => {
    try {
      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
        case 'rigid':
        case 'soft':
          postEvent('web_app_trigger_haptic_feedback', { 
            type: 'impact' as const, 
            impact_style: type 
          });
          break;
        case 'success':
        case 'warning':
        case 'error':
          postEvent('web_app_trigger_haptic_feedback', { 
            type: 'notification' as const, 
            notification_type: type 
          });
          break;
      }
    } catch (error) {
      // Haptic feedback не критичен
    }
  }, []);

  /**
   * Управление главной кнопкой
   */
  const setMainButton = useCallback((config: {
    text?: string;
    isVisible?: boolean;
    isEnabled?: boolean;
    isLoaderVisible?: boolean;
    color?: string;
    textColor?: string;
    hasShineEffect?: boolean;
    onClick?: () => void;
  }) => {
    try {
      const { 
        text, 
        isVisible, 
        isEnabled, 
        isLoaderVisible, 
        color, 
        textColor,
        hasShineEffect,
        onClick 
      } = config;

      // Устанавливаем параметры
      if (text !== undefined) {
        mainButton.setText(text);
      }
      if (color !== undefined && color.startsWith('#')) {
        mainButton.setBgColor(color as `#${string}`);
      }
      if (textColor !== undefined && textColor.startsWith('#')) {
        mainButton.setTextColor(textColor as `#${string}`);
      }
      if (hasShineEffect !== undefined) {
        if (hasShineEffect) {
          mainButton.setParams({ hasShineEffect: true });
        } else {
          mainButton.setParams({ hasShineEffect: false });
        }
      }
      if (isLoaderVisible !== undefined) {
        if (isLoaderVisible) {
          mainButton.showLoader();
        } else {
          mainButton.hideLoader();
        }
      }
      if (isEnabled === false) {
        mainButton.disable();
      } else if (isEnabled === true) {
        mainButton.enable();
      }
      
      // Обработчик клика
      if (onClick !== undefined) {
        // Удаляем старые обработчики
        mainButton.offClick(onClick);
        // Добавляем новый
        mainButton.onClick(onClick);
      }

      // Видимость в конце
      if (isVisible === true) {
        mainButton.show();
      } else if (isVisible === false) {
        mainButton.hide();
      }

      console.log('✅ Main button configured:', config);
    } catch (error) {
      console.error('Error setting main button:', error);
    }
  }, []);

  /**
   * Скрыть главную кнопку
   */
  const hideMainButton = useCallback(() => {
    try {
      mainButton.hide();
    } catch (error) {
      console.error('Error hiding main button:', error);
    }
  }, []);

  /**
   * Управление кнопкой "Назад"
   */
  const setBackButton = useCallback((config: {
    isVisible: boolean;
    onClick?: () => void;
  }) => {
    try {
      if (config.onClick) {
        backButton.offClick(config.onClick);
        backButton.onClick(config.onClick);
      }

      if (config.isVisible) {
        backButton.show();
      } else {
        backButton.hide();
      }

      console.log('✅ Back button configured:', config);
    } catch (error) {
      console.error('Error setting back button:', error);
    }
  }, []);

  /**
   * Управление кнопкой настроек
   */
  const setSettingsButton = useCallback((config: {
    isVisible: boolean;
    onClick?: () => void;
  }) => {
    try {
      if (config.onClick) {
        settingsButton.offClick(config.onClick);
        settingsButton.onClick(config.onClick);
      }

      if (config.isVisible) {
        settingsButton.show();
      } else {
        settingsButton.hide();
      }

      console.log('✅ Settings button configured:', config);
    } catch (error) {
      console.error('Error setting settings button:', error);
    }
  }, []);

  /**
   * Открыть ссылку
   */
  const openLink = useCallback((url: string, options?: { tryInstantView?: boolean }) => {
    try {
      postEvent('web_app_open_link', { 
        url, 
        try_instant_view: options?.tryInstantView 
      });
    } catch (error) {
      console.error('Error opening link:', error);
      window.open(url, '_blank');
    }
  }, []);

  /**
   * Открыть Telegram ссылку
   */
  const openTelegramLink = useCallback((url: string) => {
    try {
      postEvent('web_app_open_tg_link', { path_full: url.replace('https://t.me/', '') });
    } catch (error) {
      console.error('Error opening Telegram link:', error);
      window.open(url, '_blank');
    }
  }, []);

  /**
   * Работа с Cloud Storage (для сохранения избранных персонажей)
   */
  const saveToCloudStorage = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      await cloudStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error saving to cloud storage:', error);
      return false;
    }
  }, []);

  const getFromCloudStorage = useCallback(async (key: string): Promise<string | null> => {
    try {
      const value = await cloudStorage.getItem(key);
      return value || null;
    } catch (error) {
      console.error('Error getting from cloud storage:', error);
      return null;
    }
  }, []);

  /**
   * Запросить обновление темы
   */
  const requestTheme = useCallback(() => {
    try {
      const currentTheme = themeParams.state();
      setTheme(currentTheme);
      return currentTheme;
    } catch (error) {
      console.error('Error requesting theme:', error);
      return null;
    }
  }, []);

  /**
   * Установить цвет фона
   */
  const setBackgroundColor = useCallback((color: string) => {
    try {
      if (color.startsWith('#')) {
        miniApp.setBgColor(color as `#${string}`);
      }
    } catch (error) {
      console.error('Error setting background color:', error);
    }
  }, []);

  /**
   * Установить цвет заголовка
   */
  const setHeaderColor = useCallback((color: string) => {
    try {
      if (color.startsWith('#')) {
        miniApp.setHeaderColor(color as `#${string}`);
      }
    } catch (error) {
      console.error('Error setting header color:', error);
    }
  }, []);

  return {
    // Состояние
    isReady,
    user,
    theme,

    // Базовые методы
    sendData,
    showAlert,
    showConfirm,
    showPopup,
    close,
    hapticFeedback,

    // Управление кнопками
    setMainButton,
    hideMainButton,
    setBackButton,
    setSettingsButton,

    // Навигация
    openLink,
    openTelegramLink,

    // Тема
    requestTheme,
    setBackgroundColor,
    setHeaderColor,

    // Cloud Storage
    saveToCloudStorage,
    getFromCloudStorage,
  };
}