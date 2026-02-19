export default () => `
<mj-section>
	<mj-column>
		<mj-text font-size="20px" font-weight="bold" padding-bottom="30px">
			<img
				src="${process.env.APP_URL || process.env.API_URL}/logo.png"
				alt="Inboxt"
				height="30"
				style="vertical-align: middle; height: 30px;"
			/>
			
			<span style="vertical-align: middle;">Inboxt</span>
		</mj-text>
	</mj-column>
</mj-section>
 `;
