export type UserRole = "employee" | "admin" | "manager";

export type UserStatus = "active" | "passive";

export type AppUser = {
  id: string;
  uid: string;

  name: string;
  userName: string;
  email: string;
  phone?: string;

  role: UserRole;

  companyId: string | null;
  branchId: string | null;

  groupTagIds: string[];

  country?: string;

  status: UserStatus;
};

export type CreateUserParams = {
  name: string;
  userName: string;
  email: string;
  password: string;

  phone?: string;

  role: UserRole;

  companyId: string;
  branchId: string | null;

  groupTagIds: string[];

  country?: string;
};

export type UpdateUserParams = Partial<
  Pick<
    AppUser,
    | "role"
    | "companyId"
    | "branchId"
    | "status"
    | "phone"
    | "name"
    | "userName"
    | "country"
  >
>;
