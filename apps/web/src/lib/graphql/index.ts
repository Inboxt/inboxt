import { gql } from './generated';

/*----------  Fragments  ----------*/
export const USER_FRAGMENT = gql(`
	fragment UserFragment on User {
		id
		createdAt
		emailAddress
		isEmailVerified
		username
		pendingEmailAddress
		plan
		labelsCount
		inboundEmailAddressesCount
	}
`);

export const SAVED_ITEM_FRAGMENT = gql(`
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
`);

export const SAVED_ITEM_LABEL_FRAGMENT = gql(`
	fragment SavedItemLabelFragment on Label {
		createdAt
		id
		name
		color
	}
`);

export const SAVED_ITEM_LABELS_FRAGMENT = gql(`
	fragment SavedItemLabelsFragment on SavedItem {
		id
		labels {
			id
			...SavedItemLabelFragment
		}
	}
`);

export const NEWSLETTER_FRAGMENT = gql(`
	fragment NewsletterFragment on Newsletter {
		contentHtml
		contentText
		subscription {
			id
			createdAt
			name
			status
			lastReceivedAt
			unsubscribeUrl
			unsubscribeAttemptedAt
		}
	}
`);

export const HIGHLIGHT_FRAGMENT = gql(`
	fragment HighlightFragment on Highlight {
		id
		createdAt
		savedItem {
        	id
            title
        }
		segments {
			id
			xpath
			beforeText
			startOffset
			endOffset
			afterText
			text
		}
	}
`);

export const ENTRY_FRAGMENT = gql(`
	fragment EntryFragment on Entry {
		__typename
		... on SavedItem {
			...SavedItemFragment
			labels {
				...SavedItemLabelFragment
			}
		}
		... on Highlight {
			...HighlightFragment
		}
	}
`);

/*----------  Queries  ----------*/
export const ACTIVE_USER = gql(`
	query me {
		me {
			id
			...UserFragment
		}
	}
`);

export const LABELS = gql(`
	query labels {
		labels {
			id
			...SavedItemLabelFragment
		}
	}
`);

export const SAVED_ITEM = gql(`
	query savedItem($query: GetSavedItemInput!) {
		savedItem(query: $query) {
			id
			...SavedItemFragment
			labels {
				id
				...SavedItemLabelFragment
			}
			article {
				contentHtml
				contentText
			}
			newsletter {
				...NewsletterFragment
			}
			highlights {
				...HighlightFragment
			}
		}
	}
`);

export const INBOUND_EMAIL_ADDRESSES = gql(`
	query inboundEmailAddresses {
		inboundEmailAddresses {
			id
			createdAt
			fullAddress
			subscriptions {
				id
				createdAt
				name
				status
				lastReceivedAt
				unsubscribeUrl
				unsubscribeAttemptedAt
			}
		}
	}
`);

export const ENTRIES = gql(`
	query entries($query: GetEntriesInput!) {
		entries(query: $query) {
			edges {
				node {
					...EntryFragment
				}
				cursor
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`);

/*----------  Mutations  ----------*/
export const SIGN_IN = gql(`
	mutation signIn($data: SignInInput!) {
		signIn(data: $data) {
			success
		}
	}
`);

export const SIGN_OUT = gql(`
	mutation signOut {
		signOut {
			success
		}
	}
`);

export const CREATE_ACCOUNT = gql(`
	mutation createAccount($data: CreateAccountInput!) {
		createAccount(data: $data) {
			success
		}
	}
`);

export const VERIFY_EMAIL = gql(`
	mutation verifyEmail($data: VerifyEmailInput!) {
		verifyEmail(data: $data) {
			success
		}
	}
`);

export const RESEND_VERIFICATION_EMAIL = gql(`
	mutation resendVerificationEmail {
		resendVerificationEmail {
			success
		}
	}
`);

export const REQUEST_PASSWORD_RECOVERY = gql(`
	mutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {
		requestPasswordRecovery(data: $data) {
			success
		}
	}
`);

export const RESET_PASSWORD = gql(`
	mutation resetPassword($data: ResetPasswordInput!) {
		resetPassword(data: $data) {
			success
		}
	}
`);

export const UPDATE_ACCOUNT = gql(`
	mutation updateAccount($data: UpdateAccountInput!) {
		updateAccount(data: $data) {
			...UserFragment
		}
	}
`);

export const DELETE_ACCOUNT = gql(`
	mutation deleteAccount($data: DeleteAccountInput!) {
		deleteAccount(data: $data) {
			success
		}
	}
`);

export const SET_SAVED_ITEM_LABELS = gql(`
	mutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {
		setSavedItemLabels(data: $data) {
			success
		}
	}
`);

export const UPDATE_SAVED_ITEM_STATUS = gql(`
	mutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {
		updateSavedItemStatus(data: $data) {
			success
		}
	}
`);

export const PERMANENTLY_DELETE_SAVED_ITEMS = gql(`
	mutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {
		permanentlyDeleteSavedItems(data: $data) {
			success
		}
	}
`);

export const CREATE_LABEL = gql(`
	mutation createLabel($data: CreateLabelInput!) {
		createLabel(data: $data) {
			...SavedItemLabelFragment
		}
	}
`);

export const UPDATE_LABEL = gql(`
	mutation updateLabel($data: UpdateLabelInput!) {
		updateLabel(data: $data) {
			...SavedItemLabelFragment
		}
	}
`);

export const DELETE_LABEL = gql(`
	mutation deleteLabel($data: DeleteLabelInput!) {
		deleteLabel(data: $data) {
			success
		}
	}
`);

export const CREATE_INBOUND_EMAIL_ADDRESS = gql(`
	mutation createInboundEmailAddress {
		createInboundEmailAddress {
			id
			fullAddress
		}
	}
`);

export const DELETE_INBOUND_EMAIL_ADDRESS = gql(`
	mutation deleteInboundEmailAddress($data: DeleteInboundEmailAddressInput!) {
		deleteInboundEmailAddress(data: $data) {
			success
		}
	}
`);

export const UPDATE_NEWSLETTER_SUBSCRIPTION_STATUS = gql(`
	mutation updateNewsletterSubscriptionStatus($data: UpdateNewsletterSubscriptionStatusInput!) {
		updateNewsletterSubscriptionStatus(data: $data) {
			success
		}
	}
`);

export const CREATE_HIGHLIGHT = gql(`
	mutation createHighlight($data: CreateHighlightInput!) {
		createHighlight(data: $data) {
			id
		}
	}
`);

export const DELETE_HIGHLIGHTS = gql(`
	mutation DeleteHighlights($data: DeleteHighlightsInput!) {
		deleteHighlights(data: $data) {
			success
		}
	}
`);

export const CREATE_DEMO_ACCOUNT = gql(`
	mutation createDemoAccount {
		createDemoAccount {
			success
		}
	}
`);
