import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import button from './elements/button';
import { EMAIL_VERIFY_REMINDER } from '../common/constants/email.constants';

export const verifyEmailReminderTemplate = ({ daysRemaining }: { daysRemaining: number }) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_VERIFY_REMINDER.subject}</mj-title>
		<mj-preview>
			${EMAIL_VERIFY_REMINDER.description({ daysRemaining: daysRemaining.toString() })}
		</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('⚠️ Verify your email soon')}
				
				<mj-text>
					We noticed that you created an Inbox Reader account but haven't verified your email address yet.
				</mj-text>
				
				<mj-text>
					To keep your account, saved items, and unlock all features, please log in and request a new verification code:
				</mj-text>
				
				${button({ text: 'Log In Now', url: `${process.env.WEB_URL as string}/auth?mode=login` })}
				
				<mj-text>
					If your email remains unverified, your account and any saved items will be automatically deleted in <strong>${daysRemaining} days</strong>.
				</mj-text>
				
				<mj-text>
					If you're having trouble with the verification process, you can contact our support team for help.
				</mj-text>
				
				<mj-text  align="center" font-size="14px" padding-top="20px">
					If you no longer wish to use Inbox Reader, no action is required—your account will be automatically deleted.
				</mj-text>
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
