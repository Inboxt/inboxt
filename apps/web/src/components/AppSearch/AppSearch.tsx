import { TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';

import { Route } from '~routes/_auth.index.tsx';

export function AppSearch({ variant }: { variant: 'filled' | 'default' }) {
	const navigate = useNavigate();
	const search = useSearch({ from: Route.id });
	const [input, setInput] = useState(search.q ?? '');

	const [prevQ, setPrevQ] = useState(search.q);
	if (search.q !== prevQ) {
		setPrevQ(search.q);
		setInput(search.q ?? '');
	}

	const handleSearch = useDebouncedCallback((query: string) => {
		if (query !== search.q) {
			void navigate({
				to: '.',
				search: { ...search, q: query || undefined },
				replace: true,
			});
		}
	}, 750);

	return (
		<TextInput
			value={input}
			onChange={(e) => {
				setInput(e.currentTarget.value);
				handleSearch(e.currentTarget.value);
			}}
			variant={variant}
			placeholder="Search for keywords or labels..."
			leftSection={<IconSearch size={18} />}
			flex="1"
		/>
	);
}
