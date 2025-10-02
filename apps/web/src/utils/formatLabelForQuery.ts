export const formatLabelForQuery = (label: string) => {
	const needsQuotes = /\s|[":]/.test(label);
	const escaped = label.replace(/"/g, '\\"');
	return needsQuotes ? `label:"${escaped}"` : `label:${escaped}`;
};
