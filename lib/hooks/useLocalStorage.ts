import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  // Get from local storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          try {
            // Attempt to parse if it looks like a JSON object or array
            if (item.startsWith('{') || item.startsWith('[')) {
              setStoredValue(JSON.parse(item));
            } else {
              // Otherwise, treat as a plain string
              setStoredValue(item as T);
            }
          } catch (parseError) {
            console.warn(`Could not parse localStorage item for key "${key}" as JSON. Treating as plain string.`, parseError);
            setStoredValue(item as T);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}