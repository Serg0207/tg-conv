// src/components/characters/CharacterCard.tsx
// Создайте этот НОВЫЙ файл (сначала создайте папку characters)

import { type FC } from 'react';
import type { CharacterCardProps } from '@/types/character';
import './CharacterCard.css';

export const CharacterCard: FC<CharacterCardProps> = ({
  character,
  isSelected = false,
  onSelect,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(character);
    }
  };

  return (
    <div
      className={`character-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Выбрать персонажа ${character.name}`}
    >
      {/* Галочка выбора */}
      {isSelected && (
        <div className="character-card__checkmark" aria-label="Выбрано">
          ✓
        </div>
      )}

      {/* Премиум бейдж */}
      {character.isPremium && (
        <div className="character-card__premium-badge">
          ⭐ Premium
        </div>
      )}

      {/* Аватар персонажа */}
      <div className="character-card__avatar">
        <div className="character-card__emoji">{character.emoji}</div>
      </div>

      {/* Имя персонажа */}
      <h3 className="character-card__name">{character.name}</h3>

      {/* Описание */}
      <p className="character-card__description">{character.description}</p>

      {/* Статистика */}
      <div className="character-card__stats">
        <div className="character-card__stat">
          <div className="character-card__stat-value">{character.age}</div>
          <div className="character-card__stat-label">Возраст</div>
        </div>
        <div className="character-card__stat">
          <div className="character-card__stat-value">{character.mood}</div>
          <div className="character-card__stat-label">Настроение</div>
        </div>
      </div>

      {/* Цена для премиум персонажей */}
      {character.isPremium && character.price && (
        <div className="character-card__price">
          {character.price} ⭐ Stars
        </div>
      )}
    </div>
  );
};