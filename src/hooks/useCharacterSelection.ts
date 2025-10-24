// src/hooks/useCharacterSelection.ts
// Создайте этот НОВЫЙ файл

import { useState, useCallback } from 'react';
import type { Character } from '@/types/character';
import { useTelegramWebApp } from './useTelegramWebApp';

/**
 * Хук для управления выбором персонажа
 */
export function useCharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendData, hapticFeedback, user } = useTelegramWebApp();

  /**
   * Выбрать персонажа
   */
  const selectCharacter = useCallback(
    (character: Character) => {
      hapticFeedback('medium');
      setSelectedCharacter(character);
    },
    [hapticFeedback],
  );

  /**
   * Подтвердить выбор и отправить данные
   */
  const confirmSelection = useCallback(async () => {
    if (!selectedCharacter) {
      return false;
    }

    setIsLoading(true);
    hapticFeedback('success');

    try {
      // Подготовка данных для отправки в n8n
      const dataToSend = {
        action: 'character_selected',
        character_id: selectedCharacter.id,
        character_name: selectedCharacter.name,
        character_emoji: selectedCharacter.emoji,
        character_personality: selectedCharacter.personality,
        user_id: user?.id,
        username: user?.username,
        first_name: user?.first_name,
        timestamp: new Date().toISOString(),
        source: 'miniapp',
      };

      // Отправляем данные
      const success = sendData(dataToSend);

      if (success) {
        console.log('Character selection sent successfully!');
        return true;
      } else {
        console.error('Failed to send character selection');
        return false;
      }
    } catch (error) {
      console.error('Error confirming selection:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCharacter, user, sendData, hapticFeedback]);

  /**
   * Сбросить выбор
   */
  const resetSelection = useCallback(() => {
    setSelectedCharacter(null);
    hapticFeedback('light');
  }, [hapticFeedback]);

  return {
    selectedCharacter,
    isLoading,
    selectCharacter,
    confirmSelection,
    resetSelection,
  };
}