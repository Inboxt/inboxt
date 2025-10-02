import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

import { Route } from '~routes/_auth.index.tsx';

export function AppSearch({ variant }: { variant: 'filled' | 'default' }) {
	const navigate = useNavigate();
	const search = useSearch({ from: Route.id });
	const [input, setInput] = useState(search.q ?? '');

	useEffect(() => {
		setInput(search.q ?? '');
	}, [search.q]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (input !== search.q) {
				return navigate({
					to: '.',
					search: {
						...search,
						q: input || undefined,
					},
					replace: true,
				});
			}
		}, 750);

		return () => clearTimeout(timeout);
	}, [input, search, navigate]);

	return (
		<TextInput
			value={input}
			onChange={(e) => setInput(e.currentTarget.value)}
			variant={variant}
			placeholder="Search for keywords or labels..."
			leftSection={<IconSearch size={18} />}
			flex="1"
		/>
	);
}
