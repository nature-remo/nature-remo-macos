import React, { useEffect, useState } from 'react';

export function useLocalStorage(
  key: string,
): [string | null, React.Dispatch<React.SetStateAction<string | null>>] {
  const [token, setToken] = useState<string | null>(localStorage.getItem(key));

  useEffect(() => {
    if (token) {
      localStorage.setItem(key, token);
    }
  }, [key, token]);

  return [token, setToken];
}
