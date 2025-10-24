// src/mockEnv.ts
import { mockTelegramEnv } from '@tma.js/sdk-react';

// Проверяем запущены ли мы в Telegram
const isInTelegram = window.location.search.includes('tgWebAppData') 
  || window.location.hash.includes('tgWebAppData');

// Если НЕ в Telegram - создаем mock окружение
if (!isInTelegram) {
  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#17212b',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#17212b',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#232e3c',
    section_bg_color: '#17212b',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;

  mockTelegramEnv({
    launchParams: new URLSearchParams([
      ['tgWebAppThemeParams', JSON.stringify(themeParams)],
      ['tgWebAppData', new URLSearchParams([
        ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
        ['hash', 'mock-hash-for-dev'],
        ['signature', 'mock-signature'],
        ['user', JSON.stringify({
          id: 99281932,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru',
          is_premium: true,
        })],
      ]).toString()],
      ['tgWebAppVersion', '8.0'],
      ['tgWebAppPlatform', 'tdesktop'],
    ]),
  });

  console.log('🔧 Mock Telegram environment initialized');
}