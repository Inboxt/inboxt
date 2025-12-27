import { CreateHighlightSegmentInput, Highlight } from '~lib/graphql';

export interface SafeRange {
	node: Text;
	start: number;
	end: number;
}

export const getFirstTextNode = (node: Node | null): Node | null => {
	if (!node) {
		return null;
	}

	if (node.nodeType === Node.TEXT_NODE) {
		return node;
	}

	for (let i = 0; i < node.childNodes.length; i++) {
		const child = node.childNodes[i];
		if (!child) {
			continue;
		}

		const textNode = getFirstTextNode(child);

		if (textNode) {
			return textNode;
		}
	}

	return null;
};

export const getNextNode = (node: Node | null): Node | null => {
	if (!node) {
		return null;
	}

	if (node.firstChild) {
		return node.firstChild;
	}

	while (node && !node.nextSibling) {
		node = node.parentNode;
	}

	return node?.nextSibling || null;
};

export const collectNonHighlightTextNodes = (parent: Element): Text[] => {
	const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);
	const textNodes: Text[] = [];
	let t: Node | null = walker.nextNode();
	while (t) {
		// skip text nodes inside .highlight
		let p = (t as Text).parentElement;
		let insideHighlight = false;
		while (p && p !== parent) {
			if (p.classList && p.classList.contains('highlight')) {
				insideHighlight = true;
				break;
			}
			p = p.parentElement;
		}

		if (!insideHighlight) {
			textNodes.push(t as Text);
		}

		t = walker.nextNode();
	}
	return textNodes;
};

export const getAbsoluteXPath = (node: Node | null): string => {
	if (!node) {
		return '';
	}

	const parts: string[] = [];
	let cur: Node | null = node;

	while (cur && cur !== document) {
		// If the current is a TEXT_NODE, walk up to its parent and treat text nodes as `text()[N]`
		if (cur.nodeType === Node.TEXT_NODE) {
			const parent = cur.parentNode as Element | null;
			if (!parent) {
				break;
			}

			// If the parent is a highlight wrapper, skip it and continue from its parent
			if (parent.classList.contains('highlight')) {
				cur = parent.parentElement;
				continue;
			}

			let idx = 0;
			for (let i = 0; i < parent.childNodes.length; i++) {
				const c = parent.childNodes[i];
				if (c?.nodeType === Node.TEXT_NODE) {
					idx++;
				}

				if (c === cur) {
					break;
				}
			}

			parts.unshift(`text()[${idx}]`);
			cur = parent;
			continue;
		}

		if (cur.nodeType === Node.ELEMENT_NODE) {
			const el = cur as Element;
			// If this element is a highlight wrapper, skip adding it to the path and continue
			if (el.classList.contains('highlight')) {
				cur = el.parentElement;
				continue;
			}

			const tag = el.tagName.toLowerCase();
			let index = 1;
			let sibling = el.previousElementSibling;

			while (sibling) {
				if (!sibling.classList.contains('highlight')) {
					if (sibling.tagName.toLowerCase() === tag) {
						index++;
					}
				}

				sibling = sibling.previousElementSibling;
			}

			parts.unshift(`${tag}[${index}]`);
			cur = el.parentElement;
			continue;
		}

		cur = cur.parentNode;
	}

	return parts.length ? `/${parts.join('/')}` : '';
};

export const getContainerTextNodePath = (node: Node | null): string => {
	if (!node || node.nodeType !== Node.TEXT_NODE) {
		return '';
	}

	let parent = node.parentElement;
	if (!parent) {
		return '';
	}

	while (parent && parent.classList.contains('highlight')) {
		parent = parent.parentElement;
	}

	if (!parent) {
		return '';
	}

	const parentXPath = getAbsoluteXPath(parent);
	if (!parentXPath) {
		return '';
	}

	return `${parentXPath}::0`;
};

export const lookupByXPath = (xpath: string, container: HTMLElement): Text | null => {
	if (!xpath) {
		return null;
	}

	try {
		// support parentPath::index form
		const parts = xpath.split('::');

		if (parts.length === 2) {
			const parentPath = parts[0];
			const idx = Number(parts[1]);

			if (!parentPath) {
				return null;
			}

			const parent = document.evaluate(
				parentPath,
				container,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null,
			).singleNodeValue as Element | null;

			if (parent) {
				const nodes = collectNonHighlightTextNodes(parent);
				return nodes[idx] ?? null;
			}
		}

		// fallback to absolute xpath selecting text() node
		const res = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		).singleNodeValue;

		if (res && res.nodeType === Node.TEXT_NODE) {
			return res as Text;
		}
	} catch (_err) {
		// ignore
	}

	return null;
};

