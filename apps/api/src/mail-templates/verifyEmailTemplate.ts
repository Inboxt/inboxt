import codeBlock from './elements/codeBlock';
import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import { EMAIL_VERIFY } from '../common/constants/email.constants';

export const verifyEmailTemplate = ({
	code,
	isEmailChange = false,
}: {
	code: string;
	isEmailChange?: boolean;
}) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_VERIFY.subject}</mj-title>
		<mj-preview>${EMAIL_VERIFY.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('📬 Verify your email address')}
				
				<mj-text>
					${
						isEmailChange
							? 'Please verify your new email address using the code below to complete the change and continue using all features.'
							: 'Thanks for joining Inbox Reader! Please verify your email using the code below to unlock all features.'
					}
				</mj-text>
				
				${codeBlock(code)}
					
				<mj-text>
					${
						isEmailChange
							? 'If you did not request this change, you can safely ignore this email and the email change will not be applied.'
							: 'If you didn’t create this account, you can safely ignore this email.'
					}
				</mj-text>
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
