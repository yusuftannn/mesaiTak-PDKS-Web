"use client";

import { useEffect, useState } from "react";
import { updateUser } from "@/features/users/users.service";
import { AppUser, UserRole } from "@/features/users/users.types";

import { Branch } from "@/features/branches/branches.types";
import { listBranchesByCompany } from "@/features/branches/branches.service";

import { Company } from "@/features/companies/companies.types";
import { listCompanies } from "@/features/companies/companies.service";

import Button from "@/components/ui/Button";

type Props = {
  user: AppUser;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditUserModal({ user, onClose, onUpdated }: Props) {
  const [name, setName] = useState(user.name);
  const [userName, setUserName] = useState<string>(user.userName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [country, setCountry] = useState(user.country ?? "Turkiye");

  const [role, setRole] = useState<UserRole>(user.role);

  const [companyId, setCompanyId] = useState(user.companyId);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [branchId, setBranchId] = useState(user.branchId ?? "");
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    if (!companyId) {
      setBranches([]);
      return;
    }

    listBranchesByCompany(companyId).then(setBranches);
  }, [companyId]);

  const onSubmit = async () => {
    setLoading(true);

    try {
      await updateUser(user.id, {
        name,
        phone,
        userName,
        country: country || "Turkiye",
        role,
        companyId,
        branchId: branchId || null,
      });

      onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold">Kullanıcı Düzenle</h3>

        <input
          className="border rounded p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded p-2 w-full"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Kullanıcı Adı"
        />

        <input
          className="border rounded p-2 w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon"
        />

        <select
          className="border rounded p-2 w-full"
          value={companyId ?? ""}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          {companies.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2 w-full"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          disabled={!companyId}
        >
          <option value="">Şube seç</option>
          {branches.map((b) => (
            <option key={b.branchId} value={b.branchId}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          className="border rounded p-2 w-full"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Ülke"
        />

        <select
          className="border rounded p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="employee">employee</option>
          <option value="admin">admin</option>
          <option value="manager">manager</option>
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            İptal
          </Button>

          <Button size="sm" loading={loading} onClick={onSubmit}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
