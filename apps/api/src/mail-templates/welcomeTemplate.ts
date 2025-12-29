import { EMAIL_WELCOME } from '~common/constants/email.constants';

import alert from './elements/alert';
import appHeader from './elements/appHeader';
import baseStyles from './elements/baseStyles';
import button from './elements/button';
import footer from './elements/footer';
import header from './elements/header';

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
				${header(`👋 Welcome to Inboxt!`)}
				
				<mj-text>
					Inboxt helps you save, organize, and read newsletters and articles distraction-free.
				</mj-text>
				
				${alert({
					content:
						'Check your inbox for a verification code to unlock all Inboxt features.',
					type: 'important',
				})}
				
				<mj-text>
					You’ll also find a couple of articles already added to your Inboxt account to help you get started. 
				</mj-text>
				
				<mj-text padding-bottom="20px">
					If you need any help, you can contact our support team at <a href="mailto:support@inboxt.app">support@inboxt.app</a> or use the in-app help option.
				</mj-text>
				
				${button({ text: 'Go to Inboxt', url: `${process.env.WEB_URL as string}/auth` })}
			</mj-column>
		</mj-section>
		
		${footer()}
	</mj-body>
</mjml>
`;
