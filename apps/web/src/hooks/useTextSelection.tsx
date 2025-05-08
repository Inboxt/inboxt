import { RefObject, useEffect, useMemo } from 'react';
import { useTextSelection } from '@mantine/hooks';
import { getSafeTextRanges, getXPath, wrapSafeRangeWithSpan } from '../utils/highlightsDOM.ts';

export function useTextHighlighting(containerRef?: RefObject<HTMLDivElement | null>) {
	const selection = useTextSelection();
	const selectedText = selection?.toString();

	const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	const rangeRect = currentRange ? currentRange.getBoundingClientRect() : null;

	const hasValidSelection = useMemo(() => {
		if (!currentRange) return false;

		const startInFigcaption =
			currentRange.startContainer.nodeType === Node.TEXT_NODE
				? currentRange.startContainer.parentElement?.closest('figcaption')
				: (currentRange.startContainer as Element).closest('figcaption');
		const endInFigcaption =
			currentRange.endContainer.nodeType === Node.TEXT_NODE
				? currentRange.endContainer.parentElement?.closest('figcaption')
				: (currentRange.endContainer as Element).closest('figcaption');

		if (startInFigcaption || endInFigcaption) return false;

		const fragment = currentRange.cloneContents();
		if (fragment.querySelector('img')) return false;

		const invalidSelectors = ['button', 'input', 'select', 'textarea', 'video', 'audio'];
		if (fragment.querySelector(invalidSelectors.join(','))) return false;

		return true;
	}, [currentRange]);

	const isFullyHighlighted = () => {
		if (!selection || selection.rangeCount === 0) return false;

		const range = selection.getRangeAt(0);
		const safeRanges = getSafeTextRanges(range);

		for (const { node, start, end } of safeRanges) {
			if (start === end) continue;

			const text = node.textContent?.slice(start, end);
			if (!text?.trim()) continue;

			const parent = node.parentElement;
			if (!parent || !parent.classList.contains('highlight')) {
				return false;
			}
		}

		return true;
	};

	const highlightSelection = () => {
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const safeRanges = getSafeTextRanges(range);

		// Collect all the unique .highlight spans involved
		const involvedHighlights = new Set<Element>();

		safeRanges.forEach(({ node }) => {
			const parent = node.parentElement;
			if (parent && parent.classList.contains('highlight')) {
				involvedHighlights.add(parent);
			}
		});

		// Check if ALL involved ranges are fully inside highlights
		const fullyHighlighted = isFullyHighlighted();

		if (fullyHighlighted) {
			// Remove only involved highlights, not all siblings
			involvedHighlights.forEach((span) => {
				span.replaceWith(...span.childNodes);
			});
			selection.removeAllRanges();
			return;
		}

		// Remove existing highlights inside selection
		if (containerRef?.current && range) {
			const highlights = containerRef.current.querySelectorAll('.highlight');

			highlights.forEach((highlight) => {
				const highlightRange = document.createRange();
				try {
					highlightRange.selectNodeContents(highlight);
				} catch {
					return;
				}

				// Check for overlap between the highlight and the current range
				const overlaps =
					range.compareBoundaryPoints(Range.END_TO_START, highlightRange) < 0 &&
					range.compareBoundaryPoints(Range.START_TO_END, highlightRange) > 0;

				if (overlaps) {
					// Fully unwrap the highlight
					const parent = highlight.parentNode;
					if (parent) {
						while (highlight.firstChild) {
							parent.insertBefore(highlight.firstChild, highlight);
						}
						parent.removeChild(highlight);
					}
				}
			});
		}

		// New Highlight
		const newSafeRanges = getSafeTextRanges(range);
		const extractedTextParts: string[] = [];
		const extractedHtmlParts: string[] = [];

		newSafeRanges.forEach((safeRange) => {
			wrapSafeRangeWithSpan(safeRange);

			const textContent =
				safeRange.node.textContent?.slice(safeRange.start, safeRange.end) || '';

			const tempDiv = document.createElement('div');
			const span = document.createElement('span');
			span.className = 'highlight';
			span.style.backgroundColor = 'yellow';
			span.textContent = textContent;
			tempDiv.appendChild(span);

			extractedHtmlParts.push(tempDiv.innerHTML);
			extractedTextParts.push(textContent);
		});

		const highlightData = {
			startContainer: getXPath(range.startContainer),
			endContainer: getXPath(range.endContainer),
			startOffset: range.startOffset,
			endOffset: range.endOffset,
			content: extractedTextParts.join(' '),
			htmlContent: extractedHtmlParts.join(' '),
		};

		console.log(highlightData);
		selection.removeAllRanges();
	};

	useEffect(() => {
		if (!containerRef?.current) return;

		const sel = document.getSelection();
		if (sel && containerRef.current.contains(sel.anchorNode)) {
		} else {
			sel?.removeAllRanges();
		}
	}, [selection, containerRef]);

	return {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		isFullyHighlighted,
	};
}
