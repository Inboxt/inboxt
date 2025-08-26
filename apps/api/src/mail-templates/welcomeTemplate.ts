import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import alert from './elements/alert';
import button from './elements/button';
import { EMAIL_WELCOME } from '../common/constants/email.constants';

export const welcomeTemplate = () => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_WELCOME.subject}</mj-title>
		<mj-preview>${EMAIL_WELCOME.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header(`👋 Welcome to Inbox Reader!`)}
				
				<mj-text>
					Inbox Reader helps you save, organize, and read newsletters and articles distraction-free.
				</mj-text>
				
				${alert({
					content:
						'Check your inbox for a verification code to unlock all Inbox Reader features.',
					type: 'important',
				})}
				
				<mj-text>
					You’ll also find a couple of articles already added to your Inbox Reader account to help you get started. 
				</mj-text>
				
				<mj-text padding-bottom="20px">
					If you need any help, you can contact our support team at <a href="mailto:support@inbox-reader.com">support@inbox-reader.com</a> or use the in-app help option.
				</mj-text>
				
				${button({ text: 'Go to Inbox Reader', url: `${process.env.WEB_URL as string}/auth` })}
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
