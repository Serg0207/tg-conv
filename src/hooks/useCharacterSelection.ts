// src/hooks/useCharacterSelection.ts
// ФИНАЛЬНАЯ ВЕРСИЯ для @tma.js/sdk-react v3.0.4

import { useState, useCallback, useEffect } from 'react';
import type { Character } from '@/types/character';
import { useTelegramWebApp } from './useTelegramWebApp';
import { sendToN8n } from '@/utils/sendToN8n';

/**
 * Расширенный хук для управления выбором персонажа
 * Поддерживает MainButton, Cloud Storage, улучшенную обратную связь
 */
export function useCharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteCharacters, setFavoriteCharacters] = useState<string[]>([]);
  
  const { 
    sendData, 
    hapticFeedback, 
    user,
    theme,
    setMainButton,
    hideMainButton,
    showPopup,
    showAlert,
    saveToCloudStorage,
    getFromCloudStorage,
  } = useTelegramWebApp();

  // Загружаем избранных персонажей из Cloud Storage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await getFromCloudStorage('favorite_characters');
        if (stored) {
          const favorites = JSON.parse(stored);
          setFavoriteCharacters(favorites);
          console.log('✅ Favorites loaded:', favorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, [getFromCloudStorage]);

  // Управление главной кнопкой при выборе персонажа
  useEffect(() => {
    if (selectedCharacter && !isLoading) {
      // Получаем цвет кнопки, если доступен
      const buttonColor = theme?.buttonColor || '#FF6B6B';
      const buttonTextColor = theme?.buttonTextColor || '#FFFFFF';

      // Показываем кнопку с именем персонажа
      setMainButton({
        text: `Выбрать ${selectedCharacter.name}`,
        isVisible: true,
        isEnabled: true,
        color: buttonColor,
        textColor: buttonTextColor,
        hasShineEffect: true,
        onClick: confirmSelection,
      });
    } else if (isLoading) {
      // Показываем загрузку
      setMainButton({
        text: 'Отправка...',
        isVisible: true,
        isEnabled: false,
        isLoaderVisible: true,
      });
    } else {
      // Скрываем кнопку если ничего не выбрано
      hideMainButton();
    }

    // Cleanup - не нужен, так как хук управляет состоянием
  }, [selectedCharacter, isLoading, theme, setMainButton, hideMainButton]);

  /**
   * Выбрать персонажа
   */
  const selectCharacter = useCallback(
    (character: Character) => {
      // Средняя вибрация при выборе
      hapticFeedback('medium');
      
      setSelectedCharacter(character);
      
      console.log('✅ Character selected:', character.name);
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
    
    // Успешная вибрация
    hapticFeedback('success');

    try {
      // Подготовка данных для отправки
      const dataToSend = {
        action: 'character_selected',
        character_id: selectedCharacter.id,
        character_name: selectedCharacter.name,
        character_emoji: selectedCharacter.emoji,
        character_personality: selectedCharacter.personality,
        character_description: selectedCharacter.description,
        user_id: user?.id,
        username: user?.username,
        first_name: user?.firstName,
        last_name: user?.lastName,
        language_code: user?.languageCode,
        timestamp: new Date().toISOString(),
        source: 'miniapp',
        version: '2.0',
      };

      console.log('📤 Sending character selection:', dataToSend);

      // Отправляем в n8n
      const n8nSuccess = await sendToN8n(dataToSend);

      if (n8nSuccess) {
        console.log('✅ Character selection sent to n8n successfully!');
        
        // Также отправляем через Telegram WebApp API
        sendData(dataToSend);

        // Показываем успешное сообщение
        await showPopup({
          title: '🎉 Успешно!',
          message: `Вы выбрали ${selectedCharacter.name}. Начинаем диалог!`,
          buttons: [
            { id: 'ok', type: 'ok', text: 'Отлично!' }
          ]
        });

        return true;
      } else {
        console.error('❌ Failed to send to n8n');
        
        // Вибрация ошибки
        hapticFeedback('error');
        
        // Показываем ошибку
        await showAlert('Произошла ошибка при отправке. Попробуйте еще раз.');
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error confirming selection:', error);
      
      hapticFeedback('error');
      await showAlert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCharacter, user, sendData, hapticFeedback, showPopup, showAlert]);

  /**
   * Сбросить выбор
   */
  const resetSelection = useCallback(() => {
    setSelectedCharacter(null);
    hapticFeedback('light');
    console.log('🔄 Selection reset');
  }, [hapticFeedback]);

  /**
   * Добавить/удалить персонажа из избранного
   */
  const toggleFavorite = useCallback(async (characterId: string) => {
    hapticFeedback('light');
    
    const isFavorite = favoriteCharacters.includes(characterId);
    const newFavorites = isFavorite
      ? favoriteCharacters.filter(id => id !== characterId)
      : [...favoriteCharacters, characterId];
    
    setFavoriteCharacters(newFavorites);
    
    // Сохраняем в Cloud Storage
    await saveToCloudStorage('favorite_characters', JSON.stringify(newFavorites));
    
    console.log(isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites');
  }, [favoriteCharacters, hapticFeedback, saveToCloudStorage]);

  /**
   * Проверить, является ли персонаж избранным
   */
  const isFavorite = useCallback((characterId: string): boolean => {
    return favoriteCharacters.includes(characterId);
  }, [favoriteCharacters]);

  /**
   * Получить список избранных персонажей
   */
  const getFavoriteCharacters = useCallback((characters: Character[]): Character[] => {
    return characters.filter(char => favoriteCharacters.includes(char.id));
  }, [favoriteCharacters]);

  return {
    // Состояние
    selectedCharacter,
    isLoading,
    favoriteCharacters,

    // Основные действия
    selectCharacter,
    confirmSelection,
    resetSelection,

    // Избранное
    toggleFavorite,
    isFavorite,
    getFavoriteCharacters,
  };
}