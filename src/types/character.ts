// src/types/character.ts
// Создайте этот НОВЫЙ файл

/**
 * Тип персонажа
 */
export interface Character {
    id: string;
    name: string;
    emoji: string;
    description: string;
    age: number;
    mood: string;
    personality: 'creative' | 'professional' | 'friendly' | 'mysterious';
    imageUrl?: string;
    isPremium?: boolean;
    price?: number;
  }
  
  /**
   * Статус выбора персонажа
   */
  export interface CharacterSelection {
    characterId: string;
    selectedAt: Date;
    userId?: number;
  }
  
  /**
   * Пропсы для карточки персонажа
   */
  export interface CharacterCardProps {
    character: Character;
    isSelected?: boolean;
    onSelect?: (character: Character) => void;
    disabled?: boolean;
  }