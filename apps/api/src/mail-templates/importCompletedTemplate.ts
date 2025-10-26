import appHeader from './elements/appHeader';
import footer from './elements/footer';
import header from './elements/header';
import baseStyles from './elements/baseStyles';
import button from './elements/button';

import { EMAIL_IMPORT_COMPLETED } from '../common/constants/email.constants';

export const importCompletedTemplate = ({
	source,
	articlesImportedCount,
	newslettersImportedCount,
	skippedCount,
	labelsCreatedCount,
	labelsFailedCount,
}: {
	source: string;
	articlesImportedCount: number;
	newslettersImportedCount: number;
	skippedCount: number;
	labelsCreatedCount: number;
	labelsFailedCount: number;
}) => `
<mjml>
	<mj-head>
		<mj-title>${EMAIL_IMPORT_COMPLETED.subject}</mj-title>
		<mj-preview>${EMAIL_IMPORT_COMPLETED.description}</mj-preview>
		${baseStyles()}
	</mj-head>
	<mj-body>
	${appHeader()}

	<mj-section>
		<mj-column>
			${header('✅ Your import is complete')}
			
			<mj-text>
				Good news! Your recent import into Inboxt has finished processing.
			</mj-text>
			
			<mj-text>
				<strong>Import details:</strong>
				<ul>
					<li>Source: ${source}</li>
					<li>Articles imported: ${articlesImportedCount}</li>
					<li>Newsletters imported: ${newslettersImportedCount}</li>
					<li>Failed to import: ${skippedCount}</li>
					<li>Labels created: ${labelsCreatedCount}</li>
					<li>Labels skipped: ${labelsFailedCount}</li>
				</ul>
			</mj-text>
			
			${button({ text: 'View Imported Items', url: process.env.WEB_URL as string })}
			
			<mj-text font-size="14px" color="#666666">
				Need help or didn’t request this import? Contact support at <a href="mailto:support@inboxt.app">support@inboxt.app</a>.
			</mj-text>
		</mj-column>
	</mj-section>

    ${footer()}
  </mj-body>
</mjml>
`;
