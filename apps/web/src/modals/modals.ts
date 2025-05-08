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

	openPlanModal: (fullMode = true) => {
		return mantineModals.openContextModal({
			modal: 'plan',
			size: 840,
			centered: true,
			title: fullMode ? 'Manage Plan' : 'Pricing',
			innerProps: {
				fullMode,
			},
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

	openCreateLabelModal: () => {
		return mantineModals.openContextModal({
			modal: 'createLabel',
			size: 540,
			centered: true,
			title: 'Create Label',
			innerProps: {},
		});
	},

	openVerifyEmailModal: () => {
		return mantineModals.openContextModal({
			modal: 'verifyEmail',
			size: 540,
			title: 'Verify Email',
			innerProps: {},
		});
	},

	openNewslettersModal: () => {
		return mantineModals.openContextModal({
			modal: 'newsletters',
			size: 540,
			title: 'Newsletters',
			innerProps: {},
		});
	},

	openDeleteAccountModal: () => {
		return mantineModals.openContextModal({
			modal: 'deleteAccount',
			size: 540,
			title: 'Delete Account',
			centered: true,
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
