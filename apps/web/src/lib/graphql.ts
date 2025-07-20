import { gql } from '@apollo/client';

/*----------  Fragments  ----------*/
export const USER_FRAGMENT = gql`
	fragment UserFragment on User {
		id
		createdAt
		emailAddress
		isEmailVerified
		username
		pendingEmailAddress
		plan
	}
`;

export const SAVED_ITEM_FRAGMENT = gql`
	fragment SavedItemFragment on SavedItem {
		id
		createdAt
		title
		originalUrl
		sourceDomain
		description
		leadImage
		wordCount
		author
		type
		status
	}
`;

export const SAVED_ITEM_LABEL_FRAGMENT = gql`
	fragment SavedItemLabelFragment on Label {
		id
		name
		color
	}
`;

export const SAVED_ITEM_LABELS_FRAGMENT = gql`
	fragment SavedItemLabelsFragment on SavedItem {
		id
		labels {
			...SavedItemLabelFragment
		}
	}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

/*----------  Queries  ----------*/
export const ACTIVE_USER = gql`
	query me {
		me {
			...UserFragment
		}
	}
	${USER_FRAGMENT}
`;

export const LABELS = gql`
	query labels {
		labels {
			...SavedItemLabelFragment
		}
	}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

export const SAVED_ITEMS = gql`
	query savedItems($data: GetSavedItemsInput!) {
		savedItems(data: $data) {
			edges {
				node {
					...SavedItemFragment
					labels {
						...SavedItemLabelFragment
					}
					article {
						contentHtml
						contentText
					}
				}
				cursor
			}
			endCursor
			hasNextPage
		}
	}
	${SAVED_ITEM_FRAGMENT}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

export const SAVED_ITEM = gql`
	query savedItem($query: GetSavedItemInput!) {
		savedItem(query: $query) {
			...SavedItemFragment
			labels {
				...SavedItemLabelFragment
			}
			article {
				contentHtml
				contentText
			}
		}
	}
	${SAVED_ITEM_FRAGMENT}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

/*----------  Mutations  ----------*/
export const SIGN_IN = gql`
	mutation signIn($data: SignInInput!) {
		signIn(data: $data) {
			success
		}
	}
`;

export const SIGN_OUT = gql`
	mutation {
		signOut {
			success
		}
	}
`;

export const CREATE_ACCOUNT = gql`
	mutation createAccount($data: CreateAccountInput!) {
		createAccount(data: $data) {
			success
		}
	}
`;

export const VERIFY_EMAIL = gql`
	mutation verifyEmail($data: VerifyEmailInput!) {
		verifyEmail(data: $data) {
			success
		}
	}
`;

export const RESEND_VERIFICATION_EMAIL = gql`
	mutation resendVerificationEmail {
		resendVerificationEmail {
			success
		}
	}
`;

export const REQUEST_PASSWORD_RECOVERY = gql`
	mutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {
		requestPasswordRecovery(data: $data) {
			success
		}
	}
`;

export const RESET_PASSWORD = gql`
	mutation resetPassword($data: ResetPasswordInput!) {
		resetPassword(data: $data) {
			success
		}
	}
`;

export const UPDATE_ACCOUNT = gql`
	mutation updateAccount($data: UpdateAccountInput!) {
		updateAccount(data: $data) {
			...UserFragment
		}
	}
	${USER_FRAGMENT}
`;

export const DELETE_ACCOUNT = gql`
	mutation deleteAccount($data: DeleteAccountInput!) {
		deleteAccount(data: $data) {
			success
		}
	}
`;

export const SET_SAVED_ITEM_LABELS = gql`
	mutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {
		setSavedItemLabels(data: $data) {
			success
		}
	}
`;

export const UPDATE_SAVED_ITEM_STATUS = gql`
	mutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {
		updateSavedItemStatus(data: $data) {
			success
		}
	}
`;

export const PERMANENTLY_DELETE_SAVED_ITEMS = gql`
	mutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {
		permanentlyDeleteSavedItems(data: $data) {
			success
		}
	}
`;

export const CREATE_LABEL = gql`
	mutation createLabel($data: CreateLabelInput!) {
		createLabel(data: $data) {
			...SavedItemLabelFragment
		}
	}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

export const UPDATE_LABEL = gql`
	mutation updateLabel($data: UpdateLabelInput!) {
		updateLabel(data: $data) {
			...SavedItemLabelFragment
		}
	}
	${SAVED_ITEM_LABEL_FRAGMENT}
`;

export const DELETE_LABEL = gql`
	mutation deleteLabel($data: DeleteLabelInput!) {
		deleteLabel(data: $data) {
			success
		}
	}
`;
