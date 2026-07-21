"use client";

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
      {errors?.map((msg, i) => (
        <span key={`e${i}`} className="pdf-range-msg is-error" role="alert">
          {msg}
        </span>
      ))}
      {warnings?.map((msg, i) => (
        <span key={`w${i}`} className="pdf-range-msg is-warn" role="status">
          {msg}
        </span>
      ))}
    </div>
  );
}
