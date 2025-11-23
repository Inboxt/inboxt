type AlertProps = {
	content?: string | string[];
	type?: 'info' | 'important' | 'tip' | 'warning';
};

export default ({ content, type }: AlertProps): string => {
	let prefix = '';

	switch (type) {
		case 'important':
			prefix = '<strong>Important:</strong> ';
			break;
		case 'tip':
			prefix = '<strong>Pro tip:</strong> ';
			break;
		case 'warning':
			prefix = '<strong>Warning:</strong> ';
			break;
		case 'info':
			prefix = '<strong>Note:</strong> ';
	}

	let alertContent = '';
	if (typeof content === 'string' && content) {
		alertContent = `<mj-text padding="12px">${prefix}${content}</mj-text>`;
	} else if (Array.isArray(content) && content.length > 0) {
		alertContent = content
			.map((line, index) => {
				const isFirst = index === 0;
				const isLast = index === content.length - 1;
				let padding = '';

				if (isFirst && isLast) {
					padding = 'padding="0"';
				} else if (isFirst) {
					padding = 'padding-bottom="0"';
				} else if (isLast) {
					padding = 'padding-top="6px"';
				} else {
					padding = 'padding-top="6px" padding-bottom="0"';
				}

				// Prefix is only for the first line
				const displayLine = isFirst ? `${prefix}${line}` : line;
				return `<mj-text ${padding}>${displayLine}</mj-text>`;
			})
			.join('\n');
	}

	return `
		<mj-section padding-top="8px" padding-bottom="8px">
			<mj-column background-color="#f5f7fb" border-radius="6px" padding="12px">
				${alertContent}
			</mj-column>
		</mj-section>
	`;
};
