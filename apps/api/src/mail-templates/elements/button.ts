import { APP_PRIMARY_COLOR } from '@inbox-reader/common';

interface ButtonProps {
	text: string;
	url: string;
}

export default ({ text, url }: ButtonProps): string => `
<mj-button
	href="${url}"
	background-color="${APP_PRIMARY_COLOR}"
	border-radius="4px"
	color="white"
	font-family="Helvetica, Arial, sans-serif"
	font-size="14px"
	font-weight="600"
	inner-padding="10px 20px"
	padding-top="10px"
	padding-bottom="10px"
>
	${text}
</mj-button>
`;
