// src/hooks/useCharacterSelection.ts
// УПРОЩЕННАЯ ВЕРСИЯ - только Telegram WebApp API

import { useState, useCallback, useEffect } from 'react';
import type { Character } from '@/types/character';
import { useTelegramWebApp } from './useTelegramWebApp';

/**
 * Хук для управления выбором персонажа
 * Отправка данных только через Telegram WebApp API
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
      const buttonColor = theme?.buttonColor || '#FF6B6B';
      const buttonTextColor = theme?.buttonTextColor || '#FFFFFF';

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
      setMainButton({
        text: 'Отправка...',
        isVisible: true,
        isEnabled: false,
        isLoaderVisible: true,
      });
    } else {
      hideMainButton();
    }
  }, [selectedCharacter, isLoading, theme, setMainButton, hideMainButton]);

  /**
   * Выбрать персонажа
   */
  const selectCharacter = useCallback(
    (character: Character) => {
      hapticFeedback('medium');
      setSelectedCharacter(character);
      console.log('✅ Character selected:', character.name);
    },
    [hapticFeedback],
  );

  /**
   * Подтвердить выбор и отправить данные боту
   */
  const confirmSelection = useCallback(async () => {
    if (!selectedCharacter) {
      console.warn('⚠️ No character selected');
      return false;
    }

    // Проверяем что WebApp доступен
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      console.error('❌ Telegram WebApp not available');
      await showAlert('Приложение должно быть открыто в Telegram');
      return false;
    }

    setIsLoading(true);
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
      };

      console.log('📤 Sending character selection to bot:', dataToSend);
      console.log('👤 User data:', user);

      // Отправляем через Telegram WebApp API
      const sent = sendData(dataToSend);

      if (sent) {
        console.log('✅ Data sent successfully via Telegram WebApp API!');
        console.log('📨 Bot should receive web_app_data event with this data');
        
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
        console.error('❌ Failed to send data');
        hapticFeedback('error');
        
        await showAlert(
          'Не удалось отправить данные.\n\n' +
          'Проверьте:\n' +
          '• Приложение открыто в Telegram\n' +
          '• Открыто через Menu Button бота'
        );
        
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
    selectedCharacter,
    isLoading,
    favoriteCharacters,
    selectCharacter,
    confirmSelection,
    resetSelection,
    toggleFavorite,
    isFavorite,
    getFavoriteCharacters,
  };
}