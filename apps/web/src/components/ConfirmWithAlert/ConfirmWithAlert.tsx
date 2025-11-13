import { Alert, MantineColor, Stack, Text } from '@mantine/core';

export const ConfirmWithAlert = ({
	lines,
	color = 'red',
}: {
	lines: string[];
	color?: MantineColor;
}) => (
	<Alert color={color}>
		<Stack gap="xxs">
			{lines.map((line, index) => (
				<Text size="sm" key={index}>
					{line}
				</Text>
			))}
		</Stack>
	</Alert>
);
