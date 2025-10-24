// src/pages/CharacterSelectionPage.tsx
// Создайте этот НОВЫЙ файл

import { type FC } from 'react';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { characters } from '@/data/characters';
import { useCharacterSelection } from '@/hooks/useCharacterSelection';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import './CharacterSelectionPage.css';

export const CharacterSelectionPage: FC = () => {
  const { selectedCharacter, isLoading, selectCharacter, confirmSelection } =
    useCharacterSelection();
  const { close, showAlert } = useTelegramWebApp();

  const handleConfirm = async () => {
    if (!selectedCharacter) {
      showAlert('Пожалуйста, выберите персонажа');
      return;
    }

    const success = await confirmSelection();

    if (success) {
      showAlert(`Вы выбрали ${selectedCharacter.name}! Начинаем общение 💬`);
      // В dev режиме не закрываем, в production закроем Mini App
      if (!import.meta.env.DEV) {
        setTimeout(() => close(), 1500);
      }
    } else {
      showAlert('Ошибка при отправке данных. Попробуйте снова.');
    }
  };

  return (
    <div className="character-selection-page">
      {/* Заголовок */}
      <div className="character-selection-page__header">
        <h1 className="character-selection-page__title">Выберите персонажа</h1>
        <p className="character-selection-page__subtitle">
          Выберите персонажа для начала общения
        </p>
      </div>

      {/* Сетка персонажей */}
      <div className="character-selection-page__grid">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onSelect={selectCharacter}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Кнопка подтверждения */}
      {selectedCharacter && (
        <div className="character-selection-page__footer">
          <button
            className="character-selection-page__confirm-button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Отправка...
              </>
            ) : (
              <>Продолжить с {selectedCharacter.name}</>
            )}
          </button>
        </div>
      )}

      {/* Подсказка */}
      {!selectedCharacter && (
        <div className="character-selection-page__hint">
          💡 Нажмите на карточку персонажа, чтобы выбрать
        </div>
      )}
    </div>
  );
};