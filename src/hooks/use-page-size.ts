import {useState, useEffect, useCallback} from 'react';

const ROW_HEIGHT = 65;
const HEADER_HEIGHT = 100; // title + filters + table header
const PAGINATION_HEIGHT = 52;

export function usePageSize() {
    const [size, setSize] = useState(10);
    const [ready, setReady] = useState(false);

    const measure = useCallback(() => {
        // find the scrollable area (main content inside UserLayout)
        const main = document.querySelector('main');
        if (!main) return;
        const available = main.clientHeight - HEADER_HEIGHT - PAGINATION_HEIGHT;
        const calc = Math.max(5, Math.min(25, Math.floor(available / ROW_HEIGHT)));
        setSize(calc);
        setReady(true);
    }, []);

    useEffect(() => {
        requestAnimationFrame(() => {
            measure();
            setReady(true);
        });
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    return {size, ready};
}
