export function ErrorsHandling({ error }: { readonly error: string }) {
  if (!error) return null;
  return <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</div>;
}

export function ErrorsZod({ error }: { error: string[] }) {
  if (!error) return null;
  return error.map((err: string, index: number) => (
    <div key={index} className="mt-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
      {err}
    </div>
  ));
}
