import { useState, useCallback, useRef } from 'react';
import { municipiosRS } from '../lib/municipios';

export function useMunicipios() {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleInput = useCallback((value) => {
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = municipiosRS.filter(c => c.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, []);

  const selectCity = useCallback((city) => {
    if (inputRef.current) inputRef.current.value = city;
    setShowSuggestions(false);
  }, []);

  return { inputRef, suggestions, showSuggestions, handleInput, selectCity };
}
