import {useCallback, useEffect, useState} from 'react';

const ROW_HEIGHT = 65;
const HEADER_HEIGHT = 100; // title + filters + table header
const PAGINATION_HEIGHT = 52;

interface PageSizeOptions {
    containerSelector?: string;
    rowSelector?: string;
    rowHeight?: number;
    rowGap?: number;
    safetyMargin?: number;
    headerHeight?: number;
    paginationHeight?: number;
    min?: number;
    max?: number;
}

export function usePageSize(options: PageSizeOptions = {}) {
    const {
        rowHeight = ROW_HEIGHT,
        rowGap = 0,
        safetyMargin = 0,
        headerHeight = HEADER_HEIGHT,
        paginationHeight = PAGINATION_HEIGHT,
        min = 5,
        max = 25,
        containerSelector = 'main',
        rowSelector,
    } = options;
    const [size, setSize] = useState(min);
    const [ready, setReady] = useState(false);

    const measure = useCallback(() => {
        // find the scrollable area (main content inside UserLayout)
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const measuredRows = rowSelector
            ? [...container.querySelectorAll<HTMLElement>(rowSelector)]
            : [];
        const measuredRowHeight = measuredRows.length > 0
            ? Math.max(...measuredRows.map((row) => row.getBoundingClientRect().height))
            : rowHeight;
        const available = container.clientHeight - headerHeight - paginationHeight - safetyMargin;
        const calc = Math.max(
            min,
            Math.min(max, Math.floor((available + rowGap) / (measuredRowHeight + rowGap))),
        );
        setSize(calc);
        setReady(true);
    }, [containerSelector, headerHeight, max, min, paginationHeight, rowGap, rowHeight, rowSelector, safetyMargin]);

    useEffect(() => {
        requestAnimationFrame(() => {
            measure();
        });
        const container = document.querySelector(containerSelector);
        const observer = container && typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(measure)
            : null;
        const mutationObserver = container && typeof MutationObserver !== 'undefined'
            ? new MutationObserver(() => requestAnimationFrame(measure))
            : null;
        if (container && observer) observer.observe(container);
        if (container && mutationObserver) {
            mutationObserver.observe(container, {childList: true, subtree: true});
        }
        window.addEventListener('resize', measure);
        return () => {
            observer?.disconnect();
            mutationObserver?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [containerSelector, measure]);

    return {size, ready};
}
