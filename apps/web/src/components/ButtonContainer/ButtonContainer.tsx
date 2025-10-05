import { BoxProps, Flex } from '@mantine/core';
import { ReactNode } from 'react';

import classes from './ButtonContainer.module.css';

type ButtonContainerProps = {
	children: ReactNode;
	mt?: BoxProps['mt'];
};

export const ButtonContainer = ({ children, mt }: ButtonContainerProps) => {
	return (
		<Flex gap="md" mt={mt} className={classes.container} justify="space-between">
			{children}
		</Flex>
	);
};
