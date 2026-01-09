import { useSearch, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { modals } from '~modals/modals';

export const useModalFromUrl = () => {
	const search = useSearch({ from: '/_auth/' });
	const navigate = useNavigate();

	useEffect(() => {
		if (search.modal === 'api-tokens') {
			modals.openApiTokensModal();

			void navigate({
				to: '/',
				search: (prev) => ({
					...prev,
					modal: undefined,
				}),
				replace: true,
			});
		}
	}, [search.modal, navigate]);
};
