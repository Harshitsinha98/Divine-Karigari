"use client";

import { INDIA_STATES, citiesForState } from "@/lib/india-locations";

const selectClass =
  "h-12 w-full rounded-soft border border-sand-line bg-parchment px-3 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

/**
 * Cascading State → City dropdowns for Indian addresses.
 * When the state changes, the city is reset (unless it belongs to the new state).
 */
export function StateCitySelect({
  state,
  city,
  onStateChange,
  onCityChange,
  required = true,
}: {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
}) {
  const cities = state ? citiesForState(state) : [];

  return (
    <>
      <select
        required={required}
        value={state}
        onChange={(e) => {
          const nextState = e.target.value;
          onStateChange(nextState);
          // Reset city if it isn't valid for the newly selected state
          if (!citiesForState(nextState).includes(city)) onCityChange("");
        }}
        className={selectClass}
      >
        <option value="">Select state</option>
        {INDIA_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        required={required}
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        disabled={!state}
        className={`${selectClass} disabled:opacity-60`}
      >
        <option value="">
          {state ? "Select city" : "Select state first"}
        </option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </>
  );
}
