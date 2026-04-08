"use client";

import { useEffect, useState } from "react";
import { createUser } from "@/features/users/users.service";
import { Branch } from "@/features/branches/branches.types";
import { listBranches } from "@/features/branches/branches.service";
import { getCompanyId } from "@/lib/utils/company";

import Button from "@/components/ui/Button";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

type Errors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const companyId = getCompanyId();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "employee" as "employee" | "admin",
    branchId: "",
    country: "Turkiye",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);

  function validate(): Errors {
    const newErrors: Errors = {};

    if (!form.name.trim()) {
      newErrors.name = "Ad soyad zorunlu";
    }

    if (!form.email.trim()) {
      newErrors.email = "E-posta zorunlu";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta gir";
    }

    if (!form.password.trim()) {
      newErrors.password = "Şifre zorunlu";
    } else if (form.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalı";
    }

    return newErrors;
  }

  const onSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        companyId,
        branchId: form.branchId || null,
        country: form.country || "Turkiye",
        groupTagIds: [],
      });

      onCreated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Kullanıcı oluşturulamadı");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.name || !form.email || !form.password || loading;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold">Yeni Kullanıcı</h3>

        <div>
          <label className="text-sm font-medium">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            className="border rounded p-2 w-full mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            className="border rounded p-2 w-full mt-1"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            Şifre <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            className="border rounded p-2 w-full mt-1"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Telefon</label>
          <input
            className="border rounded p-2 w-full mt-1"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ülke</label>
          <input
            className="border rounded p-2 w-full mt-1"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Rol</label>
          <select
            className="border rounded p-2 w-full mt-1"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value as "employee" | "admin",
              })
            }
          >
            <option value="employee">employee</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Şube</label>
          <select
            className="border rounded p-2 w-full mt-1"
            value={form.branchId}
            onChange={(e) => setForm({ ...form, branchId: e.target.value })}
          >
            <option value="">Şube seç (opsiyonel)</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button
            size="sm"
            loading={loading}
            disabled={isDisabled}
            onClick={onSubmit}
          >
            Oluştur
          </Button>
        </div>
      </div>
    </div>
  );
}
