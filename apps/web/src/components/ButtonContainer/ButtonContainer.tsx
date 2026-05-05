import { BoxProps, Flex } from '@mantine/core';
import { ReactNode } from 'react';

type ButtonContainerProps = {
	children: ReactNode;
	mt?: BoxProps['mt'];
};

export const ButtonContainer = ({ children, mt }: ButtonContainerProps) => {
	return (
		<Flex
			gap="md"
			mt={mt}
			direction={{ base: 'column-reverse', xs: 'row' }}
			justify="space-between"
			style={{ flexShrink: 0 }}
		>
			{children}
		</Flex>
	);
};
