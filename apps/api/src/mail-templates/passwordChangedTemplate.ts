import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import { EMAIL_CHANGED_PASSWORD } from '../common/constants/email.constants';

export const passwordChangedTemplate = ({ timestamp }: { timestamp: string }) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_CHANGED_PASSWORD.subject}</mj-title>
		<mj-preview>${EMAIL_CHANGED_PASSWORD.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('🔒 Password changed successfully')}
				
				<mj-text>
					The password for your Inbox Reader account was successfully changed on ${timestamp}.
				</mj-text>
				
				<mj-text>
					If you made this change, no further action is required.
				</mj-text>
				
				<mj-text>
					<strong>Did not change your password?</strong> If you didn't make this change, please secure your account immediately by:
				</mj-text>
				
				<mj-text padding-bottom="6px">
					1. Requesting another password reset
				</mj-text>
				<mj-text padding-top="0">
					2. Contacting our support team if needed
				</mj-text>
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
