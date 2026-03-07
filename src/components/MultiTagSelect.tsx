"use client";

import { useState, useRef, useEffect } from "react";
import { GroupTag } from "@/types/groupTag";
import TagChip from "./TagChip";

export default function MultiTagSelect({
  userTags,
  tags,
  onChange,
}: {
  userTags: string[];
  tags: GroupTag[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

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
        onClick={() => setOpen((v) => !v)}
        className="border rounded px-2 py-1 flex flex-wrap gap-1 cursor-pointer bg-white"
      >
        {selectedTags.length === 0 && (
          <span className="text-gray-400 text-sm">Etiket seç</span>
        )}

        {selectedTags.map((tag) => (
          <TagChip key={tag.id} label={tag.name} />
        ))}
      </div>

      {open && (
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
