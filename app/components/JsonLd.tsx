/** 구조화 데이터(JSON-LD) 주입. 서버 컴포넌트에서 사용. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
