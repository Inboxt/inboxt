/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type Article = {
  __typename?: 'Article';
  contentHtml: Scalars['String']['output'];
  contentText: Scalars['String']['output'];
};

export type CreateAccountInput = {
  emailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type CreateHighlightInput = {
  savedItemId: Scalars['String']['input'];
  segments: Array<CreateHighlightSegmentInput>;
};

export type CreateHighlightSegmentInput = {
  afterText: Scalars['String']['input'];
  beforeText: Scalars['String']['input'];
  endOffset: Scalars['Int']['input'];
  startOffset: Scalars['Int']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
  xpath: Scalars['String']['input'];
};

export type CreateLabelInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type DeleteAccountInput = {
  emailAddress: Scalars['String']['input'];
};

export type DeleteHighlightInput = {
  id: Scalars['String']['input'];
  savedItemId: Scalars['String']['input'];
};

export type DeleteInboundEmailAddressInput = {
  id: Scalars['String']['input'];
};

export type DeleteLabelInput = {
  id: Scalars['String']['input'];
};

export type GetSavedItemInput = {
  id: Scalars['String']['input'];
};

export type GetSavedItemsInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Float']['input'];
  labelId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SavedItemSort>;
  status?: InputMaybe<SavedItemStatus>;
  type?: InputMaybe<SavedItemType>;
};

export type Highlight = {
  __typename?: 'Highlight';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  segments: Array<HighlightSegment>;
};

export type HighlightSegment = {
  __typename?: 'HighlightSegment';
  afterText: Scalars['String']['output'];
  beforeText: Scalars['String']['output'];
  endOffset: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  startOffset: Scalars['Float']['output'];
  text?: Maybe<Scalars['String']['output']>;
  xpath: Scalars['String']['output'];
};

export type InboundEmailAddress = {
  __typename?: 'InboundEmailAddress';
  createdAt: Scalars['DateTime']['output'];
  fullAddress: Scalars['String']['output'];
  id: Scalars['String']['output'];
  subscriptions?: Maybe<Array<NewsletterSubscription>>;
};

export type Label = {
  __typename?: 'Label';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Void;
  createHighlight: Highlight;
  createInboundEmailAddress: InboundEmailAddress;
  createLabel: Label;
  deleteAccount: Void;
  deleteHighlight: Void;
  deleteInboundEmailAddress: Void;
  deleteLabel: Void;
  permanentlyDeleteSavedItems: Void;
  requestPasswordRecovery: Void;
  resendVerificationEmail: Void;
  resetPassword: Void;
  setSavedItemLabels: Void;
  signIn: Void;
  signOut: Void;
  updateAccount: User;
  updateLabel: Label;
  updateNewsletterSubscriptionStatus: Void;
  updateSavedItemStatus: Void;
  verifyEmail: Void;
};


export type MutationCreateAccountArgs = {
  data: CreateAccountInput;
};


export type MutationCreateHighlightArgs = {
  data: CreateHighlightInput;
};


export type MutationCreateLabelArgs = {
  data: CreateLabelInput;
};


export type MutationDeleteAccountArgs = {
  data: DeleteAccountInput;
};


export type MutationDeleteHighlightArgs = {
  data: DeleteHighlightInput;
};


export type MutationDeleteInboundEmailAddressArgs = {
  data: DeleteInboundEmailAddressInput;
};


export type MutationDeleteLabelArgs = {
  data: DeleteLabelInput;
};


export type MutationPermanentlyDeleteSavedItemsArgs = {
  data: PermanentlyDeleteSavedItemsInput;
};


export type MutationRequestPasswordRecoveryArgs = {
  data: RequestPasswordRecoveryInput;
};


export type MutationResetPasswordArgs = {
  data: ResetPasswordInput;
};


export type MutationSetSavedItemLabelsArgs = {
  data: SetSavedItemLabelsInput;
};


export type MutationSignInArgs = {
  data: SignInInput;
};


export type MutationUpdateAccountArgs = {
  data: UpdateAccountInput;
};


