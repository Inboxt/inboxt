import { modals as mantineModals } from '@mantine/modals';

export const modals = {
	openInstallModal: () => {
		return mantineModals.openContextModal({
			modal: 'install',
			size: 'lg',
			centered: true,
			title: 'Install on Other Devices',
			innerProps: {},
		});
	},

	openLabelsModal: () => {
		return mantineModals.openContextModal({
			modal: 'labels',
			size: 540,
			centered: true, // TODO: or not?
			title: 'Labels',
			innerProps: {},
		});
	},

	openLabelsSelectionModal: () => {
		return mantineModals.openContextModal({
			modal: 'labelsSelection',
			size: 540,
			centered: true, // TODO: or not?
			title: 'Label as',
			innerProps: {},
		});
	},

	openPlanModal: () => {
		return mantineModals.openContextModal({
			modal: 'plan',
			size: 840,
			centered: true,
			title: 'Manage Plan',
			innerProps: {},
		});
	},

	openProfileModal: () => {
		return mantineModals.openContextModal({
			modal: 'profile',
			size: 640,
			centered: true,
			title: 'Profile',
			innerProps: {},
		});
	},

	closeAll: () => {
		mantineModals.closeAll();
	},

	close: (id: string) => {
		mantineModals.close(id);
	},
};
