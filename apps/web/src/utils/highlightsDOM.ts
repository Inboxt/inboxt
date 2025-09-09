interface SageRange {
	node: Text;
	start: number;
	end: number;
}

export const getSafeTextRanges = (range: Range): SageRange[] => {
	const safeRanges: SageRange[] = [];

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
					endOffset = last.textContent.length;
				}
			} else {
				endContainer = candidate;
				endOffset = candidate.textContent.length;
			}
		}
	}

	let currentNode = startContainer;
	while (currentNode) {
		if (currentNode.nodeType === Node.TEXT_NODE) {
			safeRanges.push({
				node: currentNode,
				start: currentNode === startContainer ? startOffset : 0,
				end: currentNode === endContainer ? endOffset : currentNode.textContent.length,
			});
		}

		if (currentNode === endContainer) {
			break;
		}

		currentNode = getNextNode(currentNode);
	}
	return safeRanges;
};

export const getFirstTextNode = (node: Node | null): Node | null => {
	if (!node) {
		return null;
	}

	if (node.nodeType === Node.TEXT_NODE) {
		return node;
	}

	for (let i = 0; i < node.childNodes.length; i++) {
		const textNode = getFirstTextNode(node.childNodes[i]);
		if (textNode) {
			return textNode;
		}
	}

	return null;
};

export const getNextNode = (node: Node | null): ChildNode | null => {
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

export const wrapSafeRangeWithSpan = ({ node, start, end }: SageRange, highlightId: string) => {
	const text = node.textContent;
	if (!text) {
		return;
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
		return;
	}

	const fragment = document.createDocumentFragment();
	if (beforeText) {
		fragment.appendChild(document.createTextNode(beforeText));
	}

	fragment.appendChild(highlightSpan);

	if (afterText) {
		fragment.appendChild(document.createTextNode(afterText));
	}

	parent.replaceChild(fragment, node);
};

export const getXPath = (node: Node | null): string => {
	if (!node || node.nodeType !== Node.ELEMENT_NODE) {
		return '';
	}

	let element = node as Element;
	if (element.id) {
		return `//*[@id="${element.id}"]`;
	}

	const parts = [];
	while (element.parentNode) {
		let index = 1;
		let sibling: Element | null = element;

		while ((sibling = sibling.previousElementSibling)) {
			index++;
		}

		parts.unshift(`${element.tagName.toLowerCase()}[${index.toString()}]`);

		element = element.parentNode as Element;
	}

	return '/' + parts.join('/');
};
