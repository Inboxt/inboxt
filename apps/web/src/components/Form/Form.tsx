import { Alert, Box, BoxProps, ElementProps } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { SubmitEvent, ReactNode, useEffect } from 'react';

import { parseError } from '~utils/parse-error';

import classes from './Form.module.css';

type FormProps = {
	children: (({ error }: { error: ReactNode | null }) => ReactNode) | ReactNode;
	onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
	error?: unknown;
	setErrors?: (errors: Record<string, string>) => void;
} & Omit<BoxProps, 'children'> &
	Omit<ElementProps<'form', 'onSubmit'>, 'children' | 'onSubmit'>;

export const Form = ({ children, onSubmit, error, setErrors, ...others }: FormProps) => {
	useEffect(() => {
		if (!error || !setErrors) {
			return;
		}

		const parsed = parseError(error);

		if (!parsed?.fieldErrors) {
			return;
		}

		const fieldErrors = parsed.fieldErrors.reduce<Record<string, string>>(
			(acc, fieldError) => ({
				...acc,
				[fieldError.path]: fieldError.message,
			}),
			{},
		);

		setErrors(fieldErrors);
	}, [error, setErrors]);

	const renderError = () => {
		if (!error) {
			return null;
		}

		const parsed = parseError(error);

		if (!parsed?.message || parsed.message === 'Invalid input provided') {
			return null;
		}

		return (
			<Alert
				icon={<IconAlertTriangleFilled />}
				color="red"
				variant="filled"
				p="xs"
				style={{ whiteSpace: 'pre-line' }}
			>
				{parsed.message}
			</Alert>
		);
	};

	return (
		<Box component="form" onSubmit={onSubmit} noValidate className={classes.form} {...others}>
			{typeof children === 'function' ? children({ error: renderError() }) : children}
		</Box>
	);
};
