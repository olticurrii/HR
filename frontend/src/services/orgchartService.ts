import { api } from './authService';

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  avatar_url?: string;
  children: OrgChartNode[];
}

export interface ReassignRequest {
  user_id: number;
  new_manager_id?: number | null;
  new_department_id?: number | null;
}

export interface ReassignResponse {
  message: string;
  user_id: number;
  new_manager_id?: number | null;
  new_department_id?: number | null;
}

export interface OrgChartResponse {
  assigned: OrgChartNode[];
  unassigned: OrgChartNode[];
}

export const orgchartService = {
  async getOrgChart(): Promise<OrgChartResponse> {
    const response = await api.get('/api/v1/orgchart');
    return response.data;
  },

  async reassignUser(request: ReassignRequest): Promise<ReassignResponse> {
    const response = await api.patch('/api/v1/orgchart/reassign', request);
    return response.data;
  },
};

export default orgchartService;
