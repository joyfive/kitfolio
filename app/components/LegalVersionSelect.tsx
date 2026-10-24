"use client";

import { useRouter } from "next/navigation";

/** 약관·개인정보처리방침 개정일자 드롭다운. 고르면 해당 버전 페이지로 이동한다.
 *  JS 없이도 하단 개정 이력 링크로 같은 페이지에 갈 수 있다. */
export default function LegalVersionSelect({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: { id: string; text: string; href: string }[];
}) {
  const router = useRouter();
  return (
    <label className="legal-version">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const o = options.find((x) => x.id === e.target.value);
          if (o) router.push(o.href);
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.text}
          </option>
        ))}
      </select>
    </label>
  );
}
