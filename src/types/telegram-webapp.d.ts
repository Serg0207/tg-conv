// src/types/telegram-webapp.d.ts
// Типизация для Telegram WebApp SDK

interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  }
  
  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramWebAppUser;
      query_id?: string;
      auth_date?: number;
      hash?: string;
    };
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: {
      bg_color?: string;
      text_color?: string;
      hint_color?: string;
      link_color?: string;
      button_color?: string;
      button_text_color?: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    
    // Methods
    ready(): void;
    expand(): void;
    close(): void;
    sendData(data: string): void;
    showPopup(params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
      }>;
    }, callback?: (buttonId: string) => void): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  }
  
  interface Telegram {
    WebApp: TelegramWebApp;
  }
  
  interface Window {
    Telegram?: Telegram;
  }
  
  // Для глобального использования
  declare global {
    interface Window {
      Telegram?: Telegram;
    }
  }
  
  export {};