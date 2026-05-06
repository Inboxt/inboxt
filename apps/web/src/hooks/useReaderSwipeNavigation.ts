import { useState } from 'react';

type ReaderSwipeNavigationParams = {
	nextId: string | null;
	prevId: string | null;
	onNavigateToNext: () => void;
	onNavigateToPrev: () => void;
};

const minSwipeDistance = 80;
const minHorizontalRatio = 1.3;
const edgeExclusionDistance = 40;

const isInteractiveTouchTarget = (target: EventTarget | null) => {
	if (!(target instanceof Element)) {
		return false;
	}

	return Boolean(
		target.closest(
			'a, button, input, textarea, select, label, img, video, iframe, [role="button"], [contenteditable="true"]',
		),
	);
};

export const useReaderSwipeNavigation = ({
	nextId,
	prevId,
	onNavigateToNext,
	onNavigateToPrev,
}: ReaderSwipeNavigationParams) => {
	const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
	const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
	const [swipeBlocked, setSwipeBlocked] = useState(false);

	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.targetTouches.length !== 1) {
			setSwipeBlocked(true);
			setTouchStart(null);
			setTouchEnd(null);
			return;
		}

		const touch = e.targetTouches[0];

		if (!touch) {
			return;
		}

		setSwipeBlocked(isInteractiveTouchTarget(e.target));
		setTouchEnd(null);
		setTouchStart({ x: touch.clientX, y: touch.clientY });
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		const touch = e.targetTouches[0];

		if (!touch) {
			return;
		}

		setTouchEnd({ x: touch.clientX, y: touch.clientY });
	};

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd || swipeBlocked) {
			setTouchStart(null);
			setTouchEnd(null);
			setSwipeBlocked(false);
			return;
		}

		const viewportWidth = window.innerWidth;
		const isNearLeftEdge = touchStart.x <= edgeExclusionDistance;
		const isNearRightEdge = touchStart.x >= viewportWidth - edgeExclusionDistance;
		if (isNearLeftEdge || isNearRightEdge) {
			setTouchStart(null);
			setTouchEnd(null);
			setSwipeBlocked(false);
			return;
		}

		const distanceX = touchStart.x - touchEnd.x;
		const distanceY = touchStart.y - touchEnd.y;
		const absDistanceX = Math.abs(distanceX);
		const absDistanceY = Math.abs(distanceY);
		const isHorizontalSwipe = absDistanceX > absDistanceY * minHorizontalRatio;
		if (isHorizontalSwipe && absDistanceX > minSwipeDistance) {
			if (distanceX > 0 && nextId) {
				onNavigateToNext();
			} else if (distanceX < 0 && prevId) {
				onNavigateToPrev();
			}
		}

		setTouchStart(null);
		setTouchEnd(null);
		setSwipeBlocked(false);
	};

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
	};
};
