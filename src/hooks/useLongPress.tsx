import { MouseEvent, TouchEvent, useMemo, useRef } from 'react';

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

	const start = (event: LongPressEvent) => {
		if (typeof callback !== 'function') {
			return;
		}

		timerId.current = window.setTimeout(() => {
			callback(event);
			isLongPress.current = true;
		}, threshold);
	};

	const clear = () => {
		if (timerId.current !== null) {
			clearTimeout(timerId.current);
			timerId.current = null;
		}
		isLongPress.current = false;
	};

	return useMemo(
		() => ({
			onTouchStart: (event: TouchEvent<HTMLElement>) => start(event),
			onTouchEnd: () => clear(),
			onTouchCancel: () => clear(),
		}),
		[callback, threshold],
	);
}
