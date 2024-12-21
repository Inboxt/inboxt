import '@mantine/core/styles.css';
import './root.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { LabelsSelectionModal } from '@modals/LabelsSelectionModal';
import { InstallModal } from '@modals/InstallModal';
import { PlanModal } from '@modals/PlanModal';
import { ProfileModal } from '@modals/ProfileModal';
import { LabelsModal } from '@modals/LabelsModal';

import { theme } from './theme';
import { ReaderProvider } from './context/ReaderContext.tsx';
import { Inbox } from './pages/Inbox.tsx';

export default function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme="light">
			<ReaderProvider>
				<ModalsProvider
					modals={{
						install: InstallModal,
						labels: LabelsModal,
						labelsSelection: LabelsSelectionModal,
						plan: PlanModal,
						profile: ProfileModal,
					}}
				>
					<Inbox />
				</ModalsProvider>
			</ReaderProvider>
		</MantineProvider>
	);
}
