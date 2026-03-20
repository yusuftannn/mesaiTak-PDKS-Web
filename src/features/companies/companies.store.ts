import { create } from "zustand";
import { Company } from "./companies.types";
import {
  listCompanies,
  createCompany,
  updateCompany,
  removeCompany,
  assignPlanToCompany,
} from "./companies.service";
import { PlanId } from "../plans/plans.types";

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  selectedCompany: Company | null;

  fetchCompanies: () => Promise<void>;

  createCompany: (params: {
    name: string;
    country: string;
    planId?: PlanId;
  }) => Promise<void>;

  updateCompany: (params: {
    companyId: string;
    name: string;
    country: string;
  }) => Promise<void>;

  deleteCompany: (companyId: string) => Promise<void>;

  assignPlan: (companyId: string, planId: PlanId) => Promise<void>;

  setSelectedCompany: (company: Company | null) => void;
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  loading: false,
  selectedCompany: null,

  fetchCompanies: async () => {
    set({ loading: true });

    const data = await listCompanies();

    set({
      companies: data,
      loading: false,
    });
  },

  createCompany: async (params) => {
    set({ loading: true });

    await createCompany(params);

    await get().fetchCompanies();
  },

  updateCompany: async ({ companyId, name, country }) => {
    set({ loading: true });

    await updateCompany(companyId, { name, country });

    await get().fetchCompanies();
  },

  deleteCompany: async (companyId) => {
    set({ loading: true });

    await removeCompany(companyId);

    await get().fetchCompanies();
  },

  assignPlan: async (companyId, planId) => {
    set({ loading: true });

    await assignPlanToCompany(companyId, planId);

    await get().fetchCompanies();
  },

  setSelectedCompany: (company) => {
    set({ selectedCompany: company });
  },
}));
