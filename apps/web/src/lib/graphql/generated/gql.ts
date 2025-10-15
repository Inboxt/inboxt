/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n\tfragment UserFragment on User {\n\t\tid\n\t\tcreatedAt\n\t\temailAddress\n\t\tisEmailVerified\n\t\tusername\n\t\tpendingEmailAddress\n\t\tplan\n\t\tlabelsCount\n\t\tinboundEmailAddressesCount\n\t\tlastExportAt\n\t}\n": typeof types.UserFragmentFragmentDoc,
    "\n\tfragment SavedItemFragment on SavedItem {\n\t\tid\n\t\tcreatedAt\n\t\ttitle\n\t\toriginalUrl\n\t\tsourceDomain\n\t\tdescription\n\t\tleadImage\n\t\twordCount\n\t\tauthor\n\t\ttype\n\t\tstatus\n\t}\n": typeof types.SavedItemFragmentFragmentDoc,
    "\n\tfragment SavedItemLabelFragment on Label {\n\t\tcreatedAt\n\t\tid\n\t\tname\n\t\tcolor\n\t}\n": typeof types.SavedItemLabelFragmentFragmentDoc,
    "\n\tfragment SavedItemLabelsFragment on SavedItem {\n\t\tid\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": typeof types.SavedItemLabelsFragmentFragmentDoc,
    "\n\tfragment NewsletterFragment on Newsletter {\n\t\tcontentHtml\n\t\tcontentText\n\t\tsubscription {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tname\n\t\t\tstatus\n\t\t\tlastReceivedAt\n\t\t\tunsubscribeUrl\n\t\t\tunsubscribeAttemptedAt\n\t\t}\n\t}\n": typeof types.NewsletterFragmentFragmentDoc,
    "\n\tfragment HighlightFragment on Highlight {\n\t\tid\n\t\tcreatedAt\n\t\tsavedItem {\n        \tid\n            title\n        }\n\t\tsegments {\n\t\t\tid\n\t\t\txpath\n\t\t\tbeforeText\n\t\t\tstartOffset\n\t\t\tendOffset\n\t\t\tafterText\n\t\t\ttext\n\t\t}\n\t}\n": typeof types.HighlightFragmentFragmentDoc,
    "\n\tfragment EntryFragment on Entry {\n\t\t__typename\n\t\t... on SavedItem {\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t}\n\t\t... on Highlight {\n\t\t\t...HighlightFragment\n\t\t}\n\t}\n": typeof types.EntryFragmentFragmentDoc,
    "\n\tquery me {\n\t\tme {\n\t\t\tid\n\t\t\t...UserFragment\n\t\t}\n\t}\n": typeof types.MeDocument,
    "\n\tquery labels {\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": typeof types.LabelsDocument,
    "\n\tquery savedItem($query: GetSavedItemInput!) {\n\t\tsavedItem(query: $query) {\n\t\t\tid\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\tid\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t\tarticle {\n\t\t\t\tcontentHtml\n\t\t\t\tcontentText\n\t\t\t}\n\t\t\tnewsletter {\n\t\t\t\t...NewsletterFragment\n\t\t\t}\n\t\t\thighlights {\n\t\t\t\t...HighlightFragment\n\t\t\t}\n\t\t}\n\t}\n": typeof types.SavedItemDocument,
    "\n\tquery inboundEmailAddresses {\n\t\tinboundEmailAddresses {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tfullAddress\n\t\t\tsubscriptions {\n\t\t\t\tid\n\t\t\t\tcreatedAt\n\t\t\t\tname\n\t\t\t\tstatus\n\t\t\t\tlastReceivedAt\n\t\t\t\tunsubscribeUrl\n\t\t\t\tunsubscribeAttemptedAt\n\t\t\t}\n\t\t}\n\t}\n": typeof types.InboundEmailAddressesDocument,
    "\n\tquery entries($query: GetEntriesInput!) {\n\t\tentries(query: $query) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...EntryFragment\n\t\t\t\t}\n\t\t\t\tcursor\n\t\t\t}\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t\tendCursor\n\t\t\t}\n\t\t}\n\t}\n": typeof types.EntriesDocument,
    "\n\tmutation signIn($data: SignInInput!) {\n\t\tsignIn(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.SignInDocument,
    "\n\tmutation signOut {\n\t\tsignOut {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.SignOutDocument,
    "\n\tmutation createAccount($data: CreateAccountInput!) {\n\t\tcreateAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.CreateAccountDocument,
    "\n\tmutation verifyEmail($data: VerifyEmailInput!) {\n\t\tverifyEmail(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.VerifyEmailDocument,
    "\n\tmutation resendVerificationEmail {\n\t\tresendVerificationEmail {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.ResendVerificationEmailDocument,
    "\n\tmutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {\n\t\trequestPasswordRecovery(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.RequestPasswordRecoveryDocument,
    "\n\tmutation resetPassword($data: ResetPasswordInput!) {\n\t\tresetPassword(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.ResetPasswordDocument,
    "\n\tmutation updateAccount($data: UpdateAccountInput!) {\n\t\tupdateAccount(data: $data) {\n\t\t\t...UserFragment\n\t\t}\n\t}\n": typeof types.UpdateAccountDocument,
    "\n\tmutation deleteAccount($data: DeleteAccountInput!) {\n\t\tdeleteAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.DeleteAccountDocument,
    "\n\tmutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {\n\t\tsetSavedItemLabels(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.SetSavedItemLabelsDocument,
    "\n\tmutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {\n\t\tupdateSavedItemStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.UpdateSavedItemStatusDocument,
    "\n\tmutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {\n\t\tpermanentlyDeleteSavedItems(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.PermanentlyDeleteSavedItemsDocument,
    "\n\tmutation createLabel($data: CreateLabelInput!) {\n\t\tcreateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": typeof types.CreateLabelDocument,
    "\n\tmutation updateLabel($data: UpdateLabelInput!) {\n\t\tupdateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": typeof types.UpdateLabelDocument,
    "\n\tmutation deleteLabel($data: DeleteLabelInput!) {\n\t\tdeleteLabel(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.DeleteLabelDocument,
    "\n\tmutation createInboundEmailAddress {\n\t\tcreateInboundEmailAddress {\n\t\t\tid\n\t\t\tfullAddress\n\t\t}\n\t}\n": typeof types.CreateInboundEmailAddressDocument,
    "\n\tmutation deleteInboundEmailAddress($data: DeleteInboundEmailAddressInput!) {\n\t\tdeleteInboundEmailAddress(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.DeleteInboundEmailAddressDocument,
    "\n\tmutation updateNewsletterSubscriptionStatus($data: UpdateNewsletterSubscriptionStatusInput!) {\n\t\tupdateNewsletterSubscriptionStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.UpdateNewsletterSubscriptionStatusDocument,
    "\n\tmutation createHighlight($data: CreateHighlightInput!) {\n\t\tcreateHighlight(data: $data) {\n\t\t\tid\n\t\t}\n\t}\n": typeof types.CreateHighlightDocument,
    "\n\tmutation DeleteHighlights($data: DeleteHighlightsInput!) {\n\t\tdeleteHighlights(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.DeleteHighlightsDocument,
    "\n\tmutation createDemoAccount {\n\t\tcreateDemoAccount {\n\t\t\tsuccess\n\t\t}\n\t}\n": typeof types.CreateDemoAccountDocument,
    "\n\tmutation requestExport($data: RequestExportInput!) {\n\t\trequestExport(data: $data)\n\t}\n": typeof types.RequestExportDocument,
};
const documents: Documents = {
    "\n\tfragment UserFragment on User {\n\t\tid\n\t\tcreatedAt\n\t\temailAddress\n\t\tisEmailVerified\n\t\tusername\n\t\tpendingEmailAddress\n\t\tplan\n\t\tlabelsCount\n\t\tinboundEmailAddressesCount\n\t\tlastExportAt\n\t}\n": types.UserFragmentFragmentDoc,
    "\n\tfragment SavedItemFragment on SavedItem {\n\t\tid\n\t\tcreatedAt\n\t\ttitle\n\t\toriginalUrl\n\t\tsourceDomain\n\t\tdescription\n\t\tleadImage\n\t\twordCount\n\t\tauthor\n\t\ttype\n\t\tstatus\n\t}\n": types.SavedItemFragmentFragmentDoc,
    "\n\tfragment SavedItemLabelFragment on Label {\n\t\tcreatedAt\n\t\tid\n\t\tname\n\t\tcolor\n\t}\n": types.SavedItemLabelFragmentFragmentDoc,
    "\n\tfragment SavedItemLabelsFragment on SavedItem {\n\t\tid\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": types.SavedItemLabelsFragmentFragmentDoc,
    "\n\tfragment NewsletterFragment on Newsletter {\n\t\tcontentHtml\n\t\tcontentText\n\t\tsubscription {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tname\n\t\t\tstatus\n\t\t\tlastReceivedAt\n\t\t\tunsubscribeUrl\n\t\t\tunsubscribeAttemptedAt\n\t\t}\n\t}\n": types.NewsletterFragmentFragmentDoc,
    "\n\tfragment HighlightFragment on Highlight {\n\t\tid\n\t\tcreatedAt\n\t\tsavedItem {\n        \tid\n            title\n        }\n\t\tsegments {\n\t\t\tid\n\t\t\txpath\n\t\t\tbeforeText\n\t\t\tstartOffset\n\t\t\tendOffset\n\t\t\tafterText\n\t\t\ttext\n\t\t}\n\t}\n": types.HighlightFragmentFragmentDoc,
    "\n\tfragment EntryFragment on Entry {\n\t\t__typename\n\t\t... on SavedItem {\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t}\n\t\t... on Highlight {\n\t\t\t...HighlightFragment\n\t\t}\n\t}\n": types.EntryFragmentFragmentDoc,
    "\n\tquery me {\n\t\tme {\n\t\t\tid\n\t\t\t...UserFragment\n\t\t}\n\t}\n": types.MeDocument,
    "\n\tquery labels {\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": types.LabelsDocument,
    "\n\tquery savedItem($query: GetSavedItemInput!) {\n\t\tsavedItem(query: $query) {\n\t\t\tid\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\tid\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t\tarticle {\n\t\t\t\tcontentHtml\n\t\t\t\tcontentText\n\t\t\t}\n\t\t\tnewsletter {\n\t\t\t\t...NewsletterFragment\n\t\t\t}\n\t\t\thighlights {\n\t\t\t\t...HighlightFragment\n\t\t\t}\n\t\t}\n\t}\n": types.SavedItemDocument,
    "\n\tquery inboundEmailAddresses {\n\t\tinboundEmailAddresses {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tfullAddress\n\t\t\tsubscriptions {\n\t\t\t\tid\n\t\t\t\tcreatedAt\n\t\t\t\tname\n\t\t\t\tstatus\n\t\t\t\tlastReceivedAt\n\t\t\t\tunsubscribeUrl\n\t\t\t\tunsubscribeAttemptedAt\n\t\t\t}\n\t\t}\n\t}\n": types.InboundEmailAddressesDocument,
    "\n\tquery entries($query: GetEntriesInput!) {\n\t\tentries(query: $query) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...EntryFragment\n\t\t\t\t}\n\t\t\t\tcursor\n\t\t\t}\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t\tendCursor\n\t\t\t}\n\t\t}\n\t}\n": types.EntriesDocument,
    "\n\tmutation signIn($data: SignInInput!) {\n\t\tsignIn(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.SignInDocument,
    "\n\tmutation signOut {\n\t\tsignOut {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.SignOutDocument,
    "\n\tmutation createAccount($data: CreateAccountInput!) {\n\t\tcreateAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.CreateAccountDocument,
    "\n\tmutation verifyEmail($data: VerifyEmailInput!) {\n\t\tverifyEmail(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.VerifyEmailDocument,
    "\n\tmutation resendVerificationEmail {\n\t\tresendVerificationEmail {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.ResendVerificationEmailDocument,
    "\n\tmutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {\n\t\trequestPasswordRecovery(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.RequestPasswordRecoveryDocument,
    "\n\tmutation resetPassword($data: ResetPasswordInput!) {\n\t\tresetPassword(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.ResetPasswordDocument,
    "\n\tmutation updateAccount($data: UpdateAccountInput!) {\n\t\tupdateAccount(data: $data) {\n\t\t\t...UserFragment\n\t\t}\n\t}\n": types.UpdateAccountDocument,
    "\n\tmutation deleteAccount($data: DeleteAccountInput!) {\n\t\tdeleteAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.DeleteAccountDocument,
    "\n\tmutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {\n\t\tsetSavedItemLabels(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.SetSavedItemLabelsDocument,
    "\n\tmutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {\n\t\tupdateSavedItemStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.UpdateSavedItemStatusDocument,
    "\n\tmutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {\n\t\tpermanentlyDeleteSavedItems(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.PermanentlyDeleteSavedItemsDocument,
    "\n\tmutation createLabel($data: CreateLabelInput!) {\n\t\tcreateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": types.CreateLabelDocument,
    "\n\tmutation updateLabel($data: UpdateLabelInput!) {\n\t\tupdateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n": types.UpdateLabelDocument,
    "\n\tmutation deleteLabel($data: DeleteLabelInput!) {\n\t\tdeleteLabel(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.DeleteLabelDocument,
    "\n\tmutation createInboundEmailAddress {\n\t\tcreateInboundEmailAddress {\n\t\t\tid\n\t\t\tfullAddress\n\t\t}\n\t}\n": types.CreateInboundEmailAddressDocument,
    "\n\tmutation deleteInboundEmailAddress($data: DeleteInboundEmailAddressInput!) {\n\t\tdeleteInboundEmailAddress(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.DeleteInboundEmailAddressDocument,
    "\n\tmutation updateNewsletterSubscriptionStatus($data: UpdateNewsletterSubscriptionStatusInput!) {\n\t\tupdateNewsletterSubscriptionStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.UpdateNewsletterSubscriptionStatusDocument,
    "\n\tmutation createHighlight($data: CreateHighlightInput!) {\n\t\tcreateHighlight(data: $data) {\n\t\t\tid\n\t\t}\n\t}\n": types.CreateHighlightDocument,
    "\n\tmutation DeleteHighlights($data: DeleteHighlightsInput!) {\n\t\tdeleteHighlights(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.DeleteHighlightsDocument,
    "\n\tmutation createDemoAccount {\n\t\tcreateDemoAccount {\n\t\t\tsuccess\n\t\t}\n\t}\n": types.CreateDemoAccountDocument,
    "\n\tmutation requestExport($data: RequestExportInput!) {\n\t\trequestExport(data: $data)\n\t}\n": types.RequestExportDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment UserFragment on User {\n\t\tid\n\t\tcreatedAt\n\t\temailAddress\n\t\tisEmailVerified\n\t\tusername\n\t\tpendingEmailAddress\n\t\tplan\n\t\tlabelsCount\n\t\tinboundEmailAddressesCount\n\t\tlastExportAt\n\t}\n"): (typeof documents)["\n\tfragment UserFragment on User {\n\t\tid\n\t\tcreatedAt\n\t\temailAddress\n\t\tisEmailVerified\n\t\tusername\n\t\tpendingEmailAddress\n\t\tplan\n\t\tlabelsCount\n\t\tinboundEmailAddressesCount\n\t\tlastExportAt\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment SavedItemFragment on SavedItem {\n\t\tid\n\t\tcreatedAt\n\t\ttitle\n\t\toriginalUrl\n\t\tsourceDomain\n\t\tdescription\n\t\tleadImage\n\t\twordCount\n\t\tauthor\n\t\ttype\n\t\tstatus\n\t}\n"): (typeof documents)["\n\tfragment SavedItemFragment on SavedItem {\n\t\tid\n\t\tcreatedAt\n\t\ttitle\n\t\toriginalUrl\n\t\tsourceDomain\n\t\tdescription\n\t\tleadImage\n\t\twordCount\n\t\tauthor\n\t\ttype\n\t\tstatus\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment SavedItemLabelFragment on Label {\n\t\tcreatedAt\n\t\tid\n\t\tname\n\t\tcolor\n\t}\n"): (typeof documents)["\n\tfragment SavedItemLabelFragment on Label {\n\t\tcreatedAt\n\t\tid\n\t\tname\n\t\tcolor\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment SavedItemLabelsFragment on SavedItem {\n\t\tid\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment SavedItemLabelsFragment on SavedItem {\n\t\tid\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment NewsletterFragment on Newsletter {\n\t\tcontentHtml\n\t\tcontentText\n\t\tsubscription {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tname\n\t\t\tstatus\n\t\t\tlastReceivedAt\n\t\t\tunsubscribeUrl\n\t\t\tunsubscribeAttemptedAt\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment NewsletterFragment on Newsletter {\n\t\tcontentHtml\n\t\tcontentText\n\t\tsubscription {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tname\n\t\t\tstatus\n\t\t\tlastReceivedAt\n\t\t\tunsubscribeUrl\n\t\t\tunsubscribeAttemptedAt\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment HighlightFragment on Highlight {\n\t\tid\n\t\tcreatedAt\n\t\tsavedItem {\n        \tid\n            title\n        }\n\t\tsegments {\n\t\t\tid\n\t\t\txpath\n\t\t\tbeforeText\n\t\t\tstartOffset\n\t\t\tendOffset\n\t\t\tafterText\n\t\t\ttext\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment HighlightFragment on Highlight {\n\t\tid\n\t\tcreatedAt\n\t\tsavedItem {\n        \tid\n            title\n        }\n\t\tsegments {\n\t\t\tid\n\t\t\txpath\n\t\t\tbeforeText\n\t\t\tstartOffset\n\t\t\tendOffset\n\t\t\tafterText\n\t\t\ttext\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tfragment EntryFragment on Entry {\n\t\t__typename\n\t\t... on SavedItem {\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t}\n\t\t... on Highlight {\n\t\t\t...HighlightFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tfragment EntryFragment on Entry {\n\t\t__typename\n\t\t... on SavedItem {\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t}\n\t\t... on Highlight {\n\t\t\t...HighlightFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tquery me {\n\t\tme {\n\t\t\tid\n\t\t\t...UserFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery me {\n\t\tme {\n\t\t\tid\n\t\t\t...UserFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tquery labels {\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery labels {\n\t\tlabels {\n\t\t\tid\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tquery savedItem($query: GetSavedItemInput!) {\n\t\tsavedItem(query: $query) {\n\t\t\tid\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\tid\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t\tarticle {\n\t\t\t\tcontentHtml\n\t\t\t\tcontentText\n\t\t\t}\n\t\t\tnewsletter {\n\t\t\t\t...NewsletterFragment\n\t\t\t}\n\t\t\thighlights {\n\t\t\t\t...HighlightFragment\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery savedItem($query: GetSavedItemInput!) {\n\t\tsavedItem(query: $query) {\n\t\t\tid\n\t\t\t...SavedItemFragment\n\t\t\tlabels {\n\t\t\t\tid\n\t\t\t\t...SavedItemLabelFragment\n\t\t\t}\n\t\t\tarticle {\n\t\t\t\tcontentHtml\n\t\t\t\tcontentText\n\t\t\t}\n\t\t\tnewsletter {\n\t\t\t\t...NewsletterFragment\n\t\t\t}\n\t\t\thighlights {\n\t\t\t\t...HighlightFragment\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tquery inboundEmailAddresses {\n\t\tinboundEmailAddresses {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tfullAddress\n\t\t\tsubscriptions {\n\t\t\t\tid\n\t\t\t\tcreatedAt\n\t\t\t\tname\n\t\t\t\tstatus\n\t\t\t\tlastReceivedAt\n\t\t\t\tunsubscribeUrl\n\t\t\t\tunsubscribeAttemptedAt\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery inboundEmailAddresses {\n\t\tinboundEmailAddresses {\n\t\t\tid\n\t\t\tcreatedAt\n\t\t\tfullAddress\n\t\t\tsubscriptions {\n\t\t\t\tid\n\t\t\t\tcreatedAt\n\t\t\t\tname\n\t\t\t\tstatus\n\t\t\t\tlastReceivedAt\n\t\t\t\tunsubscribeUrl\n\t\t\t\tunsubscribeAttemptedAt\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tquery entries($query: GetEntriesInput!) {\n\t\tentries(query: $query) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...EntryFragment\n\t\t\t\t}\n\t\t\t\tcursor\n\t\t\t}\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t\tendCursor\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery entries($query: GetEntriesInput!) {\n\t\tentries(query: $query) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...EntryFragment\n\t\t\t\t}\n\t\t\t\tcursor\n\t\t\t}\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t\tendCursor\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation signIn($data: SignInInput!) {\n\t\tsignIn(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation signIn($data: SignInInput!) {\n\t\tsignIn(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation signOut {\n\t\tsignOut {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation signOut {\n\t\tsignOut {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation createAccount($data: CreateAccountInput!) {\n\t\tcreateAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createAccount($data: CreateAccountInput!) {\n\t\tcreateAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation verifyEmail($data: VerifyEmailInput!) {\n\t\tverifyEmail(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation verifyEmail($data: VerifyEmailInput!) {\n\t\tverifyEmail(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation resendVerificationEmail {\n\t\tresendVerificationEmail {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation resendVerificationEmail {\n\t\tresendVerificationEmail {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {\n\t\trequestPasswordRecovery(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {\n\t\trequestPasswordRecovery(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation resetPassword($data: ResetPasswordInput!) {\n\t\tresetPassword(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation resetPassword($data: ResetPasswordInput!) {\n\t\tresetPassword(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation updateAccount($data: UpdateAccountInput!) {\n\t\tupdateAccount(data: $data) {\n\t\t\t...UserFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateAccount($data: UpdateAccountInput!) {\n\t\tupdateAccount(data: $data) {\n\t\t\t...UserFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation deleteAccount($data: DeleteAccountInput!) {\n\t\tdeleteAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation deleteAccount($data: DeleteAccountInput!) {\n\t\tdeleteAccount(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {\n\t\tsetSavedItemLabels(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation setSavedItemLabels($data: SetSavedItemLabelsInput!) {\n\t\tsetSavedItemLabels(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {\n\t\tupdateSavedItemStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateSavedItemStatus($data: UpdateSavedItemStatusInput!) {\n\t\tupdateSavedItemStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {\n\t\tpermanentlyDeleteSavedItems(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation permanentlyDeleteSavedItems($data: PermanentlyDeleteSavedItemsInput!) {\n\t\tpermanentlyDeleteSavedItems(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation createLabel($data: CreateLabelInput!) {\n\t\tcreateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createLabel($data: CreateLabelInput!) {\n\t\tcreateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation updateLabel($data: UpdateLabelInput!) {\n\t\tupdateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateLabel($data: UpdateLabelInput!) {\n\t\tupdateLabel(data: $data) {\n\t\t\t...SavedItemLabelFragment\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation deleteLabel($data: DeleteLabelInput!) {\n\t\tdeleteLabel(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation deleteLabel($data: DeleteLabelInput!) {\n\t\tdeleteLabel(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation createInboundEmailAddress {\n\t\tcreateInboundEmailAddress {\n\t\t\tid\n\t\t\tfullAddress\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createInboundEmailAddress {\n\t\tcreateInboundEmailAddress {\n\t\t\tid\n\t\t\tfullAddress\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation deleteInboundEmailAddress($data: DeleteInboundEmailAddressInput!) {\n\t\tdeleteInboundEmailAddress(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation deleteInboundEmailAddress($data: DeleteInboundEmailAddressInput!) {\n\t\tdeleteInboundEmailAddress(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation updateNewsletterSubscriptionStatus($data: UpdateNewsletterSubscriptionStatusInput!) {\n\t\tupdateNewsletterSubscriptionStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateNewsletterSubscriptionStatus($data: UpdateNewsletterSubscriptionStatusInput!) {\n\t\tupdateNewsletterSubscriptionStatus(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation createHighlight($data: CreateHighlightInput!) {\n\t\tcreateHighlight(data: $data) {\n\t\t\tid\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createHighlight($data: CreateHighlightInput!) {\n\t\tcreateHighlight(data: $data) {\n\t\t\tid\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation DeleteHighlights($data: DeleteHighlightsInput!) {\n\t\tdeleteHighlights(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation DeleteHighlights($data: DeleteHighlightsInput!) {\n\t\tdeleteHighlights(data: $data) {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation createDemoAccount {\n\t\tcreateDemoAccount {\n\t\t\tsuccess\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createDemoAccount {\n\t\tcreateDemoAccount {\n\t\t\tsuccess\n\t\t}\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation requestExport($data: RequestExportInput!) {\n\t\trequestExport(data: $data)\n\t}\n"): (typeof documents)["\n\tmutation requestExport($data: RequestExportInput!) {\n\t\trequestExport(data: $data)\n\t}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;