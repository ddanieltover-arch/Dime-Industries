// components/seo/json-ld-script.tsx
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function JsonLdScript({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
