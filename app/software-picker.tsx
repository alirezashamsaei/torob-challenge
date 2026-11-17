"use client";

import React, { useId, useState } from "react";
import { searchRequirements, type Requirement } from "./requirements";

export type PickerClassNames = {
  root?: string;
  search?: string;
  list?: string;
  option?: string;
  latin?: string;
  empty?: string;
};

type Props = {
  catalog: readonly Requirement[];
  label: string;
  selectedId?: string;
  classNames?: PickerClassNames;
  onPick: (id: string) => void;
};

export default function SoftwarePicker({ catalog, label, selectedId, classNames = {}, onPick }: Props) {
  const [query, setQuery] = useState("");
  const results = searchRequirements(catalog, query);
  const listId = useId();

  return (
    <div className={classNames.root}>
      <input
        aria-controls={listId}
        aria-label={label}
        autoComplete="off"
        className={classNames.search}
        dir="auto"
        placeholder={label}
        spellCheck={false}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {results.length === 0 && (
        <p className={classNames.empty} role="status">نتیجه‌ای پیدا نشد. املای دیگری را امتحان کنید.</p>
      )}
      <ul key={query} className={classNames.list} id={listId}>
        {results.map((item) => (
          <li key={item.id}>
            <button
              aria-pressed={item.id === selectedId}
              className={classNames.option}
              type="button"
              onClick={() => onPick(item.id)}
            >
              <span>{item.label}</span>
              <bdi className={classNames.latin}>{item.latin}</bdi>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
