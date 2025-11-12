import { formatBytes } from '@inboxt/common';

import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import alert from './elements/alert';
import button from './elements/button';
import {
	EMAIL_STORAGE_APPROACHING_LIMIT,
	EMAIL_STORAGE_LIMIT_REACHED,
} from '../common/constants/email.constants';

export const storageThresholdTemplate = ({
	usageBytes,
	quotaBytes,
	isExceeded,
}: {
	usageBytes: bigint;
	quotaBytes: bigint;
	isExceeded: boolean;
}) => {
	const emailMeta = isExceeded ? EMAIL_STORAGE_LIMIT_REACHED : EMAIL_STORAGE_APPROACHING_LIMIT;

	const alertContent = [
		`${isExceeded ? 'You’ve reached your storage limit' : 'You’re nearing your storage limit'} (<strong>${formatBytes(usageBytes)}</strong> of <strong>${formatBytes(quotaBytes)}</strong>).`,
		isExceeded
			? `Some features, such as saving new articles or receiving newsletters, may be temporarily paused until space is freed up.`
			: `To keep saving new articles and newsletters, we recommend freeing up some space soon.`,
	];

	const cleanupTips = [
		`• Delete saved items you no longer need.`,
		`• Remove old newsletters.`,
		`• Clear unwanted highlights.`,
	].join('<br/>');

	const contactSupportNote = `
		If you think you may genuinely need more storage for your reading habits, feel free to <a href="mailto:support@inboxt.app">contact our support team</a>. 
		We can review your usage and increase your limit if appropriate.
	`;

	return `
<mjml>
	<mj-head>
		<mj-title>${emailMeta.subject}</mj-title>
		<mj-preview>${emailMeta.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}

		<mj-section>
			<mj-column>
				${header(isExceeded ? '⛔ Storage limit reached' : '⚠️ You’re nearing your storage limit')}
				
				${alert({
					content: alertContent,
					type: isExceeded ? 'important' : 'warning',
				})}

				<mj-text>
					Here are a few ways to quickly free up space:
				</mj-text>

				<mj-text>
					${cleanupTips}
				</mj-text>

				<mj-text>
					${contactSupportNote}
				</mj-text>

				${button({
					text: 'Open Inboxt',
					url: process.env.WEB_URL as string,
				})}

				<mj-text>
					You can check your current storage usage anytime from your profile.
				</mj-text>
			</mj-column>
		</mj-section>

		${footer()}
	</mj-body>
</mjml>
`;
};
