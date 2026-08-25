import { useMutation } from '@apollo/client/react';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { toastError, toastInfo } from '~components/Toast';
import { ADD_ARTICLE_FROM_URL, ENTRIES } from '~lib/graphql';

interface ItemFromUrlProcessorProps {
	url: string | null;
}

export const ItemFromUrlProcessor = ({ url }: ItemFromUrlProcessorProps) => {
	const navigate = useNavigate();
	const hasProcessed = useRef(false);

	const [addItemFromUrlMutation] = useMutation(ADD_ARTICLE_FROM_URL);

	useEffect(() => {
		const processShare = async () => {
			if (hasProcessed.current) {
				return;
			}

			if (!url) {
				toastError({
					title: 'Invalid Share',
					description: 'No URL found to save.',
				});
				await navigate({ to: '/' });
				return;
			}

			hasProcessed.current = true;
			const normalizedUrl = url.replace(/^(https?):\/+/, '$1://');

			try {
				await addItemFromUrlMutation({
					variables: {
						data: {
							url: normalizedUrl,
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
	}, [url, navigate, addItemFromUrlMutation]);

	return (
		<Center h="100vh">
			<Stack align="center" gap="sm">
				<Loader size="lg" />
				<Text>Saving to Inbox...</Text>
			</Stack>
		</Center>
	);
};
