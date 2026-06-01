import { useClient } from './_client';
import type {
  Company,
  CompanyPage,
  CompanySearchParams,
  CreateCompanyPayload,
} from './types';

export function useCompanyActions() {
  const apiRequest = useClient();

  return {
    createCompany: (payload: CreateCompanyPayload): Promise<Company> =>
      apiRequest('/api/company', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getCompanies: (page = 1): Promise<CompanyPage> =>
      apiRequest(`/api/company?page=${page}`),

    searchCompanies: (params: CompanySearchParams): Promise<Company[]> => {
      const query =
        'name' in params ? `name=${params.name}` : `ticker=${params.ticker}`;
      return apiRequest(`/api/company/search?${query}`);
    },

    deleteCompany: (id: number): Promise<void> =>
      apiRequest(`/api/company/${id}`, { method: 'DELETE' }),
  };
}
