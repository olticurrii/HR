import { api } from './authService';

export interface SearchResult {
  id: number;
  type: 'user' | 'task' | 'project' | 'feedback' | 'department' | 'chat' | 'document';
  title: string;
  subtitle?: string;
  description?: string;
  avatar_url?: string;
  icon?: string;
  url: string;
  metadata?: any;
  relevance_score: number;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResult[];
  results_by_type: Record<string, number>;
  execution_time_ms: number;
}

class SearchService {
  async search(
    query: string,
    types?: string[],
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    const params: any = {
      q: query,
      limit,
      offset,
    };

    if (types && types.length > 0) {
      params.types = types.join(',');
    }

    const response = await api.get('/api/v1/search', { params });
    return response.data;
  }

  getIconForType(type: string): string {
    const iconMap: Record<string, string> = {
      user: '👤',
      task: '✓',
      project: '📁',
      feedback: '💬',
      department: '🏢',
      chat: '💬',
      document: '📄',
    };
    return iconMap[type] || '📌';
  }

  getColorForType(type: string): string {
    const colorMap: Record<string, string> = {
      user: 'blue',
      task: 'green',
      project: 'purple',
      feedback: 'yellow',
      department: 'gray',
      chat: 'indigo',
      document: 'red',
    };
    return colorMap[type] || 'gray';
  }

  getLabelForType(type: string): string {
    const labelMap: Record<string, string> = {
      user: 'Person',
      task: 'Task',
      project: 'Project',
      feedback: 'Feedback',
      department: 'Department',
      chat: 'Chat',
      document: 'Document',
    };
    return labelMap[type] || type;
  }
}

export default new SearchService();

