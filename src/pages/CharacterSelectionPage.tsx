// src/pages/CharacterSelectionPage.tsx
// ПРИМЕР компонента с полным использованием нового функционала

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useCharacterSelection } from '@/hooks/useCharacterSelection';
import type { Character } from '@/types/character';

// Моковые данные персонажей
const MOCK_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Anna',
    emoji: '👩‍💼',
    description: 'Профессиональный бизнес-коуч',
    age: 28,
    mood: 'Мотивированная',
    personality: 'professional',
    imageUrl: '/images/anna.jpg',
  },
  {
    id: '2',
    name: 'Kate',
    emoji: '🎨',
    description: 'Креативный художник',
    age: 25,
    mood: 'Вдохновенная',
    personality: 'creative',
    imageUrl: '/images/kate.jpg',
  },
  {
    id: '3',
    name: 'Sophie',
    emoji: '🤗',
    description: 'Дружелюбный психолог',
    age: 30,
    mood: 'Заботливая',
    personality: 'friendly',
    imageUrl: '/images/sophie.jpg',
  },
  {
    id: '4',
    name: 'Luna',
    emoji: '🌙',
    description: 'Загадочная астролог',
    age: 27,
    mood: 'Таинственная',
    personality: 'mysterious',
    imageUrl: '/images/luna.jpg',
    isPremium: true,
    price: 299,
  },
];

export function CharacterSelectionPage() {
  const [characters] = useState<Character[]>(MOCK_CHARACTERS);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  
  const {
    isReady,
    user,
    theme,
    hapticFeedback,
    setBackButton,
    setSettingsButton,
    showPopup,
  } = useTelegramWebApp();

  const {
    selectedCharacter,
    isLoading,
    selectCharacter,
    resetSelection,
    toggleFavorite,
    isFavorite,
    getFavoriteCharacters,
  } = useCharacterSelection();

  // Настройка кнопки "Назад"
  useEffect(() => {
    if (selectedCharacter) {
      setBackButton({
        isVisible: true,
        onClick: () => {
          hapticFeedback('light');
          resetSelection();
        },
      });
    } else {
      setBackButton({ isVisible: false });
    }
  }, [selectedCharacter, setBackButton, resetSelection, hapticFeedback]);

  // Настройка кнопки настроек
  useEffect(() => {
    setSettingsButton({
      isVisible: true,
      onClick: async () => {
        hapticFeedback('light');
        const result = await showPopup({
          title: '⚙️ Настройки',
          message: 'Выберите действие',
          buttons: [
            { id: 'favorites', type: 'default', text: '❤️ Избранное' },
            { id: 'all', type: 'default', text: '📋 Все персонажи' },
            { id: 'close', type: 'close' },
          ],
        });

        if (result === 'favorites') {
          setFilter('favorites');
        } else if (result === 'all') {
          setFilter('all');
        }
      },
    });
  }, [setSettingsButton, showPopup, hapticFeedback]);

  // Обработчик клика на персонажа
  const handleCharacterClick = (character: Character) => {
    if (isLoading) return;

    hapticFeedback('medium');
    
    if (character.isPremium && !user?.isPremium) {
      // Показываем popup для премиум-персонажей
      showPopup({
        title: '⭐ Премиум персонаж',
        message: `${character.name} доступен только для Premium подписчиков.\nЦена: ${character.price}₽`,
        buttons: [
          { id: 'buy', type: 'default', text: '💎 Купить доступ' },
          { id: 'cancel', type: 'cancel' },
        ],
      }).then(result => {
        if (result === 'buy') {
          // Здесь логика покупки
          console.log('Opening payment for:', character.name);
        }
      });
    } else {
      selectCharacter(character);
    }
  };

  // Обработчик избранного
  const handleFavoriteClick = (characterId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleFavorite(characterId);
  };

  // Фильтрация персонажей
  const displayedCharacters = filter === 'favorites' 
    ? getFavoriteCharacters(characters)
    : characters;

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme?.backgroundColor || '#ffffff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: theme?.textColor || '#000000' }}>
            Загрузка...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme?.backgroundColor || '#ffffff',
      padding: '16px',
      paddingBottom: '80px', // Отступ для MainButton
    }}>
      {/* Заголовок */}
      <div style={{
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: theme?.textColor || '#000000',
          marginBottom: '8px',
        }}>
          {user?.firstName ? `Привет, ${user.firstName}! 👋` : 'Выберите персонажа 🎭'}
        </h1>
        <p style={{
          fontSize: '14px',
          color: theme?.hintColor || '#999999',
        }}>
          {filter === 'favorites' 
            ? 'Ваши избранные персонажи ❤️'
            : 'Нажмите на карточку для выбора'
          }
        </p>
      </div>

      {/* Сетка персонажей */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
      }}>
        {displayedCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            isFavorite={isFavorite(character.id)}
            onSelect={() => handleCharacterClick(character)}
            onFavoriteToggle={(e) => handleFavoriteClick(character.id, e)}
            theme={theme}
          />
        ))}
      </div>

      {/* Сообщение если нет избранных */}
      {filter === 'favorites' && displayedCharacters.length === 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          color: theme?.hintColor || '#999999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💔</div>
          <p>У вас пока нет избранных персонажей</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Нажмите на ❤️ чтобы добавить
          </p>
        </div>
      )}
    </div>
  );
}

// Компонент карточки персонажа
function CharacterCard({
  character,
  isSelected,
  isFavorite,
  onSelect,
  onFavoriteToggle,
  theme,
}: {
  character: Character;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  theme: any;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        backgroundColor: isSelected 
          ? (theme?.buttonColor || '#FF6B6B') 
          : (theme?.secondaryBackgroundColor || '#f5f5f5'),
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isSelected ? '2px solid ' + (theme?.buttonColor || '#FF6B6B') : '2px solid transparent',
        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Кнопка избранного */}
      <div
        onClick={onFavoriteToggle}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {isFavorite ? '❤️' : '🤍'}
      </div>

      {/* Premium badge */}
      {character.isPremium && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: '#FFD700',
          color: '#000',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '8px',
        }}>
          ⭐ PREMIUM
        </div>
      )}

      {/* Аватар */}
      <div style={{
        fontSize: '64px',
        textAlign: 'center',
        marginTop: character.isPremium ? '24px' : '8px',
        marginBottom: '12px',
      }}>
        {character.emoji}
      </div>

      {/* Имя */}
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: isSelected ? '#ffffff' : (theme?.textColor || '#000000'),
        marginBottom: '4px',
        textAlign: 'center',
      }}>
        {character.name}
      </h3>

      {/* Описание */}
      <p style={{
        fontSize: '12px',
        color: isSelected ? 'rgba(255, 255, 255, 0.8)' : (theme?.hintColor || '#999999'),
        textAlign: 'center',
        marginBottom: '8px',
        lineHeight: '1.4',
      }}>
        {character.description}
      </p>

      {/* Метаинфо */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '11px',
        color: isSelected ? 'rgba(255, 255, 255, 0.7)' : (theme?.hintColor || '#999999'),
      }}>
        <span>👤 {character.age} лет</span>
        <span>•</span>
        <span>{character.mood}</span>
      </div>

      {/* Цена для премиум */}
      {character.isPremium && character.price && (
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: isSelected ? '#ffffff' : (theme?.buttonColor || '#FF6B6B'),
        }}>
          {character.price}₽
        </div>
      )}
    </div>
  );
}

export default CharacterSelectionPage;