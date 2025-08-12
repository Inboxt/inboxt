import { MouseEvent, TouchEvent, useCallback, useMemo, useRef } from 'react';

type LongPressEvent = MouseEvent<HTMLElement> | TouchEvent<HTMLElement>;

interface UseLongPressOptions {
	threshold?: number;
}

export function useLongPress(
	callback: (event: LongPressEvent) => void,
	options: UseLongPressOptions = {},
) {
	const { threshold = 300 } = options;

	const timerId = useRef<number | null>(null);
	const isLongPress = useRef(false);
	const targetElement = useRef<HTMLElement | null>(null);

	const start = useCallback(
		(event: LongPressEvent) => {
			if (typeof callback !== 'function') {
				return;
			}

			if (event.target instanceof HTMLElement) {
				targetElement.current = event.target;
				targetElement.current.style.userSelect = 'none';
			}

			timerId.current = window.setTimeout(() => {
				callback(event);
				isLongPress.current = true;
			}, threshold);
		},
		[callback, threshold],
	);

	const clear = useCallback(() => {
		if (timerId.current !== null) {
			clearTimeout(timerId.current);
			timerId.current = null;
		}
		isLongPress.current = false;

		if (targetElement.current) {
			targetElement.current.style.userSelect = '';
			targetElement.current = null;
		}
	}, []);

	return useMemo(
		() => ({
			onTouchStart: (event: TouchEvent<HTMLElement>) => start(event),
			onTouchEnd: () => clear(),
			onTouchCancel: () => clear(),
		}),
		[start, clear],
	);
}
