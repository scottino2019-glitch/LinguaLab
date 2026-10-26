import { LanguageFile } from '../types';

const CUSTOM_FILES_KEY = 'linguahub_custom_files_v1';
const FAVORITES_KEY = 'linguahub_favorites_v1';
const COMPLETED_KEY = 'linguahub_completed_v1';
const RECENT_KEY = 'linguahub_recent_v1';

export function getCustomFiles(): LanguageFile[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to get custom files:', e);
    return [];
  }
}

export function saveCustomFile(file: LanguageFile): void {
  try {
    const existing = getCustomFiles().filter(f => f.id !== file.id);
    const updated = [file, ...existing];
    localStorage.setItem(CUSTOM_FILES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom file:', e);
  }
}

export function deleteCustomFile(id: string): void {
  try {
    const existing = getCustomFiles().filter(f => f.id !== id);
    localStorage.setItem(CUSTOM_FILES_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to delete custom file:', e);
  }
}

export function getFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): boolean {
  try {
    const favs = new Set(getFavoriteIds());
    const isFav = favs.has(id);
    if (isFav) {
      favs.delete(id);
    } else {
      favs.add(id);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)));
    return !isFav;
  } catch {
    return false;
  }
}

export function getCompletedIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleCompleted(id: string): boolean {
  try {
    const set = new Set(getCompletedIds());
    const isDone = set.has(id);
    if (isDone) {
      set.delete(id);
    } else {
      set.add(id);
    }
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(set)));
    return !isDone;
  } catch {
    return false;
  }
}

export function getRecentFiles(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentFile(id: string): void {
  try {
    const recents = getRecentFiles().filter(item => item !== id);
    recents.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 10)));
  } catch {
    // ignore
  }
}
