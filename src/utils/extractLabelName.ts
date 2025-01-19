export const extractLabelName = (labelView: string): string | null => {
	if (labelView.startsWith('label:')) {
		return labelView.split(':')[1];
	}
	return null;
};
