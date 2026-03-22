export interface GroupTag {
  id: string;
  name: string;
  refId: string;
  companyId: string;

  createdAt?: Date;
  updatedAt?: Date;

  userCount?: number;
}
export type GroupTagDoc = {
  name: string;
  refId: string;
  companyId: string;
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
};

export type UserDoc = {
  groupTagIds?: string[];
  companyId: string;
};