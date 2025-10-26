import { modals as mantineModals } from '@mantine/modals';

import { ExportDataModalProps } from '~modals/ExportDataModal/ExportDataModal.tsx';

export const modals = {
	openInstallModal: () => {
		return mantineModals.openContextModal({
			modal: 'install',
			size: 540,
			centered: true,
			title: 'Install on Other Devices',
			innerProps: {},
			className: 'fullscreen-modal',
		});
	},

	openLabelsModal: () => {
		return mantineModals.openContextModal({
			modal: 'labels',
			size: 540,
			centered: true,
			title: 'Manage Labels',
			closeOnEscape: false,
			innerProps: {},
		});
	},

	openLabelsSelectionModal: ({ itemId, onClose }: { itemId: string; onClose?: () => void }) => {
		return mantineModals.openContextModal({
			modal: 'labelsSelection',
			size: 540,
			centered: true,
			title: 'Label as',
			onClose,
			innerProps: {
				itemId,
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
			className: 'fullscreen-modal',
		});
	},

	openCreateLabelModal: () => {
		return mantineModals.openContextModal({
			modal: 'createLabel',
			size: 540,
			centered: true,
			title: 'Create Label',
			innerProps: {},
			withinPortal: false,
		});
	},

	openVerifyEmailModal: () => {
		return mantineModals.openContextModal({
			modal: 'verifyEmail',
			size: 540,
			title: 'Verify Email',
			innerProps: {},
			className: 'fullscreen-modal',
		});
	},

	openEmailsModal: () => {
		return mantineModals.openContextModal({
			modal: 'emails',
			size: 640,
			title: 'Emails',
			centered: true,
			innerProps: {},
			className: 'fullscreen-modal',
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

	openAddContentModal: () => {
		return mantineModals.openContextModal({
			modal: 'addContent',
			size: 540,
			title: 'Add',
			centered: true,
			innerProps: {},
		});
	},

	openConfirmModal: (payload: Record<string, unknown>) => {
		return mantineModals.openConfirmModal({ size: 540, ...payload });
	},

	openExportDataModal: ({ title, type }: ExportDataModalProps & { title: string }) => {
		return mantineModals.openContextModal({
			modal: 'exportData',
			size: 640,
			centered: true,
			title: title,
			innerProps: {
				type,
			},
		});
	},

	openImportModal: () => {
		return mantineModals.openContextModal({
			modal: 'import',
			size: 640,
			centered: true,
			title: 'Import Data',
			innerProps: {},
		});
	},

	closeAll: () => {
		mantineModals.closeAll();
	},

	close: (id: string) => {
		mantineModals.close(id);
	},

	update: (id: string, props: Record<string, unknown>) => {
		mantineModals.updateContextModal({ modalId: id, ...props });
	},
};
