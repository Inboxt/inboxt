import { useMutation } from '@apollo/client';
import { Box, Skeleton } from '@mantine/core';
import { useLongPress } from '@mantine/hooks';
import { IconHighlight } from '@tabler/icons-react';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';

import { HighlightPopover } from '~components/HighlightPopover';
import { toastError, toastInfo } from '~components/Toast';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';
import { ADD_ARTICLE_FROM_URL, ENTRIES, SavedItem } from '~lib/graphql';
import { applyHighlightsToDOM } from '~utils/highlightsDOM.ts';

import { ReaderImageLightbox, ReaderLightboxImage } from './ReaderImageLightbox';
import { ReaderLinkActions } from './ReaderLinkActions';

type ArticleWithHighlightsProps = {
	content: string | null;
	data: SavedItem;
};

type LinkActionsState = {
	url: string;
	x: number;
	y: number;
};

export const HighlightableArticle = ({ content, data }: ArticleWithHighlightsProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const containerRef = useRef<HTMLDivElement>(null);
	const [applyingHighlights, setApplyingHighlights] = useState(false);
	const [lightboxImage, setLightboxImage] = useState<ReaderLightboxImage | null>(null);
	const [linkActions, setLinkActions] = useState<LinkActionsState | null>(null);
	const [addItemFromUrlMutation] = useMutation(ADD_ARTICLE_FROM_URL);

	const {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		hoveredHighlight,
		hoveredRect,
		unhighlight,
	} = useTextHighlighting(containerRef, data.id);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const container = containerRef.current;
		const highlights = data.highlights;

		container.innerHTML = content || '';
		container.normalize();

		if (!highlights || highlights.length === 0) {
			setApplyingHighlights(false);
			return;
		}

		let cancelled = false;
		setApplyingHighlights(true);
		setTimeout(() => {
			if (!cancelled) {
				try {
					applyHighlightsToDOM(container, highlights);
				} finally {
					setApplyingHighlights(false);
				}
			}
		}, 0);

		return () => {
			cancelled = true;
		};
	}, [containerRef, data.highlights, content]);

	const sanitizedContent = useMemo(
		() => ({
			__html: content || '',
		}),
		[content],
	);

	const getAnchorFromTarget = (target: EventTarget | null) => {
		const element = target as HTMLElement | null;
		const anchor = element?.closest('a[href]') as HTMLAnchorElement | null;

		if (!anchor?.href) {
			return null;
		}

		return anchor;
	};

	const openLinkActions = useCallback((url: string, x: number, y: number) => {
		setLinkActions({
			url,
			x,
			y,
		});
	}, []);

	const closeLinkActions = useCallback(() => {
		setLinkActions(null);
	}, []);

	const longPressHandlers = useLongPress(
		(ev) => {
			const anchor = getAnchorFromTarget(ev.target);
			if (anchor) {
				ev.preventDefault();
				ev.stopPropagation();

				const touchPoint = 'changedTouches' in ev ? ev.changedTouches?.[0] : null;
				if (touchPoint) {
					openLinkActions(anchor.href, touchPoint.clientX, touchPoint.clientY);
					return;
				}

				openLinkActions(anchor.href, window.innerWidth / 2, window.innerHeight / 2);
				return;
			}

			const target = ev.target as HTMLElement | null;
			const highlightEl = target?.closest('.highlight') as HTMLElement | null;
			if (highlightEl) {
				void unhighlight(highlightEl);
			}
		},
		{ threshold: 700 },
	);

	const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (linkActions) {
			closeLinkActions();
			return;
		}

		const target = event.target as HTMLElement | null;
		const image = target?.closest('img') as HTMLImageElement | null;

		if (!image?.src) {
			return;
		}

		if (image.closest('a')) {
			event.preventDefault();
			event.stopPropagation();
		}

		setLightboxImage({
			src: image.currentSrc || image.src,
			alt: image.alt || 'Article image',
			naturalWidth: image.naturalWidth || 0,
			naturalHeight: image.naturalHeight || 0,
		});
	};

	const handleContainerContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
		const anchor = getAnchorFromTarget(event.target);
		if (!anchor) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		openLinkActions(anchor.href, event.clientX, event.clientY);
	};

	const handleSaveLink = async () => {
		if (!linkActions?.url) {
			return;
		}

		try {
			await addItemFromUrlMutation({
				variables: {
					data: {
						url: linkActions.url,
						labelIds: [],
					},
				},
				refetchQueries: [ENTRIES],
			});

			// todo: make this re-usable as it's already duplicated 3 times.
			toastInfo({
				title: 'Link added for processing',
				description: 'We’re fetching and analyzing it in the background.',
			});
		} catch (err: any) {
			console.error('Network error:', err);
			toastError({
				title: 'Failed to save link',
				description:
					err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Internal server error',
			});
		} finally {
			closeLinkActions();
		}
	};

	const handleOpenLink = () => {
		if (!linkActions?.url) {
			return;
		}

		window.open(linkActions.url, '_blank', 'noopener,noreferrer');
		closeLinkActions();
	};

	const handleCopyLink = async () => {
		if (!linkActions?.url) {
			return;
		}

		try {
			await navigator.clipboard.writeText(linkActions.url);
			toastInfo({
				title: 'Link copied',
			});
		} catch {
			toastError({
				title: 'Unable to copy link',
			});
		}

		closeLinkActions();
	};

	return (
		<>
			<Skeleton visible={applyingHighlights} mih={560}>
				<Box
					ref={containerRef}
					id="highlight-container"
					dangerouslySetInnerHTML={sanitizedContent}
					style={{ visibility: applyingHighlights ? 'hidden' : 'visible' }}
					pb="xxl"
					onClick={handleContainerClick}
					onContextMenu={handleContainerContextMenu}
					{...longPressHandlers}
				/>
			</Skeleton>

			<ReaderLinkActions
				linkActions={linkActions}
				onClose={closeLinkActions}
				onSaveLink={() => {
					void handleSaveLink();
				}}
				onOpenLink={handleOpenLink}
				onCopyLink={() => {
					void handleCopyLink();
				}}
			/>

			<ReaderImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

			<HighlightPopover
				visible={!!selectedText && !!rangeRect && hasValidSelection && isAboveMdScreen}
				rect={rangeRect}
				buttonLabel="Highlight"
				buttonIcon={<IconHighlight size={21} />}
				onButtonClick={highlightSelection}
			/>

			<HighlightPopover
				visible={!selectedText && !!hoveredHighlight && !!hoveredRect && isAboveMdScreen}
				rect={hoveredRect}
				buttonLabel="Unhighlight"
				onButtonClick={() => unhighlight(hoveredHighlight)}
			/>
		</>
	);
};
