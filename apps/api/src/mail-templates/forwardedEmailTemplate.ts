import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import alert from './elements/alert';
import { EMAIL_FORWARDED } from '../common/constants/email.constants';

interface ForwardedEmailTemplateProps {
	from: string;
	date: string;
	originalSubject: string;
	plainText: string;
	htmlContent?: string;
}

export const forwardedEmailTemplate = ({
	from,
	date,
	originalSubject,
	plainText,
	htmlContent,
}: ForwardedEmailTemplateProps) => `
<mjml>
	<mj-head>
	<mj-title>${EMAIL_FORWARDED.subject({ originalSubject })}</mj-title>
	<mj-preview>${EMAIL_FORWARDED.description}</mj-preview>
	${baseStyles()}
	</mj-head>
	<mj-body>
		${appHeader()}
		
		<mj-section>
			<mj-column>
				${header('📨 Forwarded Newsletter')}
				
				<mj-text>This email couldn’t be displayed in Inbox Reader, so we’ve forwarded it to you.</mj-text>
				
				${alert({
					content: [
						`<strong style="font-size: 18px">Original Email Details</strong>`,
						`<strong>From:</strong> ${from}`,
						`<strong>Date:</strong> ${date}`,
						`<strong>Subject:</strong> ${originalSubject}`,
					],
				})}
				
				<mj-text>
					Think this was a mistake? You can <a href="https://github.com/" target="_blank">report the issue on GitHub</a>.
				</mj-text>
			</mj-column>
		</mj-section>
		
		<mj-section padding-bottom="40px">
			${footer()}
		</mj-section>
		
		<mj-text font-style="italic">
			Original email content:
		</mj-text>
		
		${htmlContent ? `<mj-raw>${htmlContent}</mj-raw>` : `<mj-text> ${plainText}</mj-text>`}
	</mj-body>
</mjml>
`;
