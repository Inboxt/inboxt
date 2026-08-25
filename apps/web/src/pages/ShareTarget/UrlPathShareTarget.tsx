import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { NotFound } from '~pages/StatusPage.tsx';

import { ItemFromUrlProcessor } from './ItemFromUrlProcessor';

export const UrlPathShareTarget = () => {
	const params = useParams({ strict: false });
	const [targetUrl, setTargetUrl] = useState<string | null>(null);
	const [isValid, setIsValid] = useState<boolean | null>(null);

	useEffect(() => {
		const fullPath = window.location.pathname + window.location.search + window.location.hash;
		// Remove leading slash
		const url = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;

		if (url) {
			// Fix collapsed slashes in protocol (e.g., https:/en.wikipedia.org -> https://en.wikipedia.org)
			const normalizedUrl = url.replace(/^(https?):\/+/, '$1://');

			// Basic check to see if it looks like a URL
			const hasProtocol =
				normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://');
			const looksLikeUrl =
				hasProtocol || (normalizedUrl.includes('.') && !normalizedUrl.includes(' '));

			if (looksLikeUrl) {
				setTargetUrl(hasProtocol ? normalizedUrl : `https://${normalizedUrl}`);
				setIsValid(true);
			} else {
				setIsValid(false);
			}
		} else {
			setIsValid(false);
		}
	}, [params]);

	if (isValid === false) {
		return <NotFound />;
	}

	if (!targetUrl) {
		return null; // Or a loader
	}

	return <ItemFromUrlProcessor url={targetUrl} />;
};
