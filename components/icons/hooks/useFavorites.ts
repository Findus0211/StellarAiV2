import { useState, useEffect, useCallback } from 'react';
import type { User } from '../../../types';
import useLocalStorage from './useLocalStorage';
import { saveFavorites, loadFavorites } from '../../../services/githubService';

interface UseFavoritesProps {
  user: User | null;
  token: string | null;
}

const useFavorites = ({ user, token }: UseFavoritesProps) => {
  const [localFavorites, setLocalFavorites] = useLocalStorage<string[]>('bsdFavorites', []);
  const [remoteFavorites, setRemoteFavorites] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load remote favorites when user logs in
  useEffect(() => {
    if (user && token) {
      setIsLoading(true);
      loadFavorites(token)
        .then(favs => setRemoteFavorites(favs || []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setRemoteFavorites(null);
    }
  }, [user, token]);

  // Save remote favorites when they change
  useEffect(() => {
    if (user && token && remoteFavorites !== null && !isSaving) {
      setIsSaving(true);
      saveFavorites(remoteFavorites, token)
        .catch(console.error)
        .finally(() => setIsSaving(false));
    }
  }, [remoteFavorites, user, token, isSaving]);

  const favorites = user ? remoteFavorites : localFavorites;
  const setFavorites = user ? setRemoteFavorites : setLocalFavorites;

  return { favorites, setFavorites: setFavorites as (value: string[]) => void, isLoading };
};

export default useFavorites;