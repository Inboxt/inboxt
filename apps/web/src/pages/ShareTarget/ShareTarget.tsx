import { Center, Loader, Stack, Text } from '@mantine/core';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { toastError, toastInfo } from '~components/Toast';
import { ENTRIES } from '~lib/graphql';
import { client } from '~lib/graphql/client';
import { Route } from '~routes/_auth.share-target.tsx';

export const ShareTarget = () => {
	const navigate = useNavigate();
	const { url, text } = useSearch({ from: Route.id });
	const hasProcessed = useRef(false);

	useEffect(() => {
		const processShare = async () => {
			if (hasProcessed.current) {
				return;
			}

			const targetUrl = url || (text && text.startsWith('http') ? text : null);
			if (!targetUrl) {
				toastError({
					title: 'Invalid Share',
					description: 'No URL found in shared content.',
				});
				await navigate({ to: '/' });
				return;
			}

			hasProcessed.current = true;

			try {
				const response = await fetch(`/inbox/items/from-url`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						url: targetUrl,
						labelIds: [],
					}),
					credentials: 'include',
				});

				if (!response.ok) {
					const error = (await response.json()) as { message?: string };
					toastError({
						title: 'Failed to save link',
						description: error.message || 'Internal server error',
					});

					await navigate({ to: '/' });
					return;
				}

				toastInfo({
					title: 'Link added for processing',
					description: 'We’re fetching and analyzing it in the background.',
				});

				await client.refetchQueries({ include: [ENTRIES] });
				await navigate({ to: '/', replace: true });
			} catch (err) {
				console.error('Network error:', err);
				toastError({
					title: 'Failed to save link',
					description: 'Internal server error',
				});
				await navigate({ to: '/' });
			}
		};

		processShare();
	}, [url, text, navigate]);

	return (
		<Center h="100vh">
			<Stack align="center" gap="sm">
				<Loader size="lg" />
				<Text>Saving to Inbox...</Text>
			</Stack>
		</Center>
	);
};
