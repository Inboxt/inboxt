import { EMAIL_ACCOUNT_DELETED } from '~common/constants/email.constants';

import alert from './elements/alert';
import appHeader from './elements/appHeader';
import baseStyles from './elements/baseStyles';
import button from './elements/button';
import footer from './elements/footer';
import header from './elements/header';

export const accountDeletedTemplate = ({ timestamp }: { timestamp: string }) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_ACCOUNT_DELETED.subject}</mj-title>
		<mj-preview>${EMAIL_ACCOUNT_DELETED.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('🔒 Account deleted')}
				
				<mj-text>
					As requested, your Inboxt account has been permanently deleted on ${timestamp}.
				</mj-text>
				
				<mj-text>
					All your personal data, including saved articles, newsletter subscriptions, reading preferences, and account information, have been permanently removed from this instance.
				</mj-text>
				
				${alert({
					content: 'This action is irreversible. Your data cannot be recovered.',
					type: 'important',
				})}
				
				<mj-text>
					We're sorry to see you go.
				</mj-text>
				
				<mj-text>
					If you deleted your account by mistake or wish to create a new account in the future, you can always register again.
				</mj-text>
				
				${button({
					text: 'Create New Account',
					url: `${process.env.APP_URL || process.env.API_URL}/auth?mode=signup`,
				})}
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
