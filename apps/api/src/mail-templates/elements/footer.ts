import dayjs from 'dayjs';

export default () => `
<mj-section padding="0 24px">
	<mj-column padding="0">
		<mj-divider border-width="1px" border-color="#D7DBDF" padding="30px 0 12px 0" />
	</mj-column>
</mj-section>
		
<mj-section padding="0 24px">
	<mj-column width="90%" padding="0">
		<mj-text color="#666666" font-size="14px" padding="0" align="left">
			© ${dayjs().year()} Inboxt. All rights reserved.
		</mj-text>
	</mj-column>
		
	<mj-column width="10%" padding="0" vertical-align="middle">
		<mj-image
			padding="0"
			width="20px"
			src="${process.env.STORAGE_S3_URL}/github-mark.svg"
			alt="GitHub mark"
			href="https://github.com/Inboxt/inboxt"
			rel="noopener noreferrer"
			align="right"
		/>
	</mj-column>
</mj-section>
`;
