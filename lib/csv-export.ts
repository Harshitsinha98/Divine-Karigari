const cell = (value: unknown) => {
  const text =
    value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function toCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\n");
}

export function csvResponse(filename: string, csv: string) {
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
