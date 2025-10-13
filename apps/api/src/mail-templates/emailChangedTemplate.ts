import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import alert from './elements/alert';
import button from './elements/button';
import { EMAIL_CHANGED_EMAIL } from '../common/constants/email.constants';

export const emailChangedTemplate = ({
	timestamp,
	oldEmail,
	newEmail,
}: {
	timestamp: string;
	oldEmail: string;
	newEmail: string;
}) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_CHANGED_EMAIL.subject}</mj-title>
		<mj-preview>${EMAIL_CHANGED_EMAIL.description({ oldEmail, newEmail })}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('📧 Email address changed')}
				
				<mj-text>
				  The email address for your Inboxt account was successfully changed on ${timestamp}.
				</mj-text>
				
				${alert({
					content: [
						`<strong>Previous email:</strong> ${oldEmail}`,
						`<strong>New email:</strong> ${newEmail}`,
					],
				})}
				
				<mj-text>
					If you made this change, no further action is required.
				</mj-text>
				
				<mj-text>
					<strong>Did not change your email address?</strong> If you didn't make this change, your account may have been compromised. Please contact our support team for assistance.
				</mj-text>
				
				${button({
					text: 'Contact Support',
					url: 'mailto:',
				})}
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
