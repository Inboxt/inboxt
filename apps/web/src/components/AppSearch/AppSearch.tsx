import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconDeviceFloppy, IconSearch } from '@tabler/icons-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';

import { modals } from '~modals/modals';
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
			maxLength={500}
			placeholder="Search for keywords or labels..."
			leftSection={<IconSearch size={18} />}
			rightSection={
				input ? (
					<Tooltip label="Save search">
						<ActionIcon
							variant="subtle"
							onClick={() => modals.openCreateSavedQueryModal({ query: input })}
						>
							<IconDeviceFloppy size={18} />
						</ActionIcon>
					</Tooltip>
				) : undefined
			}
			flex="1"
		/>
	);
}
