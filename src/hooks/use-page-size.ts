import { useState, useEffect } from 'react';

const ROW_HEIGHT = 49; // table row height in px
const OVERHEAD = 280 + 30;  // sidebar header(64) + padding(32) + title(40) + thead(49) + pagination(48) + buffer
const MIN_SIZE = 5;
const MAX_SIZE = 30;

export function usePageSize() {
  const [size, setSize] = useState(15);

  useEffect(() => {
    const calc = () => {
      const available = window.innerHeight - OVERHEAD;
      setSize(Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.floor(available / ROW_HEIGHT))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return size;
}
