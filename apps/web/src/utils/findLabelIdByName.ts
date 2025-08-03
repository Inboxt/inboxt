import { client } from '../lib/apolloClient';
import { LABELS } from '../lib/graphql';

export function findLabelIdByName(name: string): string | undefined {
	try {
		const { labels } = client.readQuery({
			query: LABELS,
		}) || { labels: [] };

		const label = labels.find(
			(l: { id: string; name: string }) => l.name.toLowerCase() === name.toLowerCase(),
		);

		return label?.id;
	} catch (error) {
		return undefined;
	}
}