export const getSafeTextRanges = (range: Range): SafeRange[] => {
	const safeRanges: SafeRange[] = [];

	let startContainer = range.startContainer;
	let startOffset = range.startOffset;
	let endContainer = range.endContainer;
	let endOffset = range.endOffset;

	if (startContainer.nodeType !== Node.TEXT_NODE) {
		const candidate = startContainer.childNodes[startOffset] || startContainer.firstChild;
		const textNode =
			candidate && candidate.nodeType === Node.TEXT_NODE
				? candidate
				: getFirstTextNode(candidate);
		if (textNode) {
			startContainer = textNode;
			startOffset = 0;
		}
	}

	if (endContainer.nodeType !== Node.TEXT_NODE) {
		const candidate =
			endOffset > 0 ? endContainer.childNodes[endOffset - 1] : endContainer.lastChild;

		if (candidate) {
			if (candidate.nodeType !== Node.TEXT_NODE) {
				let last = candidate;
				while (last && last.lastChild) {
					last = last.lastChild;
				}
				if (last && last.nodeType === Node.TEXT_NODE) {
					endContainer = last;
					endOffset = last.textContent?.length || 0;
				}
			} else {
				endContainer = candidate;
				endOffset = candidate.textContent?.length || 0;
			}
		}
	}

	let currentNode: Node | null = startContainer;
	while (currentNode) {
		if (currentNode.nodeType === Node.TEXT_NODE) {
			safeRanges.push({
				node: currentNode as Text,
				start: currentNode === startContainer ? startOffset : 0,
				end:
					currentNode === endContainer ? endOffset : currentNode.textContent?.length || 0,
			});
		}

		if (currentNode === endContainer) {
			break;
		}

		currentNode = getNextNode(currentNode);
	}

	return safeRanges;
};

export const wrapSafeRangeWithSpan = ({ node, start, end }: SafeRange, highlightId: string) => {
	const text = node.textContent;
	if (!text) {
		return null;
	}

	const beforeText = text.slice(0, start);
	const highlightedText = text.slice(start, end);
	const afterText = text.slice(end);

	const highlightSpan = document.createElement('span');
	highlightSpan.className = 'highlight';
	highlightSpan.textContent = highlightedText;
	highlightSpan.setAttribute('data-highlight-id', highlightId);
	(highlightSpan as HTMLElement).dataset.highlightId = highlightId;

	const parent = node.parentNode;
	if (!parent) {
		return null;
	}

	// Already highlighted, skip wrapping
	if (node.parentElement?.classList && node.parentElement.classList.contains('highlight')) {
		return null;
	}

	const xpath = getContainerTextNodePath(node);
	let globalStart = start;
	let prev = node.previousSibling;
	while (prev) {
		globalStart += prev.textContent?.length || 0;
		prev = prev.previousSibling;
	}
	const globalEnd = globalStart + (end - start);

	const fragment = document.createDocumentFragment();
	if (beforeText) {
		fragment.appendChild(document.createTextNode(beforeText));
	}

	fragment.appendChild(highlightSpan);

	if (afterText) {
		fragment.appendChild(document.createTextNode(afterText));
	}

	const data = {
		highlightId,
		start: globalStart,
		end: globalEnd,
		beforeText,
		highlightedText,
		afterText,
		xpath,
	};

	try {
		if (parent.contains(node)) {
			parent.replaceChild(fragment, node);
		} else {
			return data;
		}
	} catch (_err) {
		return data;
	}

	return data;
};

export const nodeIsOnlySameIdHighlights = (node: Node | null, id: string): boolean => {
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

export const isNodeBlockingUnwrap = (node: Node, startId: string): boolean => {
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
		return (el as HTMLElement).dataset.highlightId !== startId;
	}

	return !nodeIsOnlySameIdHighlights(el, startId);
};

export const applyHighlightsToDOM = (
	container: HTMLElement,
	highlights: Highlight[] | null,
): void => {
	if (!highlights || highlights.length === 0) {
		return;
	}

	const allSegments = highlights
		.flatMap((h) => (h.segments || []).map((s) => ({ ...s, highlightId: h.id })))
		.sort((a, b) => b.startOffset - a.startOffset);

	for (const seg of allSegments) {
		const parentPath = seg.xpath?.split('::')[0];
		if (!parentPath) {
			continue;
		}

		const parent = document.evaluate(
			parentPath,
			container,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		).singleNodeValue as HTMLElement | null;

		if (!parent) {
			continue;
		}

		const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);
		let currentGlobalOffset = 0;
		let targetNode: Text | null = null;
		let localStart = 0;

		let n = walker.nextNode() as Text | null;
		while (n) {
			const nodeLength = n.textContent?.length || 0;

			if (
				currentGlobalOffset <= seg.startOffset &&
				currentGlobalOffset + nodeLength >= seg.startOffset
			) {
				targetNode = n;
				localStart = seg.startOffset - currentGlobalOffset;

				if (localStart >= 0 && localStart < nodeLength) {
					break;
				}
			}

			currentGlobalOffset += nodeLength;
			n = walker.nextNode() as Text | null;
		}

		if (targetNode) {
			const localEnd = localStart + (seg.endOffset - seg.startOffset);
			wrapSafeRangeWithSpan(
				{ node: targetNode, start: localStart, end: localEnd },
				seg.highlightId,
			);
		}
	}

	container.normalize();
};

