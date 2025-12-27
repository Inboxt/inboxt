import { useMutation } from '@apollo/client';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { toastError, toastInfo } from '~components/Toast';
import { ADD_ARTICLE_FROM_URL, ENTRIES } from '~lib/graphql';
import { Route } from '~routes/_auth.share-target.tsx';

export const ShareTarget = () => {
	const navigate = useNavigate();
	const { url, text } = useSearch({ from: Route.id });
	const hasProcessed = useRef(false);

	const [addItemFromUrlMutation] = useMutation(ADD_ARTICLE_FROM_URL);

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
				await addItemFromUrlMutation({
					variables: {
						data: {
							url: targetUrl,
							labelIds: [],
						},
					},
					refetchQueries: [ENTRIES],
				});

				toastInfo({
					title: 'Link added for processing',
					description: 'We’re fetching and analyzing it in the background.',
				});

				await navigate({ to: '/', replace: true });
			} catch (err: any) {
				console.error('Network error:', err);
				toastError({
					title: 'Failed to save link',
					description:
						err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Internal server error',
				});
				await navigate({ to: '/' });
			}
		};

		void processShare();
	}, [url, text, navigate, addItemFromUrlMutation]);

	return (
		<Center h="100vh">
			<Stack align="center" gap="sm">
				<Loader size="lg" />
				<Text>Saving to Inbox...</Text>
			</Stack>
		</Center>
	);
};
