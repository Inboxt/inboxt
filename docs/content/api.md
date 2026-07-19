# API

Inboxt exposes a GraphQL API on your instance that can be authenticated using API tokens. These tokens allow you to build custom integrations with other apps or tools, such as syncing highlights to a note-taking app or exporting saved content programmatically.

[[toc]]

## Creating an API token

1. Click your profile icon in the top-right corner
2. Click **API Tokens**
3. Click **Create API Token**
4. Enter a name for the token
5. Choose an expiration time (once expired, the token will stop working)
6. Click **Create** and copy the token to your clipboard

> [!CAUTION] Save the token somewhere safe. For security reasons, it cannot be retrieved again after closing the creation modal.

## Using an API token

Your API token must be included in the `Authorization` header of every request using the **Bearer** scheme.

### Authorization header format

```http
Authorization: Bearer <API_TOKEN>
```

### Example token

API tokens:

- Always start with the `app_` prefix
- Are long, opaque strings (currently ~70–80 characters)
- Should be treated like passwords

Example (shortened for readability):

```
app_ac851cea-3cfe-4aea-bf0e-72e0364291cf_5ad355cd-5158-4329-8228-ed2cdf5322b8
```

This token is shown for documentation purposes only. Never share real API tokens publicly.

## GraphQL endpoint

All API requests are sent to the `/api/graphql` endpoint of your Inboxt instance. For example:

```
https://your-inboxt-instance.com/api/graphql
```

Requests must:

- Use the `POST` method
- Include a JSON body
- Include the `Authorization` header

## Example: Fetching labels

The following example shows how to fetch labels using GraphQL and an API token.

### GraphQL query

```graphql
query GetLabels {
  labels {
    id
    name
  }
}
```

### cURL example

```bash
curl https://your-inboxt-instance.com/api/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app_YOUR_API_TOKEN" \
  -d '{
    "query": "query GetLabels { labels { id name } }"
  }'
```

### JavaScript (fetch) example

```javascript
fetch("https://your-inboxt-instance.com/api/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer app_YOUR_API_TOKEN",
  },
  body: JSON.stringify({
    query: `
      query GetLabels {
        labels {
          id
          name
        }
      }
    `,
  }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## GraphQL schema and API reference

Inboxt does not maintain a separate, hand-written API reference.

The API is fully defined by its schema and generated types, which are kept up to date in the repository:

- **Prisma schema (data model):**  
  https://github.com/Inboxt/inboxt/blob/master/apps/api/prisma/schema.prisma

- **Generated GraphQL types and operations:**  
  https://github.com/Inboxt/inboxt/blob/master/libs/graphql/src/generated/graphql.ts

These files are the source of truth for available types, fields, queries, and mutations.

## Entries query (saved items and highlights)

The `entries` query is the primary way to fetch saved content from Inboxt. It returns multiple content types in a single connection.

### Entry types and type resolution

Each node returned by the `entries` query includes a GraphQL `__typename` field.

- If `__typename` is `SavedItem`, the entry represents a saved article or newsletter
- If `__typename` is `Highlight`, the entry represents a highlight

For entries where `__typename` is `SavedItem`, the specific kind of content is determined by the `type` field:

- `ARTICLE`
- `NEWSLETTER`

Consumers should first check `__typename`, and then, for saved items, use the `type` field to distinguish between articles and newsletters.

### Pagination model

The `entries` query follows the Relay-style connection pattern:

- `edges[].node`: the entry data
- `edges[].cursor`: cursor for the current entry
- `pageInfo.endCursor`: cursor used to fetch the next page
- `pageInfo.hasNextPage`: indicates whether more results are available

### Example query

```graphql
query Entries($query: GetEntriesInput!) {
  entries(query: $query) {
    edges {
      node {
        id
        createdAt
        title
        originalUrl
        sourceDomain
        description
        type
        status
        labels {
          id
          name
          color
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Fetching the next page

To fetch the next page of results, pass the `endCursor` value from the previous response into your next request:

```json
{
  "query": {
    "after": "<endCursor from previous page>"
  }
}
```

### Notes

- Articles and newsletters are both returned as `SavedItem`
- Use `__typename` first, then `type` for differentiation

## Security notes

- Keep API tokens secret
- Do not embed tokens in client-side or public code
- Rotate tokens regularly
- Delete tokens you no longer use

API requests made using API tokens are intended for integrations and may have higher rate limits than requests made from the web app, but they are still subject to reasonable limits.
