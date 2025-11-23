export type ArticleDomainFilter = (doc: Document, dom?: any) => void;

/**
 * A collection of domain-specific filters applied to articles.
 * Each filter is a function that processes and modifies DOM elements to clean up or customize content when accessing articles from specific domains.
 *
 * More to be added in the future.
 */
const articleDomainFilters: Record<string, ArticleDomainFilter> = {
	// Wikipedia reference - invisible when browsing regularly
	'wikipedia.org': (doc) => {
		doc.querySelectorAll('#siteSub, .mw-editsection, .reference, .navbox').forEach((el) =>
			el.remove(),
		);
	},

	// Removes "Next/Previous" navigation menu from MDN Web Docs
	'developer.mozilla.org': (doc) => {
		doc.querySelectorAll('ul.prev-next').forEach((ul) => {
			const hasMenuLi = Array.from(ul.querySelectorAll('li')).some((li) =>
				Array.from(li.classList).some((className) => className.startsWith('menu')),
			);

			if (hasMenuLi) {
				ul.remove();
			}
		});
	},

	// On Medium, removes the DIV after the title containing author info and read time
	'medium.com': (doc) => {
		const titleH1 = doc.querySelector('h1[data-testid="storyTitle"]');
		if (titleH1) {
			const nextElem = titleH1.nextElementSibling;
			if (nextElem && nextElem.tagName === 'DIV') {
				nextElem.remove();
			}
		}
	},

	// For NYTimes, keeps only the main article body section
	'nytimes.com': (doc) => {
		const articleBody = doc.querySelector('section[name="articleBody"]');
		if (articleBody) {
			while (doc.body.firstChild) {
				doc.body.removeChild(doc.body.firstChild);
			}

			doc.body.appendChild(articleBody.cloneNode(true));
		}
	},

	// Removes images that are marked unavailable and author data
	'bbc.com': (doc) => {
		doc.querySelectorAll('img[aria-label="image unavailable"]').forEach((img) => img.remove());
		doc.querySelectorAll('div[data-testid="byline-new-contributors"]').forEach((bylineDiv) => {
			const parent = bylineDiv.parentElement;
			if (parent) {
				parent.remove();
			}
		});
	},

	// Reuters: removes context widgets, promo boxes, and licensing links for images
	'reuters.com': (doc) => {
		doc.querySelectorAll('div[data-testid="ContextWidget"]').forEach((el) => el.remove());
		doc.querySelectorAll('p[data-testid="promo-box"]').forEach((el) => el.remove());
		doc.querySelectorAll('a').forEach((a) => {
			const text = a.textContent?.replace(/\s+/g, ' ').trim();
			if (
				text &&
				text.startsWith('Purchase Licensing') &&
				text.includes('Rights') &&
				text.includes('opens new tab')
			) {
				a.remove();
			}
		});
	},
};

export function applyArticleDomainFilter(host: string, doc: Document) {
	const match = Object.keys(articleDomainFilters).find((key) => host.endsWith(key));
	if (match) {
		articleDomainFilters[match](doc);
	}
}
