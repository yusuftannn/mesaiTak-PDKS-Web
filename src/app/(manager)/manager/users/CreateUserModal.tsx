"use client";

import { useEffect, useState } from "react";
import { createUser } from "@/features/users/users.service";
import { Branch } from "@/features/branches/branches.types";
import { listBranchesByCompany } from "@/features/branches/branches.service";
import { Company } from "@/features/companies/companies.types";
import { listCompanies } from "@/features/companies/companies.service";

import Button from "@/components/ui/Button";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

type UserRole = "employee" | "admin" | "manager";

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState<UserRole>("employee");

  const [companyId, setCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [branchId, setBranchId] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);

  const [country, setCountry] = useState("Turkiye");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!name || !email || !password || !userName) {
      setError("Zorunlu alanlar boş");
      return;
    }

    if (role !== "manager" && !companyId) {
      setError("Şirket seçmelisiniz");
      return;
    }

    setLoading(true);

    try {
      await createUser({
        name,
        userName,
        email,
        password,
        phone,
        role,
        companyId: role === "manager" ? "" : companyId,
        branchId: role === "manager" ? "" : branchId || null,
        country: country || "Turkiye",
        groupTagIds: [],
      });

      onCreated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Kullanıcı oluşturulamadı");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold">Yeni Kullanıcı</h3>

        <input
          className="border rounded p-2 w-full"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded p-2 w-full"
          placeholder="Kullanıcı Adı"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          className="border rounded p-2 w-full"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded p-2 w-full"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="border rounded p-2 w-full"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className="border rounded p-2 w-full"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          disabled={role === "manager"}
        >
          <option value="">Şirket seç</option>
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
          <option value="">Şube seç (opsiyonel)</option>
          {branches.map((b) => (
            <option key={b.branchId} value={b.branchId}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          className="border rounded p-2 w-full"
          placeholder="Ülke"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button size="sm" loading={loading} onClick={onSubmit}>
            Oluştur
          </Button>
        </div>
      </div>
    </div>
  );
}
