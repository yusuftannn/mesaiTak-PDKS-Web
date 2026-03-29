"use client";

import { useState, useRef, useEffect } from "react";
import { GroupTag } from "@/features/group-tags/group-tags.types";
import TagChip from "./TagChip";

type Props = {
  userTags: string[];
  tags: GroupTag[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

export default function MultiTagSelect({
  userTags,
  tags,
  onChange,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTag = (tagId: string) => {
    if (disabled) return; // ekstra güvenlik

    let values = [...userTags];

    if (values.includes(tagId)) {
      values = values.filter((v) => v !== tagId);
    } else {
      values.push(tagId);
    }

    onChange(values);
  };

  const selectedTags = tags.filter((t) => userTags?.includes(t.id));

  return (
    <div ref={containerRef} className="relative w-[220px]">
      <div
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={`
          border rounded px-2 py-1 flex flex-wrap gap-1
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"}
        `}
      >
        {selectedTags.length === 0 && (
          <span className="text-gray-400 text-sm">
            {disabled ? "Önce etiket oluşturunuz" : "Etiket seç"}
          </span>
        )}

        {selectedTags.map((tag) => (
          <TagChip key={tag.id} label={tag.name} />
        ))}
      </div>

      {open && !disabled && (
        <div className="absolute z-50 bg-white border rounded mt-1 w-full shadow">
          {tags.map((tag) => {
            const checked = userTags?.includes(tag.id);

            return (
              <label
                key={tag.id}
                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTag(tag.id)}
                />

                {tag.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
