export function SortSelect({ value }: { value?: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-muted-ink">
      <span className="hidden sm:inline">Sort by</span>
      <select
        name="sort"
        defaultValue={value ?? "newest"}
        onChange={(event) => event.currentTarget.form?.submit()}
        className="h-10 rounded-soft border border-sand-line bg-parchment px-3 text-sm text-ink outline-none focus:border-gold"
      >
        <option value="newest">Newest</option>
        <option value="popularity">Popular</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
