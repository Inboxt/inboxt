import { useTextSelection } from '@mantine/hooks';
import { RefObject, useMemo, useState, useEffect, useRef } from 'react';

import { getSafeTextRanges, wrapSafeRangeWithSpan } from '../utils/highlightsDOM';

export function useTextHighlighting(containerRef?: RefObject<HTMLDivElement | null>) {
	const selection = useTextSelection();
	const selectedText = selection?.toString();

	const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	const rangeRect = currentRange ? currentRange.getBoundingClientRect() : null;

	const [hoveredHighlight, setHoveredHighlight] = useState<HTMLElement | null>(null);
	const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

	const hoverClearTimeout = useRef<number | null>(null);

	const nodeIsOnlySameIdHighlights = (node: Node | null, id: string) => {
		if (!node) {
			return true;
		}

		if (node.nodeType === Node.TEXT_NODE) {
			const txt = (node.textContent ?? '').trim();
			if (txt === '') {
				return true;
			}

			const parentEl = node.parentElement as Element | null;
			const containingHighlight = parentEl?.closest('.highlight') as HTMLElement | null;
			return !!containingHighlight && containingHighlight.dataset.highlightId === id;
		}

		const el = node as Element;
		if (el.classList.contains('highlight')) {
			return el.getAttribute('data-highlight-id') === id;
		}

		// Check text nodes under this element: they must be either whitespace or inside same-id highlight
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
		let t = walker.nextNode();
		while (t) {
			if ((t.textContent ?? '').trim() !== '') {
				const parentEl = t.parentElement as Element | null;
				const containingHighlight = parentEl?.closest('.highlight') as HTMLElement | null;
				if (!containingHighlight || containingHighlight.dataset.highlightId !== id) {
					return false;
				}
			}
			t = walker.nextNode();
		}

		// ensure any nested .highlight elements also have the same id
		const innerHighlights = el.querySelectorAll('.highlight');
		for (const h of innerHighlights) {
			if ((h as HTMLElement).dataset.highlightId !== id) {
				return false;
			}
		}

		return true;
	};

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
				setHoveredHighlight(highlightEl);
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

	const highlightSelection = () => {
		if (!selection || selection.rangeCount === 0) {
			return;
		}

		const range = selection.getRangeAt(0);
		const safeRanges = getSafeTextRanges(range);

		// TODO: IDs somehow should be handled by backend
		const highlightId = `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
		safeRanges.forEach((safeRange) => {
			const parent = safeRange.node.parentElement;
			if (parent && parent.classList.contains('highlight')) {
				// toggling behavior: if selecting inside an existing highlight, unwrap that single highlight element
				parent.replaceWith(...Array.from(parent.childNodes));
				return;
			}
			wrapSafeRangeWithSpan(safeRange, highlightId);
		});
	};

	function isNodeBlockingUnwrap(node: Node, startId: string): boolean {
		if (node.nodeType === Node.TEXT_NODE) {
			const txt = (node.textContent ?? '').trim();
			if (txt !== '') {
				const parentEl = node.parentElement as Element | null;
				const containing = parentEl?.closest('.highlight') as HTMLElement | null;
				if (!containing || containing.dataset.highlightId !== startId) {
					return true;
				}
			}
			return false;
		}

		const el = node as Element;
		if (el.classList.contains('highlight')) {
			if ((el as HTMLElement).dataset.highlightId !== startId) {
				return true;
			}
			return false;
		}

		if (!nodeIsOnlySameIdHighlights(el, startId)) {
			return true;
		}

		return false;
	}

	function expandHighlights(
		highlightItems: { el: HTMLElement; idx: number }[],
		nodes: Node[],
		startIndex: number,
		startId: string,
		direction: 'left' | 'right',
	): HTMLElement[] {
		const toUnwrap: HTMLElement[] = [];
		let currentNodeIdx = highlightItems[startIndex]?.idx;
		const range =
			direction === 'left'
				? { iStart: startIndex - 1, iEnd: -1, step: -1 }
				: { iStart: startIndex + 1, iEnd: highlightItems.length, step: 1 };

		for (let i = range.iStart; i !== range.iEnd; i += range.step) {
			const candidate = highlightItems[i];
			let blocked = false;
			const kStart = direction === 'left' ? candidate.idx + 1 : currentNodeIdx + 1;
			const kEnd = direction === 'left' ? currentNodeIdx : candidate.idx;
			for (let k = kStart; k < kEnd; k++) {
				if (isNodeBlockingUnwrap(nodes[k], startId)) {
					blocked = true;
					break;
				}
			}
			if (blocked) break;
			if (direction === 'left') {
				toUnwrap.unshift(candidate.el);
			} else {
				toUnwrap.push(candidate.el);
			}
			currentNodeIdx = candidate.idx;
		}
		return toUnwrap;
	}

	const unwrapContiguousHighlights = (startEl: HTMLElement | null) => {
		if (!startEl) {
			return;
		}
		const container = document.getElementById('highlight-container');
		if (!container) {
			return;
		}

		const startId = startEl.dataset.highlightId;
		if (!startId) {
			// no id -> safe fallback: just unwrap the single element
			if (startEl.parentNode) {
				startEl.replaceWith(...Array.from(startEl.childNodes));
			}

			container.normalize();
			return;
		}

		// Build-ordered list of nodes under the container
		const walker = document.createTreeWalker(
			container,
			NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
			null,
		);

		const nodes: Node[] = [];
		let n: Node | null = walker.nextNode();
		while (n) {
			nodes.push(n);
			n = walker.nextNode();
		}

		type HItem = { el: HTMLElement; idx: number };
		const highlightItems: HItem[] = [];
		for (let i = 0; i < nodes.length; i++) {
			const nd = nodes[i];
			if (nd?.nodeType === Node.ELEMENT_NODE) {
				const el = nd as Element;
				if (el.classList.contains('highlight')) {
					// only consider highlights with the same id
					if ((el as HTMLElement).dataset.highlightId === startId) {
						highlightItems.push({ el: el as HTMLElement, idx: i });
					}
				}
			}
		}

		const startIndex = highlightItems.findIndex((it) => it.el === startEl);
		if (startIndex === -1) {
			// nothing to do
			return;
		}

		const leftUnwrap = expandHighlights(highlightItems, nodes, startIndex, startId, 'left');
		const rightUnwrap = expandHighlights(highlightItems, nodes, startIndex, startId, 'right');
		const toUnwrap = [...leftUnwrap, startEl, ...rightUnwrap];

		// Unwrap all collected highlights
		for (const h of toUnwrap) {
			if (h.parentNode) {
				h.replaceWith(...Array.from(h.childNodes));
			}
		}

		container.normalize();
	};

	const unhighlight = (el: HTMLElement) => {
		if (!el) {
			return;
		}

		unwrapContiguousHighlights(el);
		setHoveredHighlight(null);
		setHoveredRect(null);
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
