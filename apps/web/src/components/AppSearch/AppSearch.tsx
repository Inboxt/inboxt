import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { AppViews } from '@inbox-reader/common';

import { Route } from '~routes/_auth.index';
import { extractLabelName } from '~utils/extractLabelName';

export const AppSearch = ({ variant = 'filled' }) => {
	const { view } = useSearch({ from: Route.id });

	const [search, setSearch] = useState('');

	useEffect(() => {
		let searchValue = '';
		if (view && view !== AppViews.NEWSLETTERS && !view.startsWith(AppViews.LABEL)) {
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
			variant={variant}
			placeholder="Search for keywords or labels..."
			leftSection={<IconSearch size={18} />}
			flex="1"
			value={search}
			onChange={(e) => setSearch(e.currentTarget.value)}
		/>
	);
};
