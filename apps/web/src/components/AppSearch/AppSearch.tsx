import { IconSearch } from '@tabler/icons-react';
import { TextInput } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { Route } from '../../routes/_auth.index';
import { AppViews } from '../../constants';
import { useEffect, useState } from 'react';
import { extractLabelName } from '../../utils/extractLabelName.ts';
import { useDebouncedValue } from '@mantine/hooks';

export const AppSearch = () => {
	const { view } = useSearch({ from: Route.id });

	const [search, setSearch] = useState('');
	const [debounced] = useDebouncedValue(search, 600); // todo: test with backend :)

	useEffect(() => {
		let searchValue = '';
		if (view !== AppViews.INBOX) {
			searchValue = `in:${view}`;
		}

		if (view === AppViews.NEWSLETTERS) {
			searchValue = 'is:newsletter';
		}

		if (view?.includes(AppViews.LABEL)) {
			const labelName = extractLabelName(view);

			if (labelName) {
				searchValue = `label:${labelName}`;
			}
		}

		setSearch(searchValue);
	}, [view]);

	return (
		<TextInput
			variant="filled"
			placeholder="Search for keywords or labels..."
			leftSection={<IconSearch size={18} />}
			w="100%"
			value={search}
			onChange={(e) => setSearch(e.currentTarget.value)}
		/>
	);
};
