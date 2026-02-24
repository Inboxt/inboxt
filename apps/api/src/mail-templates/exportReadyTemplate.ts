import { EMAIL_EXPORT_READY } from '~common/constants/email.constants';

import appHeader from './elements/appHeader';
import baseStyles from './elements/baseStyles';
import button from './elements/button';
import footer from './elements/footer';
import header from './elements/header';

export const exportReadyTemplate = ({
	downloadUrl,
	timestamp,
}: {
	downloadUrl: string;
	timestamp: string;
}) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_EXPORT_READY.subject}</mj-title>
		<mj-preview>${EMAIL_EXPORT_READY.description({ timestamp })}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
	${appHeader()}

	<mj-section>
		<mj-column>
			${header('📦 Your data export is ready')}
			
			<mj-text font-size="14px" color="#666666">
				Generated on ${timestamp}
			</mj-text>

			<mj-text>
				We've prepared a ZIP archive containing your account data. The archive includes:
				<ul>
					<li>Saved items</li>
					<li>Highlights</li>
					<li>Labels</li>
					<li>Metadata associated with your account</li>
				</ul>
				You can download it using the button below.
			</mj-text>
			
			<mj-text font-size="14px" color="#666666">
  				<strong>For your security:</strong> keep this link private and do not share it with anyone.
			</mj-text>
			
			${button({ text: 'Download Export', url: downloadUrl })}
			
			<mj-text font-size="14px" color="#666666">
				If the button doesn't work, copy and paste this URL into your browser:<br/>
				<a href="${downloadUrl}">${downloadUrl}</a>
			</mj-text>
		</mj-column>
	</mj-section>

    ${footer()}
  </mj-body>
</mjml>
`;
