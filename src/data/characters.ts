// src/data/characters.ts
// Создайте этот НОВЫЙ файл

import type { Character } from '@/types/character';

/**
 * Список всех доступных персонажей
 */
export const characters: Character[] = [
  {
    id: 'anna',
    name: 'Анна',
    emoji: '👩‍🦰',
    description: 'Творческая и артистичная личность. Любит искусство, музыку и глубокие беседы о жизни.',
    age: 25,
    mood: 'Вдохновлённая',
    personality: 'creative',
    isPremium: false,
  },
  {
    id: 'kate',
    name: 'Кейт',
    emoji: '👩‍💼',
    description: 'Деловая и целеустремлённая. Предпочитает прямое общение и практичный подход к делам.',
    age: 28,
    mood: 'Энергичная',
    personality: 'professional',
    isPremium: false,
  },
  // Можно легко добавить больше персонажей:
  /*
  {
    id: 'sofia',
    name: 'София',
    emoji: '👩‍🎤',
    description: 'Загадочная и интригующая. Любит философские беседы и ночные разговоры.',
    age: 26,
    mood: 'Задумчивая',
    personality: 'mysterious',
    isPremium: true,
    price: 100,
  },
  {
    id: 'lisa',
    name: 'Лиза',
    emoji: '👩‍🎨',
    description: 'Дружелюбная и открытая. Всегда готова поддержать и развеселить.',
    age: 24,
    mood: 'Весёлая',
    personality: 'friendly',
    isPremium: false,
  },
  */
];

/**
 * Получить персонажа по ID
 */
export function getCharacterById(id: string): Character | undefined {
  return characters.find((char) => char.id === id);
}

/**
 * Получить бесплатных персонажей
 */
export function getFreeCharacters(): Character[] {
  return characters.filter((char) => !char.isPremium);
}

/**
 * Получить премиум персонажей
 */
export function getPremiumCharacters(): Character[] {
  return characters.filter((char) => char.isPremium);
}