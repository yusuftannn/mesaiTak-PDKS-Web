"use client";

import { useEffect, useState } from "react";
import { AppUser, updateUser, UserRole } from "@/lib/db/users";
import { Company } from "@/lib/db/companies";
import { Branch, listBranchesByCompany } from "@/lib/db/branches";
import Button from "@/components/ui/Button";

type Props = {
  user: AppUser;
  companies: Company[];
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditUserModal({
  user,
  companies,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [companyId, setCompanyId] = useState(user.companyId ?? "");
  const [branchId, setBranchId] = useState(user.branchId ?? "");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setBranches([]);
      setBranchId("");
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
        role,
        companyId: companyId || null,
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon"
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

        <select
          className="border rounded p-2 w-full"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Şirket seç</option>
          {companies.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.name}
            </option>
          ))}
        </select>

        {companyId && (
          <select
            className="border rounded p-2 w-full"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">Şube seç</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.name}
              </option>
            ))}
          </select>
        )}

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
