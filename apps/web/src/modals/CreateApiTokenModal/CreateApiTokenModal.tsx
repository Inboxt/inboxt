import { useMutation } from '@apollo/client';
import {
	Alert,
	Button,
	Stack,
	Text,
	TextInput,
	Select,
	Group,
	CopyButton,
	ActionIcon,
	Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState, useMemo } from 'react';

import { createApiTokenSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { CREATE_API_TOKEN } from '~lib/graphql';
import { ApiTokenExpiry } from '~lib/graphql';

type CreateApiTokenModalInnerProps = {
	onCreated?: () => void;
};

const EXPIRY_PRESETS = [
	{ value: ApiTokenExpiry.OneDay, label: '1 day', days: 1 },
	{ value: ApiTokenExpiry.SevenDays, label: '7 days', days: 7 },
	{ value: ApiTokenExpiry.ThirtyDays, label: '30 days', days: 30 },
	{ value: ApiTokenExpiry.NinetyDays, label: '90 days', days: 90 },
	{ value: ApiTokenExpiry.Never, label: 'No expiration', days: null },
] as const;

type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]['value'];

const getExpiryDate = (preset: ExpiryPreset, base: Dayjs = dayjs()): Dayjs | null => {
	const presetConfig = EXPIRY_PRESETS.find((p) => p.value === preset);
	if (!presetConfig || presetConfig.days == null) {
		return null;
	}

	return base.add(presetConfig.days, 'day').endOf('day');
};

export const CreateApiTokenModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<CreateApiTokenModalInnerProps>) => {
	const [secret, setSecret] = useState<string | null>(null);

	const [createApiToken, { loading, error }] = useMutation(CREATE_API_TOKEN);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			expiry: ApiTokenExpiry['ThirtyDays'] as ExpiryPreset,
		},
		validate: zod4Resolver(createApiTokenSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		const res = await createApiToken({
			variables: {
				data: {
					name: values.name,
					expiry: values.expiry,
				},
			},
		});

		const createdSecret = res.data?.createApiToken.secret;
		if (createdSecret) {
			setSecret(createdSecret);
			form.reset();
			if (innerProps.onCreated) {
				innerProps.onCreated();
			}
		}
	};

	const handleClose = () => {
		context.closeModal(id);
	};

	const expiryOptions = useMemo(() => {
		const base = dayjs();
		const displayFormat = 'MMM D, YYYY';

		return EXPIRY_PRESETS.map((preset) => {
			if (preset.value === ApiTokenExpiry.Never) {
				return { value: preset.value, label: preset.label };
			}

			const dateLabel = getExpiryDate(preset.value, base)?.format(displayFormat);
			return {
				value: preset.value,
				label: `${preset.label} (${dateLabel})`,
			};
		});
	}, []);

	return (
		<>
			{!secret && (
				<Form
					onSubmit={form.onSubmit(handleSubmit)}
					error={error}
					setErrors={form.setErrors}
				>
					{({ error: formError }) => (
						<Stack flex={1} gap="xl">
							<Card>
								<Stack gap="md">
									<Text size="sm">
										Create a new token to connect an external app, plugin, or
										extension. You&apos;ll see the token once, then you need to
										store it safely.
									</Text>

									<TextInput
										label="Name"
										placeholder="My extension"
										data-autofocus
										key={form.key('name')}
										{...form.getInputProps('name')}
									/>

									<Stack gap={4}>
										<Select
											label="Expiration"
											allowDeselect={false}
											data={expiryOptions}
											key={form.key('expiry')}
											{...form.getInputProps('expiry')}
											description={
												form.values.expiry === ApiTokenExpiry.Never ? (
													<Text c="red" size="xs" lh={1.2}>
														Tokens without an expiration date are less
														secure. We strongly recommend setting an
														expiry date.
													</Text>
												) : (
													'The token will expire at the end of the selected day'
												)
											}
										/>
									</Stack>

									{formError}
								</Stack>
							</Card>

							<ButtonContainer mt="auto">
								<Button variant="default" onClick={handleClose}>
									Cancel
								</Button>

								<Button type="submit" loading={loading}>
									Create
								</Button>
							</ButtonContainer>
						</Stack>
					)}
				</Form>
			)}

			{secret && (
				<Stack gap="xl" flex={1}>
					<Alert color="blue">
						<Text size="sm" fw={500}>
							Your new API token
						</Text>
						<Group mt="xs" gap="xs" wrap="nowrap">
							<Text
								size="xs"
								style={{
									fontFamily: 'monospace',
									overflowWrap: 'anywhere',
									flex: 1,
								}}
							>
								{secret}
							</Text>

							<CopyButton value={secret} timeout={2000}>
								{({ copied, copy }) => (
									<ActionIcon
										variant="light"
										color={copied ? 'teal' : 'blue'}
										onClick={copy}
										aria-label="Copy token"
									>
										{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
									</ActionIcon>
								)}
							</CopyButton>
						</Group>

						<Text size="xs" c="dimmed" mt="xs">
							This token will not be shown again. Store it somewhere safe and paste it
							into your external app.
						</Text>
					</Alert>

					<ButtonContainer mt="auto">
						<Button variant="default" onClick={handleClose}>
							Close
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</>
	);
};
