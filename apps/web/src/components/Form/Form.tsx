import { ReactNode, FormEvent } from 'react';
import { Alert } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { parseError } from '../../utils/parse-error.ts';
import { ApolloError } from '@apollo/client';

type FormProps = {
	children: (slots: { error: ReactNode }) => ReactNode;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	error?: ApolloError | string;
};

export const Form = ({ children, onSubmit, error }: FormProps) => {
	const renderError = () => {
		if (!error) return null;

		const message = parseError(error);
		return (
			<Alert
				icon={<IconAlertTriangleFilled />}
				color="red"
				variant="filled"
				p="xs"
			>
				{message}
			</Alert>
		);
	};

	return (
		<form onSubmit={onSubmit} noValidate>
			{children({ error: renderError() })}
		</form>
	);
};
