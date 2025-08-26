import codeBlock from './elements/codeBlock';
import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import { EMAIL_RESET_PASSWORD } from '../common/constants/email.constants';

export const passwordResetTemplate = ({ code }: { code: string }) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_RESET_PASSWORD.subject}</mj-title>
		<mj-preview>${EMAIL_RESET_PASSWORD.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('🔐 Reset your password')}
				
				<mj-text>
					We received a request to reset your password. To create a new password, please use the verification code below:
				</mj-text>
				
				${codeBlock(code)}
				
				<mj-text>
					This code will expire in 15 minutes. If you didn’t request a password reset, you can safely ignore this email.
				</mj-text>
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
