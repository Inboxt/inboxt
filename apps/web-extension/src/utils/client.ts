import { createApolloClient } from '@inboxt/graphql';

export const client = createApolloClient(`${import.meta.env.VITE_API_URL}/graphql`);
