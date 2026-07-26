# Advanced search

Advanced search lets you precisely filter and organize your library using search operators. You can combine multiple filters in a single query.

By default, searches include unarchived and non-deleted items from your Inbox. You can change this behavior using filters like `in:archive`, `in:trash`, or `in:all`.

[[toc]]

## Text search

Inboxt performs full-text search across:

- Title
- Content
- Description

To search for an exact phrase, wrap your query in quotes:

```
"weekly newsletter"
```

## Filtering by location

Use the `in:` filter to control which part of your library is searched.

Available options:

- `in:inbox`
- `in:archive`
- `in:trash`
- `in:all`

Examples:

```
in:archive
in:trash "meeting notes"
```

## Filtering by labels

You can filter items by label using the `label:` operator. Labels are case sensitive.

Basic label search:

```
label:Newsletter
```

Multiple labels (OR):

```
label:Cooking,Fitness
```

Multiple labels (AND):

```
label:Newsletter label:Surfing
```

Excluding labels:

```
label:Coding -label:News
```

Multi-word labels:

```
label:"Send to Obsidian"
```

Items without labels:

```
no:label
```

## Saved searches

You can save your favorite search queries for quick and easy access to specific filter views. Saved searches appear in the sidebar and allow you to quickly jump to a pre-defined set of filters (e.g., all unread newsletters with a specific label).

To save a search:
1. Enter your search query in the search bar.
2. Click the "Save search" button (bookmark icon) inside that search bar.
3. Give your search a name and save it.

## Filtering by item type

Use the `type:` filter to narrow results by content type.

Available options:

- `type:article`
- `type:newsletter`
- `type:highlight`

Examples:

```
type:newsletter
type:highlight
```

## Finding highlights

There are two ways to work with highlights:

- `type:highlight` shows only highlight entries
- `has:highlights` shows items that contain highlights

Examples:

```
type:highlight
has:highlights label:Books
```

## Filtering by read status

Use the `is:read` or `is:unread` filter to find items based on whether you have read them.

Available options:
- `is:read`
- `is:unread`

Example:

```
is:unread
```

## Filtering by parsing status

Use the `is:failed` or `is:parsed` filter to find items based on their content extraction results. This is useful for identifying items that might need manual attention or have failed to process correctly.

Available options:
- `is:parsed`
- `is:failed`
- `is:processing`

Example:

```
is:failed
```

## Filtering by website

Use the `site:` filter to search by the source website.

Example:

```
site:theverge.com
```

## Filtering by reading progress

Use the `progress:` filter to search by reading progress percentage (0 to 100). You can use a range with `..` and `*` as a wildcard.

Items with at least 50% progress:

```
progress:50..*
```

Items between 20% and 80% progress:

```
progress:20..80
```

Items with approximately 35% progress:

```
progress:35
```

Items with no progress (exactly 0%):

```
progress:0
```

## Filtering by reading time

Use the `reading-time:` filter to search by estimated reading time in minutes. You can use a range with `..` and `*` as a wildcard.

Items that take at least 10 minutes to read:

```
reading-time:10..*
```

Short reads (less than 5 minutes):

```
reading-time:*..5
```

Items that take exactly 5 minutes to read:

```
reading-time:5
```

## Filtering by save date

Use the `saved:` filter to search within a date range. Dates use the `YYYY-MM-DD` format, and `*` can be used as a wildcard.

Items saved since a specific date:

```
saved:2022-04-21..*
```

Items saved between two dates:

```
saved:2020-01-01..2022-02-02
```

Items saved before a specific date:

```
saved:*..2020-01-01
```

## Sorting results

Search results are sorted by saved date (newest first) by default.

You can change sorting using the `sort:` operator.

Sort options:

- `sort:date`
- `sort:title`
- `sort:reading-progress`
- `sort:reading-time`

All sort queries require a direction:

- `asc`
- `desc`

Examples:

```
sort:date_desc
sort:title_asc
```

## Combining filters

You can combine multiple filters in a single query.

Example:

```
in:archive type:article label:Research sort:date_desc
```

This finds:

- Archived items
- Articles only
- Labeled “Research”
- Sorted by newest first

## Default views (reference)

Inbox:

```
in:inbox type:article sort:date_desc
```

Newsletters:

```
in:inbox type:newsletter sort:date_desc
```

Highlights:

```
type:highlight sort:date_desc
```

Archive:

```
in:archive sort:date_desc
```

Trash:

```
in:trash sort:date_desc
```

Label view:

```
label:LabelName sort:date_desc
```
