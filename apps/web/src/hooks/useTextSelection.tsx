import { useMutation } from '@apollo/client';
import { useTextSelection } from '@mantine/hooks';
import { RefObject, useMemo, useState, useEffect, useRef } from 'react';

import { CREATE_HIGHLIGHT, DELETE_HIGHLIGHTS } from '~lib/graphql';

import {
	createHighlightsFromSelection,
	updateHighlightIds,
	collectContiguousHighlightsToUnwrap,
	removeHighlights,
} from '../utils/highlightsDOM';

export function useTextHighlighting(
	containerRef?: RefObject<HTMLDivElement | null>,
	savedItemId?: string,
) {
	const selection = useTextSelection();
	const selectedText = selection?.toString();

	const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	const rangeRect = currentRange ? currentRange.getBoundingClientRect() : null;

	const [hoveredHighlight, setHoveredHighlight] = useState<HTMLElement | null>(null);
	const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

	const hoverClearTimeout = useRef<number | null>(null);

	const [createHighlight] = useMutation(CREATE_HIGHLIGHT);
	const [deleteHighlights] = useMutation(DELETE_HIGHLIGHTS);

	// clear any hovered highlight when the user starts a new text selection
	useEffect(() => {
		if (selectedText && selectedText.trim()) {
			if (hoverClearTimeout.current) {
				window.clearTimeout(hoverClearTimeout.current);
				hoverClearTimeout.current = null;
			}
			setHoveredHighlight(null);
			setHoveredRect(null);
		}
	}, [selectedText]);

	useEffect(() => {
		const container = containerRef?.current;
		if (!container) {
			return;
		}

		const highlights = container.querySelectorAll<HTMLSpanElement>('.highlight');

		const handleEnter = (e: Event) => {
			if (hoverClearTimeout.current) {
				window.clearTimeout(hoverClearTimeout.current);
				hoverClearTimeout.current = null;
			}
			const target = e.currentTarget as HTMLElement;
			setHoveredHighlight(target);
			setHoveredRect(target.getBoundingClientRect());
		};

		const handleLeave = () => {
			if (hoverClearTimeout.current) {
				window.clearTimeout(hoverClearTimeout.current);
			}

			hoverClearTimeout.current = window.setTimeout(() => {
				setHoveredHighlight(null);
				setHoveredRect(null);
				hoverClearTimeout.current = null;
			}, 200);
		};

		highlights.forEach((el) => {
			el.addEventListener('mouseenter', handleEnter);
			el.addEventListener('mouseleave', handleLeave);
		});

		// handle pointer movements across the document:
		// - cancel hide when entering a highlight or the popover
		// - schedule hide when moving to anything else
		const handleDocumentPointerOver = (ev: PointerEvent) => {
			const target = ev.target as Element | null;
			if (!target) {
				return;
			}

			if (target.closest('[data-highlight-popover]')) {
				if (hoverClearTimeout.current) {
					window.clearTimeout(hoverClearTimeout.current);
					hoverClearTimeout.current = null;
				}
				return;
			}

			const highlightEl = target.closest('.highlight');
			if (highlightEl) {
				if (hoverClearTimeout.current) {
					window.clearTimeout(hoverClearTimeout.current);
					hoverClearTimeout.current = null;
				}
				setHoveredHighlight(highlightEl as HTMLElement);
				setHoveredRect(highlightEl.getBoundingClientRect());
				return;
			}

			if (hoverClearTimeout.current) {
				window.clearTimeout(hoverClearTimeout.current);
			}
			hoverClearTimeout.current = window.setTimeout(() => {
				setHoveredHighlight(null);
				setHoveredRect(null);
				hoverClearTimeout.current = null;
			}, 200);
		};

		document.addEventListener('pointerover', handleDocumentPointerOver);

		return () => {
			highlights.forEach((el) => {
				el.removeEventListener('mouseenter', handleEnter);
				el.removeEventListener('mouseleave', handleLeave);
			});
			document.removeEventListener('pointerover', handleDocumentPointerOver);
			if (hoverClearTimeout.current) {
				window.clearTimeout(hoverClearTimeout.current);
				hoverClearTimeout.current = null;
			}
		};
	}, [containerRef, selectedText]);

	function selectionOverlapsHighlight(range: Range, container: HTMLElement): boolean {
		const highlights = container.querySelectorAll('.highlight');

		for (const highlight of highlights) {
			const highlightRange = document.createRange();
			highlightRange.selectNodeContents(highlight);
			if (
				range.compareBoundaryPoints(Range.END_TO_START, highlightRange) < 0 &&
				range.compareBoundaryPoints(Range.START_TO_END, highlightRange) > 0
			) {
				return true;
			}
		}
		return false;
	}

	const hasValidSelection = useMemo(() => {
		if (!currentRange || !selectedText?.trim()) {
			return false;
		}

		const highlightContainer = document.getElementById('highlight-container');
		if (
			highlightContainer &&
			!(
				highlightContainer.contains(currentRange.startContainer) &&
				highlightContainer.contains(currentRange.endContainer)
			)
		) {
			return false;
		}

		// Prevent highlighting if selection overlaps any highlight
		if (highlightContainer && selectionOverlapsHighlight(currentRange, highlightContainer)) {
			return false;
		}

		const fragment = currentRange.cloneContents();
		return !fragment.querySelector(
			'img, button, input, select, textarea, video, audio, figcaption',
		);
	}, [currentRange, selectedText]);

	const unhighlight = async (el: HTMLElement | null) => {
		if (!el) {
			return;
		}

		const container = document.getElementById('highlight-container');
		if (!container) {
			return;
		}

		// Use shared function to collect highlights to remove
		const toUnwrap = collectContiguousHighlightsToUnwrap(el, container);
		const idsToDelete = [
			...new Set(toUnwrap.map((h) => h.dataset.highlightId).filter(Boolean)),
		]; // Array without duplicates, as segments may have the same id

		removeHighlights(toUnwrap);

		await Promise.all(
			idsToDelete.map((id) =>
				deleteHighlights({
					variables: {
						data: {
							items: [{ id, savedItemId }],
						},
					},
				}),
			),
		);

		setHoveredHighlight(null);
		setHoveredRect(null);
	};

	const highlightSelection = async () => {
		if (!selection || selection.rangeCount === 0 || !savedItemId) {
			return;
		}

		const range = selection.getRangeAt(0);
		const tempId = `h-temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
		const { segments } = createHighlightsFromSelection(range, tempId);

		if (segments.length === 0) {
			return;
		}

		try {
			const { data } = await createHighlight({
				variables: {
					data: {
						savedItemId: savedItemId,
						segments,
					},
				},
			});

			const serverId = data?.createHighlight?.id;
			if (serverId) {
				updateHighlightIds(tempId, serverId);
			}
		} catch (err) {
			const els = document.querySelectorAll(`[data-highlight-id="${tempId}"]`);
			els.forEach((el) => {
				const parent = el.parentNode;
				if (parent) {
					parent.replaceChild(
						document.createTextNode((el as HTMLElement).textContent ?? ''),
						el,
					);
				}
			});

			const container = containerRef?.current;
			if (container) {
				container.normalize();
			}
		}
	};

	return {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		hoveredHighlight,
		hoveredRect,
		unhighlight,
	};
}
