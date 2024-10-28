# Pagination Guide

This repository provides a guide and code examples on how to paginate a dataset using different approaches: simple pagination, hypermedia pagination, and deletion-resilient pagination. Each approach addresses different needs and challenges when working with large datasets that need to be divided into manageable "pages."

## Overview

Pagination is essential when dealing with large datasets. It helps improve performance and user experience by only loading a subset of data at a time. This repository includes examples of different pagination techniques:

1. Simple Pagination: Uses page and page_size parameters to specify the current page and the number of items per page.

2. Hypermedia Pagination: Adds metadata to support navigating between pages (e.g., next, previous links) and information about the dataset (e.g., total count).

3. Deletion-Resilient Pagination: Ensures that pagination remains stable even when records are removed from the dataset.


**usage:**

**Simple Pagination**
This method uses page and page_size parameters to retrieve a subset of data. It’s suitable for straightforward pagination needs.

```
def simple_pagination(data, page, page_size):
    start = (page - 1) * page_size
    end = start + page_size
    return data[start:end]
```

**Parameters**

- **page**: The current page number.
- **page_size**: The number of items on each page.

**Hypermedia Pagination**

Hypermedia pagination includes additional metadata to help the user navigate pages. This type is especially useful in APIs.

```
def hypermedia_pagination(data, page, page_size):
    start = (page - 1) * page_size
    end = start + page_size
    total_items = len(data)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "page": page,
        "page_size": page_size,
        "data": data[start:end],
        "total_items": total_items,
        "total_pages": total_pages,
        "next_page": page + 1 if page < total_pages else None,
        "prev_page": page - 1 if page > 1 else None
    }
```

**Hypermedia Pagination**

Hypermedia pagination includes additional metadata to help the user navigate pages. This type is especially useful in APIs.

```
def hypermedia_pagination(data, page, page_size):
    start = (page - 1) * page_size
    end = start + page_size
    total_items = len(data)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "page": page,
        "page_size": page_size,
        "data": data[start:end],
        "total_items": total_items,
        "total_pages": total_pages,
        "next_page": page + 1 if page < total_pages else None,
        "prev_page": page - 1 if page > 1 else None
    }
```

**Parameters**

- **page**: The current page number.
- **page_size**: The number of items on each page.
- Additional metadata includes total items, total pages, and links to navigate.


## Deletion-Resilient Pagination

This approach maintains pagination stability even when items are deleted. It often involves an id reference for tracking the last item displayed, so subsequent pages adjust based on remaining items.

```
def deletion_resilient_pagination(data, last_id=None, page_size=10):
    if last_id:
        data = [item for item in data if item["id"] > last_id]
    return data[:page_size]
```

**Parameters**

- last_id: The ID of the last item on the previous page, if applicable.
- page_size: The number of items on each page.


## Learn More

- [Rest API design, filtering and pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/#pagination)

- [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS)