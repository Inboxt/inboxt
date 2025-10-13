import { APP_PRIMARY_COLOR } from '@inboxt/common';

export default () => `
<mj-attributes>
	<mj-all font-family="Helvetica, Arial, sans-serif" />
	<mj-text font-size="16px" color="#222222" line-height="1.5" />
	<mj-section padding="0" />
	<mj-column padding="0" />
	<mj-body background-color="#ffffff" />
</mj-attributes>
<mj-style>
	a {
		text-decoration: none;
		color: ${APP_PRIMARY_COLOR};
	}
</mj-style>
`;
