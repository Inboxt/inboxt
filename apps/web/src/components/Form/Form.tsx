import { ApolloError } from '@apollo/client';
import { Alert } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { ReactNode, FormEvent, useEffect } from 'react';

import { parseError } from '~utils/parse-error';

type FormProps = {
	children: (({ error }: { error: ReactNode | null }) => ReactNode) | ReactNode;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	error?: ApolloError | string;
	setErrors?: (errors: Record<string, string>) => void;
};

export const Form = ({ children, onSubmit, error, setErrors }: FormProps) => {
	useEffect(() => {
		if (error && setErrors) {
			const parsed = parseError(error);
			if (parsed?.fieldErrors) {
				const fieldErrors = parsed.fieldErrors.reduce(
					(acc, fieldError) => ({
						...acc,
						[fieldError.path]: fieldError.message,
					}),
					{},
				);
				setErrors(fieldErrors);
			}
		}
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
		<form
			onSubmit={onSubmit}
			noValidate
			style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
		>
			{typeof children === 'function' ? children({ error: renderError() }) : children}
		</form>
	);
};
