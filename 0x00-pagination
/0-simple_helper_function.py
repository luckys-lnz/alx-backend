#!/usr/bin/env python3
"""Pagination helper function."""
from typing import Tuple

def index_range(page: int, page_size: int) -> Tuple[int, int]:
    """
    Calculate the start and end indices for pagination.

    Args:
        page (int): The current page number (1-indexed).
        page_size (int): The number of items per page.

    Returns:
        Tuple[int, int]: A tuple containing the start and end indices
                         for the current page.
    """
    start = (page - 1) * page_size
    end = page * page_size
    return start, end
