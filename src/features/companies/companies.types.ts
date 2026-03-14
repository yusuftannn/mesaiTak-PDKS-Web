export type Company = {
  id: string;
  companyId: string;
  name: string;
  country: string;
  createdAt: Date | null;
};

export type CompanyDoc = {
  companyId: string;
  name: string;
  country: string;
  createdAt?: {
    toDate: () => Date;
  };
};
