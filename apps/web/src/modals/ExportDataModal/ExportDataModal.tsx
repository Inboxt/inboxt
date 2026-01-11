import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, SegmentedControl, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { toastInfo } from '~components/Toast';
import { ACTIVE_USER, REQUEST_EXPORT } from '~lib/graphql';
import { ExportHighlightsFormat, ExportType } from '~lib/graphql';

export type ExportDataModalProps = {
	type: ExportType;
};

export const ExportDataModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<ExportDataModalProps>) => {
	const [formatForHighlights, setFormatForHighlights] = useState<ExportHighlightsFormat>(
		ExportHighlightsFormat.Html,
	);
	const { data, loading } = useQuery(ACTIVE_USER, { fetchPolicy: 'network-only' });
	const [requestExport, { loading: loadingRequestExport, error: requestExportError }] =
		useMutation(REQUEST_EXPORT);

	const { type } = innerProps;

	const handleRequestExport = async () => {
		const res = await requestExport({ variables: { data: { type, formatForHighlights } } });
		const dataUrl = res.data?.requestExport as string;
		if (!dataUrl || !dataUrl.startsWith('data:')) {
			toastInfo({
				title: 'Export requested',
				description: 'We’ll email you a download link when it’s ready.',
			});

			context.closeModal(id);
			return;
		}

		const filenameParam = dataUrl.split('#filename=')[1];
		const filename = filenameParam ? decodeURIComponent(filenameParam) : 'export.txt';

		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();

		context.closeAll();
	};

	return (
		<Form
			onSubmit={(e) => {
				e.preventDefault();
				void handleRequestExport();
			}}
			error={requestExportError}
		>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Stack gap="md">
							<Text size="sm">
								{type === ExportType.All
									? 'Request a full account export once per day. It includes your saved items, highlights, labels, and metadata. The export will be prepared and sent to your email address. Large exports can take a while to complete.'
									: 'Export your highlights instantly in your chosen format. The file will download directly in your browser.'}
							</Text>

							{type === ExportType.All && loading && <Skeleton height={80} />}
							{type === ExportType.All && !loading && (
								<TextInput
									variant="filled"
									label="E-mail Address"
									value={data?.me?.emailAddress}
									readOnly
									description="If this address is incorrect, please update it in your profile."
								/>
							)}

							<Stack gap="xxxs">
								<Text size="sm" fw={500}>
									{type === ExportType.All ? 'Highlights Format' : 'Format'}
								</Text>

								<SegmentedControl
									color="dark.5"
									value={formatForHighlights}
									onChange={(value) =>
										setFormatForHighlights(value as ExportHighlightsFormat)
									}
									data={[
										{ label: 'HTML', value: ExportHighlightsFormat.Html },
										{
											label: 'Markdown',
											value: ExportHighlightsFormat.Markdown,
										},
										{ label: 'Text', value: ExportHighlightsFormat.Text },
									]}
								/>
							</Stack>

							{error}
						</Stack>
					</Card>

					<ButtonContainer>
						<Button
							variant="default"
							onClick={() => context.closeModal(id)}
							loading={loadingRequestExport}
						>
							Cancel
						</Button>

						<Button type="submit" loading={loadingRequestExport}>
							Export {type === ExportType.All ? 'All Data' : 'Highlights'}
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
