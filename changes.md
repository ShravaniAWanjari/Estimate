## New screen: Records

Add a **Records** tab (4th bottom tab) between Templates and Settings.

### `src/storage/records.js`

Same AsyncStorage pattern as estimates.

- `RECORDS_KEY = 'pc_records'`
- Record shape:

```js
{
  id,                // uuid
  savedAt,           // Date.now()
  clientName,
  productType,
  bulkQty,
  totalPerCopy,
  bulkTotal,
  estimateId,        // reference back to the estimate it came from
  paperTypes[]       // full snapshot — copy as-is from estimate, not a reference
}
```

- `getRecords()` — return array sorted by `savedAt` descending
- `saveRecord(record)` — push only, records are never upserted. Each save is a new entry even if same estimate.
- `deleteRecord(id)` — filter out

---

## Changes to `SummaryScreen.js`

**Save bulk qty change button** — when tapped, in addition to updating the estimate:

1. Build a record object from current state
2. Call `saveRecord(record)`
3. Show a brief inline confirmation: "Saved to records ✓"

Do not navigate away — user stays on summary.

---

## `screens/records/RecordListScreen.js`

### Grouping logic

After loading all records, group them by `clientName`. Build a structure like:

```js
[
  {
    clientName: "ABC Publishers",
    records: [
      { productType: "Diary", bulkQty: 500, bulkTotal, savedAt, ... },
      { productType: "Magazine", bulkQty: 200, bulkTotal, savedAt, ... }
    ]
  },
  ...
]
```

Sort groups alphabetically by `clientName`. Within each group, sort records by `savedAt` descending.

### Rendering

Use a `SectionList` with `sections={groupedData}`, where each section is one client.

**Section header** — client name in bold, slightly larger text, background slightly off-white so it visually separates groups. Sticky headers enabled (`stickySectionHeadersEnabled={true}`).

**Each record row** — inside a card:

- Row 1: product type tag (pill, same colour style as prototype) on the left + date on the right
- Row 2: `₹X per copy · Qty: X · Total: ₹X`

Long press → `DeleteModal` → `deleteRecord(id)` → refresh.

---

## Changes to `SummaryScreen.js` — product type tag position

On the summary screen header area, change the layout:

- Product type tag moves to the **left**, immediately before the paper type section heading — not top right
- Tag should be larger: font size 14 (up from 11–12), padding `6px 12px`
- Client name stays as the main screen title

Apply the same tag style change to the record rows in `RecordListScreen`.

---

## Changes to `EstimateFormScreen.js` — client name field

Replace the plain `TextInput` for client name with a custom autocomplete component.

### `components/ClientNameInput.js`

Props: `value`, `onChange`, `style`

**Behaviour:**

On mount — load all estimates from storage, extract unique `clientName` values, deduplicate, sort alphabetically. Store as `savedClients[]` in local state.

Also load from records storage — merge and deduplicate client names from both estimates and records so the dropdown is always complete.

As user types — filter `savedClients` where name includes typed string (case-insensitive).

**Dropdown rendering:**

- Show dropdown below the input as an absolutely positioned `View` with `zIndex: 999` and a shadow
- If filtered list has results — render each as a tappable row. Tapping sets `value` to that name and closes dropdown.
- If filtered list is empty AND user has typed at least 1 character — show a single row: `＋ Add "typed name"`. Tapping this sets `value` to typed string and closes dropdown. This is not a separate action — it just confirms the new name.
- If input is empty — show full `savedClients` list as suggestions
- Dropdown closes when: item tapped, `＋ Add` tapped, input loses focus (use `onBlur` with a 150ms delay so tap registers before blur fires)

**Do not use any third-party autocomplete library** — build it with `TextInput`, `ScrollView` or `FlatList` inside an absolutely positioned `View`.

Wrap the parent container in `position: 'relative'` and ensure the dropdown renders above sibling form elements using `zIndex`.

---

## Grouping in `EstimateListScreen.js`

Apply the same grouping logic as Records — group estimates by `clientName`, render as `SectionList` with sticky client name headers. Same visual style — off-white header, alphabetical groups, records within each group sorted by `updatedAt` descending.

---

## Build order additions

Insert these steps after step 10 in the existing build order:

- 10a. `ClientNameInput` component — test autocomplete and add-new flow independently before wiring into EstimateForm
- 10b. `records.js` storage — test save and load
- 10c. Wire record save into `SummaryScreen` save button
- 10d. `RecordListScreen` with grouping — test with manually seeded data first
- 10e. Apply SectionList grouping to `EstimateListScreen`
- 10f. Fix tag size and position on Summary and Records screens

---