export type MutationUpdateLabelArgs = {
  data: UpdateLabelInput;
};


export type MutationUpdateNewsletterSubscriptionStatusArgs = {
  data: UpdateNewsletterSubscriptionStatusInput;
};


export type MutationUpdateSavedItemStatusArgs = {
  data: UpdateSavedItemStatusInput;
};


export type MutationVerifyEmailArgs = {
  data: VerifyEmailInput;
};

export type Newsletter = {
  __typename?: 'Newsletter';
  contentHtml: Scalars['String']['output'];
  contentText: Scalars['String']['output'];
  subscription?: Maybe<NewsletterSubscription>;
};

export type NewsletterSubscription = {
  __typename?: 'NewsletterSubscription';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  lastReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  status: NewsletterSubscriptionStatus;
  unsubscribeAttemptedAt?: Maybe<Scalars['DateTime']['output']>;
  unsubscribeUrl?: Maybe<Scalars['String']['output']>;
};

export type PermanentlyDeleteSavedItemsInput = {
  ids: Array<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  inboundEmailAddresses?: Maybe<Array<InboundEmailAddress>>;
  labels?: Maybe<Array<Label>>;
  me?: Maybe<User>;
  savedItem?: Maybe<SavedItem>;
  savedItems: SavedItemConnection;
};


export type QuerySavedItemArgs = {
  query: GetSavedItemInput;
};


export type QuerySavedItemsArgs = {
  query: GetSavedItemsInput;
};

