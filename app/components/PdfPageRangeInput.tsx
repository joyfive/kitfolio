"use client";

import { useToastOnChange } from "../lib/toast";

/** 페이지 범위 입력 (예: 1-3, 4-7, 8). 검증/파싱은 부모가 담당하고
 *  여기서는 입력과 오류/경고 문구 표시만 한다. */
export default function PdfPageRangeInput({
  value,
  onChange,
  label,
  placeholder,
  example,
  errors,
  warnings,
  id = "pdf-range",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  example?: string;
  errors?: string[];
  warnings?: string[];
  id?: string;
}) {
  const invalid = (errors?.length ?? 0) > 0;
  // 입력 오류·경고는 필드 아래에 그리지 않고 토스트로 알린다
  useToastOnChange(errors?.[0], "error");
  useToastOnChange(warnings?.[0], "warning");
  return (
    <div className="pdf-range">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={"pdf-range-in" + (invalid ? " is-invalid" : "")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        aria-invalid={invalid}
        autoComplete="off"
        spellCheck={false}
      />
      {example && <span className="pdf-range-example">{example}</span>}
    </div>
  );
}