// Creates highlights from a selection range and returns the segment data
export const createHighlightsFromSelection = (
	range: Range,
	tempId: string,
): { segments: CreateHighlightSegmentInput[] } => {
	const safeRanges = getSafeTextRanges(range);

	if (safeRanges.length === 0) {
		return { segments: [] };
	}

	const segmentsData = [];

	// IMPORTANT: iterate from last -> first so earlier DOM edits do not invalidate later nodes
	for (let i = safeRanges.length - 1; i >= 0; i--) {
		const safeRange = safeRanges[i];
		if (!safeRange) {
			continue;
		}

		const safeRangeData = wrapSafeRangeWithSpan(safeRange, tempId);
		if (safeRangeData) {
			segmentsData.push(safeRangeData);
		}
	}

	const segments = segmentsData.map((r) => ({
		xpath: r.xpath,
		startOffset: r.start,
		endOffset: r.end,
		text: r.highlightedText,
		afterText: r.afterText,
		beforeText: r.beforeText,
	}));

	return { segments };
};

// Update highlight IDs after server confirmation
export const updateHighlightIds = (tempId: string, serverId: string): void => {
	const els = document.querySelectorAll(`[data-highlight-id="${tempId}"]`);
	els.forEach((el) => {
		(el as HTMLElement).dataset.highlightId = serverId;
	});
};

// Remove highlights and clean up nodes
export const removeHighlights = (elements: HTMLElement[]): void => {
	elements.forEach((h) => {
		if (h.parentNode) {
			h.replaceWith(...Array.from(h.childNodes));
		}
	});

	const container = document.getElementById('highlight-container');
	if (container) {
		container.normalize();
	}
};

// A unified function for finding highlights to remove
export const collectContiguousHighlightsToUnwrap = (
	startEl: HTMLElement | null,
	container: HTMLElement,
): HTMLElement[] => {
	if (!startEl) {
		return [];
	}

	const startId = startEl.dataset.highlightId;
	if (!startId) {
		return [startEl];
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
				if ((el as HTMLElement).dataset.highlightId === startId) {
					highlightItems.push({ el: el as HTMLElement, idx: i });
				}
			}
		}
	}

	const startIndex = highlightItems.findIndex((it) => it.el === startEl);
	if (startIndex === -1) {
		return [startEl];
	}

	const expandHighlightsLocal = (
		highlightItemsInner: { el: HTMLElement; idx: number }[],
		nodesInner: Node[],
		startIndexInner: number,
		startIdInner: string,
		direction: 'left' | 'right',
	): HTMLElement[] => {
		const toUnwrap: HTMLElement[] = [];
		let currentNodeIdx = highlightItemsInner[startIndexInner]?.idx;

		const range =
			direction === 'left'
				? { iStart: startIndexInner - 1, iEnd: -1, step: -1 }
				: { iStart: startIndexInner + 1, iEnd: highlightItemsInner.length, step: 1 };

		for (let i = range.iStart; i !== range.iEnd; i += range.step) {
			const candidate = highlightItemsInner[i];
			if (!candidate) {
				break;
			}

			let blocked = false;
			const kStart = direction === 'left' ? candidate.idx + 1 : (currentNodeIdx ?? 0) + 1;
			const kEnd = direction === 'left' ? (currentNodeIdx ?? 0) : candidate.idx;

			for (let k = kStart; k < kEnd; k++) {
				const node = nodesInner[k];
				if (!node) {
					break;
				}

				if (isNodeBlockingUnwrap(node, startIdInner)) {
					blocked = true;
					break;
				}
			}

			if (blocked) {
				break;
			}

			if (direction === 'left') {
				toUnwrap.unshift(candidate.el);
			} else {
				toUnwrap.push(candidate.el);
			}

			currentNodeIdx = candidate.idx;
		}

		return toUnwrap;
	};

	const left = expandHighlightsLocal(highlightItems, nodes, startIndex, startId, 'left');
	const right = expandHighlightsLocal(highlightItems, nodes, startIndex, startId, 'right');
	return [...left, startEl, ...right];
};
