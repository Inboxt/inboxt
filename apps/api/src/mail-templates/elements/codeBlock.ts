export default (code: string): string => `
<mj-section padding-left="0" padding-right="0" padding-top="8px" padding-bottom="8px">
	<mj-column background-color="#f5f7fb" border-radius="6px" padding="12px">
		<mj-text
			font-family="Menlo, Consolas, monospace"
			font-size="28px"
			font-weight="bold"
			letter-spacing="3px"
			align="center"
			color="#111111"
			padding="12px"
		>
			${code}
		</mj-text>
	</mj-column>
</mj-section>
 `;