export type RequestPasswordRecoveryInput = {
  emailAddress: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  code: Scalars['String']['input'];
  emailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SavedItem = {
  __typename?: 'SavedItem';
  article?: Maybe<Article>;
  author?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  highlights?: Maybe<Array<Highlight>>;
  id: Scalars['String']['output'];
  labels?: Maybe<Array<Label>>;
  leadImage?: Maybe<Scalars['String']['output']>;
  newsletter?: Maybe<Newsletter>;
  originalUrl?: Maybe<Scalars['String']['output']>;
  sourceDomain?: Maybe<Scalars['String']['output']>;
  status: SavedItemStatus;
  title: Scalars['String']['output'];
  type: SavedItemType;
  wordCount: Scalars['Float']['output'];
};

export type SavedItemConnection = {
  __typename?: 'SavedItemConnection';
  edges: Array<SavedItemEdge>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type SavedItemEdge = {
  __typename?: 'SavedItemEdge';
  cursor: Scalars['String']['output'];
  node: SavedItem;
};

export type SavedItemSort = {
  direction: SortDirection;
  field: SavedItemSortField;
};

/** Properties by which saved items can be sorted. */
export enum SavedItemSortField {
  CreatedAt = 'createdAt',
  Title = 'title'
}

export type SetSavedItemLabelsInput = {
  id: Scalars['String']['input'];
  labelIds: Array<Scalars['String']['input']>;
};

export type SignInInput = {
  emailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** Possible directions for sorting a list of items */
export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type UpdateAccountInput = {
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLabelInput = {
  color: Scalars['String']['input'];
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type UpdateNewsletterSubscriptionStatusInput = {
  id: Scalars['String']['input'];
  status: NewsletterSubscriptionStatus;
};

export type UpdateSavedItemStatusInput = {
  ids: Array<Scalars['String']['input']>;
  status: SavedItemStatus;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  emailAddress: Scalars['String']['output'];
  id: Scalars['String']['output'];
  inboundEmailAddressesCount: Scalars['Float']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  labelsCount: Scalars['Float']['output'];
  pendingEmailAddress?: Maybe<Scalars['String']['output']>;
  plan: UserPlan;
  username: Scalars['String']['output'];
};

export type VerifyEmailInput = {
  code: Scalars['String']['input'];
};

export type Void = {
  __typename?: 'Void';
  success: Scalars['Boolean']['output'];
};

/** The status of a user's newsletter subscription */
export enum NewsletterSubscriptionStatus {
  Active = 'ACTIVE',
  Unsubscribed = 'UNSUBSCRIBED'
}

/** The status of a saved item */
export enum SavedItemStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Deleted = 'DELETED'
}

/** The type of a saved item */
export enum SavedItemType {
  Article = 'ARTICLE',
  Newsletter = 'NEWSLETTER'
}

/** Current user plan */
export enum UserPlan {
  Demo = 'DEMO',
  Free = 'FREE'
}

export type UserFragmentFragment = { __typename?: 'User', id: string, createdAt: string, emailAddress: string, isEmailVerified: boolean, username: string, pendingEmailAddress?: string | null, plan: UserPlan, labelsCount: number, inboundEmailAddressesCount: number };

export type SavedItemFragmentFragment = { __typename?: 'SavedItem', id: string, createdAt: string, title: string, originalUrl?: string | null, sourceDomain?: string | null, description?: string | null, leadImage?: string | null, wordCount: number, author?: string | null, type: SavedItemType, status: SavedItemStatus };

export type SavedItemLabelFragmentFragment = { __typename?: 'Label', createdAt: string, id: string, name: string, color: string };

export type SavedItemLabelsFragmentFragment = { __typename?: 'SavedItem', id: string, labels?: Array<{ __typename?: 'Label', id: string, createdAt: string, name: string, color: string }> | null };

export type NewsletterFragmentFragment = { __typename?: 'Newsletter', contentHtml: string, contentText: string, subscription?: { __typename?: 'NewsletterSubscription', id: string, createdAt: string, name: string, status: NewsletterSubscriptionStatus, lastReceivedAt?: string | null, unsubscribeUrl?: string | null, unsubscribeAttemptedAt?: string | null } | null };

export type HighlightFragmentFragment = { __typename?: 'Highlight', id: string, createdAt: string, segments: Array<{ __typename?: 'HighlightSegment', id: string, xpath: string, beforeText: string, startOffset: number, endOffset: number, afterText: string, text?: string | null }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, createdAt: string, emailAddress: string, isEmailVerified: boolean, username: string, pendingEmailAddress?: string | null, plan: UserPlan, labelsCount: number, inboundEmailAddressesCount: number } | null };

export type LabelsQueryVariables = Exact<{ [key: string]: never; }>;


export type LabelsQuery = { __typename?: 'Query', labels?: Array<{ __typename?: 'Label', id: string, createdAt: string, name: string, color: string }> | null };

export type SavedItemsQueryVariables = Exact<{
  query: GetSavedItemsInput;
}>;


export type SavedItemsQuery = { __typename?: 'Query', savedItems: { __typename?: 'SavedItemConnection', endCursor?: string | null, hasNextPage: boolean, edges: Array<{ __typename?: 'SavedItemEdge', cursor: string, node: { __typename?: 'SavedItem', id: string, createdAt: string, title: string, originalUrl?: string | null, sourceDomain?: string | null, description?: string | null, leadImage?: string | null, wordCount: number, author?: string | null, type: SavedItemType, status: SavedItemStatus, labels?: Array<{ __typename?: 'Label', id: string, createdAt: string, name: string, color: string }> | null, article?: { __typename?: 'Article', contentHtml: string, contentText: string } | null, newsletter?: { __typename?: 'Newsletter', contentHtml: string, contentText: string, subscription?: { __typename?: 'NewsletterSubscription', id: string, createdAt: string, name: string, status: NewsletterSubscriptionStatus, lastReceivedAt?: string | null, unsubscribeUrl?: string | null, unsubscribeAttemptedAt?: string | null } | null } | null } }> } };

export type SavedItemQueryVariables = Exact<{
  query: GetSavedItemInput;
}>;


export type SavedItemQuery = { __typename?: 'Query', savedItem?: { __typename?: 'SavedItem', id: string, createdAt: string, title: string, originalUrl?: string | null, sourceDomain?: string | null, description?: string | null, leadImage?: string | null, wordCount: number, author?: string | null, type: SavedItemType, status: SavedItemStatus, labels?: Array<{ __typename?: 'Label', id: string, createdAt: string, name: string, color: string }> | null, article?: { __typename?: 'Article', contentHtml: string, contentText: string } | null, newsletter?: { __typename?: 'Newsletter', contentHtml: string, contentText: string, subscription?: { __typename?: 'NewsletterSubscription', id: string, createdAt: string, name: string, status: NewsletterSubscriptionStatus, lastReceivedAt?: string | null, unsubscribeUrl?: string | null, unsubscribeAttemptedAt?: string | null } | null } | null, highlights?: Array<{ __typename?: 'Highlight', id: string, createdAt: string, segments: Array<{ __typename?: 'HighlightSegment', id: string, xpath: string, beforeText: string, startOffset: number, endOffset: number, afterText: string, text?: string | null }> }> | null } | null };

export type InboundEmailAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type InboundEmailAddressesQuery = { __typename?: 'Query', inboundEmailAddresses?: Array<{ __typename?: 'InboundEmailAddress', id: string, createdAt: string, fullAddress: string, subscriptions?: Array<{ __typename?: 'NewsletterSubscription', id: string, createdAt: string, name: string, status: NewsletterSubscriptionStatus, lastReceivedAt?: string | null, unsubscribeUrl?: string | null, unsubscribeAttemptedAt?: string | null }> | null }> | null };

export type SignInMutationVariables = Exact<{
  data: SignInInput;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn: { __typename?: 'Void', success: boolean } };

export type SignOutMutationVariables = Exact<{ [key: string]: never; }>;


export type SignOutMutation = { __typename?: 'Mutation', signOut: { __typename?: 'Void', success: boolean } };

export type CreateAccountMutationVariables = Exact<{
  data: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Void', success: boolean } };

export type VerifyEmailMutationVariables = Exact<{
  data: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'Void', success: boolean } };

export type ResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendVerificationEmailMutation = { __typename?: 'Mutation', resendVerificationEmail: { __typename?: 'Void', success: boolean } };

export type RequestPasswordRecoveryMutationVariables = Exact<{
  data: RequestPasswordRecoveryInput;
}>;


export type RequestPasswordRecoveryMutation = { __typename?: 'Mutation', requestPasswordRecovery: { __typename?: 'Void', success: boolean } };

export type ResetPasswordMutationVariables = Exact<{
  data: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'Void', success: boolean } };

export type UpdateAccountMutationVariables = Exact<{
  data: UpdateAccountInput;
}>;


export type UpdateAccountMutation = { __typename?: 'Mutation', updateAccount: { __typename?: 'User', id: string, createdAt: string, emailAddress: string, isEmailVerified: boolean, username: string, pendingEmailAddress?: string | null, plan: UserPlan, labelsCount: number, inboundEmailAddressesCount: number } };

export type DeleteAccountMutationVariables = Exact<{
  data: DeleteAccountInput;
}>;


export type DeleteAccountMutation = { __typename?: 'Mutation', deleteAccount: { __typename?: 'Void', success: boolean } };

export type SetSavedItemLabelsMutationVariables = Exact<{
  data: SetSavedItemLabelsInput;
}>;


export type SetSavedItemLabelsMutation = { __typename?: 'Mutation', setSavedItemLabels: { __typename?: 'Void', success: boolean } };

export type UpdateSavedItemStatusMutationVariables = Exact<{
  data: UpdateSavedItemStatusInput;
}>;


export type UpdateSavedItemStatusMutation = { __typename?: 'Mutation', updateSavedItemStatus: { __typename?: 'Void', success: boolean } };

export type PermanentlyDeleteSavedItemsMutationVariables = Exact<{
  data: PermanentlyDeleteSavedItemsInput;
}>;


export type PermanentlyDeleteSavedItemsMutation = { __typename?: 'Mutation', permanentlyDeleteSavedItems: { __typename?: 'Void', success: boolean } };

export type CreateLabelMutationVariables = Exact<{
  data: CreateLabelInput;
}>;


export type CreateLabelMutation = { __typename?: 'Mutation', createLabel: { __typename?: 'Label', createdAt: string, id: string, name: string, color: string } };

export type UpdateLabelMutationVariables = Exact<{
  data: UpdateLabelInput;
}>;


export type UpdateLabelMutation = { __typename?: 'Mutation', updateLabel: { __typename?: 'Label', createdAt: string, id: string, name: string, color: string } };

export type DeleteLabelMutationVariables = Exact<{
  data: DeleteLabelInput;
}>;


export type DeleteLabelMutation = { __typename?: 'Mutation', deleteLabel: { __typename?: 'Void', success: boolean } };

export type CreateInboundEmailAddressMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateInboundEmailAddressMutation = { __typename?: 'Mutation', createInboundEmailAddress: { __typename?: 'InboundEmailAddress', id: string, fullAddress: string } };

export type DeleteInboundEmailAddressMutationVariables = Exact<{
  data: DeleteInboundEmailAddressInput;
}>;


export type DeleteInboundEmailAddressMutation = { __typename?: 'Mutation', deleteInboundEmailAddress: { __typename?: 'Void', success: boolean } };

export type UpdateNewsletterSubscriptionStatusMutationVariables = Exact<{
  data: UpdateNewsletterSubscriptionStatusInput;
}>;


export type UpdateNewsletterSubscriptionStatusMutation = { __typename?: 'Mutation', updateNewsletterSubscriptionStatus: { __typename?: 'Void', success: boolean } };

export type CreateHighlightMutationVariables = Exact<{
  data: CreateHighlightInput;
}>;


export type CreateHighlightMutation = { __typename?: 'Mutation', createHighlight: { __typename?: 'Highlight', id: string } };

export type DeleteHighlightMutationVariables = Exact<{
  data: DeleteHighlightInput;
}>;


export type DeleteHighlightMutation = { __typename?: 'Mutation', deleteHighlight: { __typename?: 'Void', success: boolean } };

export const UserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"isEmailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"pendingEmailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"labelsCount"}},{"kind":"Field","name":{"kind":"Name","value":"inboundEmailAddressesCount"}}]}}]} as unknown as DocumentNode<UserFragmentFragment, unknown>;
export const SavedItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"originalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sourceDomain"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"leadImage"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<SavedItemFragmentFragment, unknown>;
export const SavedItemLabelFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<SavedItemLabelFragmentFragment, unknown>;
export const SavedItemLabelsFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<SavedItemLabelsFragmentFragment, unknown>;
export const NewsletterFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewsletterFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Newsletter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentHtml"}},{"kind":"Field","name":{"kind":"Name","value":"contentText"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastReceivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeAttemptedAt"}}]}}]}}]} as unknown as DocumentNode<NewsletterFragmentFragment, unknown>;
export const HighlightFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HighlightFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Highlight"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"xpath"}},{"kind":"Field","name":{"kind":"Name","value":"beforeText"}},{"kind":"Field","name":{"kind":"Name","value":"startOffset"}},{"kind":"Field","name":{"kind":"Name","value":"endOffset"}},{"kind":"Field","name":{"kind":"Name","value":"afterText"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]} as unknown as DocumentNode<HighlightFragmentFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"isEmailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"pendingEmailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"labelsCount"}},{"kind":"Field","name":{"kind":"Name","value":"inboundEmailAddressesCount"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LabelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<LabelsQuery, LabelsQueryVariables>;
export const SavedItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"savedItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSavedItemsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savedItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemFragment"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"article"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentHtml"}},{"kind":"Field","name":{"kind":"Name","value":"contentText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"newsletter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NewsletterFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"originalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sourceDomain"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"leadImage"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewsletterFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Newsletter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentHtml"}},{"kind":"Field","name":{"kind":"Name","value":"contentText"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastReceivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeAttemptedAt"}}]}}]}}]} as unknown as DocumentNode<SavedItemsQuery, SavedItemsQueryVariables>;
export const SavedItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"savedItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetSavedItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savedItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemFragment"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"article"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentHtml"}},{"kind":"Field","name":{"kind":"Name","value":"contentText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"newsletter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NewsletterFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"highlights"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HighlightFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"originalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sourceDomain"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"leadImage"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewsletterFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Newsletter"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentHtml"}},{"kind":"Field","name":{"kind":"Name","value":"contentText"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastReceivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeAttemptedAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HighlightFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Highlight"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"xpath"}},{"kind":"Field","name":{"kind":"Name","value":"beforeText"}},{"kind":"Field","name":{"kind":"Name","value":"startOffset"}},{"kind":"Field","name":{"kind":"Name","value":"endOffset"}},{"kind":"Field","name":{"kind":"Name","value":"afterText"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]} as unknown as DocumentNode<SavedItemQuery, SavedItemQueryVariables>;
export const InboundEmailAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"inboundEmailAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inboundEmailAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"fullAddress"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastReceivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribeAttemptedAt"}}]}}]}}]}}]} as unknown as DocumentNode<InboundEmailAddressesQuery, InboundEmailAddressesQueryVariables>;
export const SignInDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"signIn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignInInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SignInMutation, SignInMutationVariables>;
export const SignOutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"signOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SignOutMutation, SignOutMutationVariables>;
export const CreateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"verifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"resendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;
export const RequestPasswordRecoveryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"requestPasswordRecovery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestPasswordRecoveryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordRecovery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RequestPasswordRecoveryMutation, RequestPasswordRecoveryMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"resetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UpdateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"isEmailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"pendingEmailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"labelsCount"}},{"kind":"Field","name":{"kind":"Name","value":"inboundEmailAddressesCount"}}]}}]} as unknown as DocumentNode<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const SetSavedItemLabelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setSavedItemLabels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetSavedItemLabelsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSavedItemLabels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SetSavedItemLabelsMutation, SetSavedItemLabelsMutationVariables>;
export const UpdateSavedItemStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateSavedItemStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSavedItemStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSavedItemStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<UpdateSavedItemStatusMutation, UpdateSavedItemStatusMutationVariables>;
export const PermanentlyDeleteSavedItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"permanentlyDeleteSavedItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PermanentlyDeleteSavedItemsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"permanentlyDeleteSavedItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<PermanentlyDeleteSavedItemsMutation, PermanentlyDeleteSavedItemsMutationVariables>;
export const CreateLabelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createLabel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLabelInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLabel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<CreateLabelMutation, CreateLabelMutationVariables>;
export const UpdateLabelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateLabel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateLabelInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateLabel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedItemLabelFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedItemLabelFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]} as unknown as DocumentNode<UpdateLabelMutation, UpdateLabelMutationVariables>;
export const DeleteLabelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteLabel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteLabelInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteLabel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteLabelMutation, DeleteLabelMutationVariables>;
export const CreateInboundEmailAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createInboundEmailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInboundEmailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullAddress"}}]}}]}}]} as unknown as DocumentNode<CreateInboundEmailAddressMutation, CreateInboundEmailAddressMutationVariables>;
export const DeleteInboundEmailAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteInboundEmailAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteInboundEmailAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInboundEmailAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteInboundEmailAddressMutation, DeleteInboundEmailAddressMutationVariables>;
export const UpdateNewsletterSubscriptionStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateNewsletterSubscriptionStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNewsletterSubscriptionStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNewsletterSubscriptionStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<UpdateNewsletterSubscriptionStatusMutation, UpdateNewsletterSubscriptionStatusMutationVariables>;
export const CreateHighlightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createHighlight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateHighlightInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createHighlight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateHighlightMutation, CreateHighlightMutationVariables>;
export const DeleteHighlightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteHighlight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteHighlightInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteHighlight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteHighlightMutation, DeleteHighlightMutationVariables>;