import React, { useState, useMemo } from 'react';
import { BUNGO_CHARACTERS } from '../constants.ts';
import type { Character, User } from '../types.ts';
import useFavorites from './icons/hooks/useFavorites.ts';
import StarIcon from './icons/StarIcon.tsx';

interface CharacterSelectorProps {
  onSelectCharacter: (character: Character) => void;
  user: User | null;
  token: string | null;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelectCharacter, user, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, setFavorites, isLoading } = useFavorites({ user, token });

  const toggleFavorite = (e: React.MouseEvent, characterId: string) => {
    e.stopPropagation();
    const currentFavorites = favorites || [];
    setFavorites(
      currentFavorites.includes(characterId) 
        ? currentFavorites.filter(id => id !== characterId) 
        : [...currentFavorites, characterId]
    );
  };

  const filteredCharacters = useMemo(() => 
    BUNGO_CHARACTERS.filter(char => 
      char.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const favoritedCharacters = useMemo(() => 
    filteredCharacters.filter(char => favorites?.includes(char.id)),
    [filteredCharacters, favorites]
  );

  const otherCharacters = useMemo(() =>
    filteredCharacters.filter(char => !favorites?.includes(char.id)),
    [filteredCharacters, favorites]
  );
  
  const CharacterCard: React.FC<{character: Character}> = ({ character }) => (
     <div
      onClick={() => onSelectCharacter(character)}
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group transform hover:scale-105 hover:shadow-blue-500/30 transition-all duration-300 relative"
    >
      <img src={character.image} alt={character.name} className="w-full h-40 sm:h-56 object-cover" />
      <button 
        onClick={(e) => toggleFavorite(e, character.id)} 
        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
        aria-label={`Favorite ${character.name}`}
        disabled={isLoading}
      >
        <StarIcon filled={favorites?.includes(character.id) ?? false} />
      </button>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{character.name}</h3>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-8 bg-gradient-to-b from-gray-900 to-gray-800/80">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">BSD Mode</h2>
          <p className="text-gray-400 mt-2">Choose a character to begin your conversation.</p>
        </div>
        <div className="max-w-xl mx-auto mb-6">
            <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {isLoading && !favorites && <p className="text-center text-gray-400">Loading favorites...</p>}
          
          {/* Favorites Section */}
          {user && favoritedCharacters.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-white mb-6 border-l-4 border-blue-400 pl-3">Favorites</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {favoritedCharacters.map(char => <CharacterCard key={char.id} character={char} />)}
              </div>
            </div>
          )}

          {/* All Characters Section */}
          <div>
            {user && favoritedCharacters.length > 0 && (
              <h3 className="text-2xl font-semibold text-white mb-6 border-l-4 border-gray-500 pl-3">All Characters</h3>
            )}
            {otherCharacters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {otherCharacters.map(char => <CharacterCard key={char.id} character={char} />)}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-gray-400 py-10">
                    <p>No characters found matching your search.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;