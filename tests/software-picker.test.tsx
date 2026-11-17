import "./setup-dom.ts";

import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import SoftwarePicker from "../app/software-picker.tsx";
import { softwareCatalog } from "../app/requirements.ts";

afterEach(cleanup);

function renderPicker(onPick: (id: string) => void = () => {}, selectedId?: string) {
  return render(
    <SoftwarePicker
      catalog={softwareCatalog}
      label="جست‌وجوی بازی یا نرم‌افزار"
      selectedId={selectedId}
      onPick={onPick}
    />,
  );
}

test("typing narrows the list to matching software", () => {
  renderPicker();
  assert.equal(screen.getAllByRole("button").length, softwareCatalog.length);

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "photo" } });

  assert.equal(screen.getAllByRole("button").length, 1);
  assert.ok(screen.getByRole("button", { name: /Adobe Photoshop/ }));
  assert.equal(screen.queryByRole("button", { name: /Blender/ }), null);
});

test("search matches Persian names as well as Latin ones", () => {
  renderPicker();
  const search = screen.getByRole("searchbox");

  fireEvent.change(search, { target: { value: "فتوشاپ" } });
  assert.ok(screen.getByRole("button", { name: /فتوشاپ/ }));

  fireEvent.change(search, { target: { value: "blender" } });
  assert.ok(screen.getByRole("button", { name: /بلندر/ }));
});

test("an unmatched search says so instead of showing a stale list", () => {
  renderPicker();

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzz" } });

  assert.equal(screen.queryAllByRole("button").length, 0);
  assert.ok(screen.getByRole("status"));
});

test("choosing a result reports its id and marks the current choice", () => {
  const picked: string[] = [];
  renderPicker((id) => picked.push(id), "photoshop");

  const photoshop = screen.getByRole("button", { name: /Adobe Photoshop/ });
  assert.equal(photoshop.getAttribute("aria-pressed"), "true");

  fireEvent.click(screen.getByRole("button", { name: /بلندر/ }));
  assert.deepEqual(picked, ["blender"]);
});
