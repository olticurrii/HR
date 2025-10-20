from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime


class SearchResult(BaseModel):
    """Single search result item"""
    id: int
    type: Literal['user', 'task', 'project', 'feedback', 'department', 'chat', 'document']
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    icon: Optional[str] = None
    url: str
    metadata: Optional[dict] = None
    relevance_score: float = 0.0
    
    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Search response with grouped results"""
    query: str
    total_results: int
    results: List[SearchResult]
    results_by_type: dict[str, int]
    execution_time_ms: float


class SearchFilters(BaseModel):
    """Optional filters for search"""
    types: Optional[List[str]] = None  # Filter by type: user, task, project, etc.
    limit: int = 20
    offset: int = 0

