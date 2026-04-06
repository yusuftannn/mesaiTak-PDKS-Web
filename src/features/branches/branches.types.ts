export type Branch = {
  id: string;
  branchId: string;
  name: string;
  companyId: string;
  createdAt: Date | null;
  qrValue: string;

  lat: number;
  lng: number; 
};

export type BranchDoc = {
  qrValue: string;
  branchId?: string;
  name: string;
  companyId: string;
  createdAt?: {
    toDate: () => Date;
  };

  lat: number; 
  lng: number; 
};
