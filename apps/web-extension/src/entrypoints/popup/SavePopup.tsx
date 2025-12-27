import { useEffect, useState } from 'react';
import { Alert, Box, Card, Group, Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

import { LabelsMultiSelect } from '@inboxt/ui';
import { SaveJob } from '@/types';
import { graphqlFetch } from '@/utils/graphql.ts';

const LABELS_QUERY = `
  query Labels {
    labels {
      id
      name
      color
    }
  }
`;

export const SavePopup = () => {
	const [jobId, setJobId] = useState<string | null>(null);
	const [job, setJob] = useState<SaveJob | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [labelsData, setLabelsData] = useState<{ labels: any[] } | null>(null);
	const [labelsLoading, setLabelsLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const fetchLabels = async () => {
			setLabelsLoading(true);
			try {
				const data = await graphqlFetch<{ labels: any[] }>(LABELS_QUERY);
				if (!cancelled) {
					setLabelsData(data);
				}
			} catch (err: any) {
				if (!cancelled) {
					setErrorMessage(err?.message ?? 'Failed to load labels');
				}
			} finally {
				if (!cancelled) {
					setLabelsLoading(false);
				}
			}
		};

		void fetchLabels();

		return () => {
			cancelled = true;
		};
	}, []);

	// Start job when popup opens
	useEffect(() => {
		let cancelled = false;

		const start = async () => {
			setErrorMessage(null);

			try {
				const response = await browser.runtime.sendMessage({
					type: 'start_save_for_active_tab',
				});

				if (!response?.ok) {
					setErrorMessage(response?.error?.message ?? 'Failed to start save job');
					return;
				}

				if (!cancelled) {
					setJobId(response.jobId);
				}
			} catch (err: any) {
				if (!cancelled) {
					setErrorMessage(err?.message ?? 'Unexpected error while starting job');
				}
			}
		};

		void start();

		return () => {
			cancelled = true;
		};
	}, []);

	// Poll job status while popup is open
	useEffect(() => {
		if (!jobId) {
			return;
		}

		let cancelled = false;
		const intervalMs = 800;

		const fetchStatus = async () => {
			try {
				const response = await browser.runtime.sendMessage({
					type: 'get_job_status',
					jobId,
				});

				if (!response?.ok) {
					if (!cancelled) {
						setErrorMessage(response?.error?.message ?? 'Failed to get job status');
					}
					return;
				}

				if (!cancelled) {
					setJob(response.job as SaveJob);
					setErrorMessage(response.job?.error ?? null);
				}
			} catch (err: any) {
				if (!cancelled) {
					setErrorMessage(err?.message ?? 'Unexpected error while getting status');
				}
			}
		};

		// Initial fetch immediately
		void fetchStatus();
		const intervalId = window.setInterval(fetchStatus, intervalMs);

		return () => {
			cancelled = true;
			if (intervalId !== undefined) {
				clearInterval(intervalId);
			}
		};
	}, [jobId]);

	const handleLabelsChange = async (labelIds: string[]) => {
		setJob((prev) => (prev ? { ...prev, labelIds } : prev));

		if (!jobId) {
			return;
		}

		try {
			const response = await browser.runtime.sendMessage({
				type: 'set_item_labels',
				jobId,
				labelIds,
			});

			if (!response?.ok) {
				setErrorMessage(response?.error?.message ?? 'Failed to update labels');
				return;
			}

			setJob(response.job as SaveJob);
		} catch (err: any) {
			setErrorMessage(err?.message ?? 'Unexpected error while updating labels');
		}
	};

	const status = job?.status ?? (jobId ? 'pending' : 'pending');
	const isSaving = status === 'saving';
	const isSaved = status === 'saved';
	const hasError = status === 'error' || !!errorMessage;

	const title = job?.title ?? 'Saving to Inboxt';
	const pageUrl = job?.pageUrl ?? '';

	const renderStatusChip = () => {
		if (isSaving) {
			return (
				<Group gap="xs">
					<Loader size="xs" />
					<Text size="xs">Saving…</Text>
				</Group>
			);
		}

		if (isSaved) {
			return (
				<Group gap="xs">
					<IconCheck size={14} color="green" />
					<Text size="xs" c="green">
						Saved
					</Text>
				</Group>
			);
		}

		if (hasError) {
			return null;
		}

		return null;
	};

	const renderHelperText = () => {
		if (hasError) {
			return null;
		}

		if (isSaved) {
			return 'This item will appear in your library in a moment.';
		}

		return 'We’re fetching and analyzing it in the background.';
	};

	return (
		<Box style={{ width: 420 }} p="md">
			<Stack>
				<Card>
					<Stack gap={hasError ? 2 : 'sm'}>
						<Stack>
							<Group gap="sm">
								<Stack gap={2}>
									<Title order={5}>{title}</Title>
									{!hasError && (
										<Text size="xs" c="dimmed">
											{renderHelperText()}
										</Text>
									)}
								</Stack>
							</Group>

							{renderStatusChip()}
						</Stack>

						{hasError && errorMessage && (
							<Alert
								color="red"
								icon={<IconAlertCircle size={16} />}
								variant="filled"
								p="xs"
							>
								<Text size="xs">{errorMessage}</Text>
							</Alert>
						)}

						{pageUrl && (
							<TextInput
								label="Page URL"
								value={pageUrl}
								readOnly
								size="xs"
								styles={{
									input: { fontSize: 12 },
									label: { fontSize: 12 },
								}}
							/>
						)}
					</Stack>
				</Card>

				<Card>
					<Stack gap="sm">
						<Stack gap={2}>
							<Group justify="space-between" align="flex-start" gap="sm">
								<Title order={6}>Labels</Title>
								<Text size="xs" c="dimmed">
									Optional
								</Text>
							</Group>

							<Text size="xs" c="dimmed">
								Use labels to organize your saved content.
							</Text>
						</Stack>

						<LabelsMultiSelect
							labels={labelsData?.labels}
							loading={labelsLoading}
							value={job?.labelIds || []}
							onChange={isSaved && job?.itemId ? handleLabelsChange : undefined}
						/>
					</Stack>
				</Card>
			</Stack>
		</Box>
	);
};
