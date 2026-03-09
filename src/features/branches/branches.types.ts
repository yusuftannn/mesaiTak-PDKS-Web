export type Branch = {
  id: string;
  branchId: string;
  name: string;
  companyId: string;
  createdAt: Date | null;
};

export type BranchDoc = {
  branchId?: string;
  name: string;
  companyId: string;
  createdAt?: {
    toDate: () => Date;
  };
};
