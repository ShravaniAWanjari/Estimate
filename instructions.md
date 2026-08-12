Here's your complete build plan.

---

## Project setup

Bootstrap with `npx create-expo-app PaperCost --template blank` then install:

```
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-uuid
```

---

## Folder structure

```
src/
  storage/
    keys.js
    estimates.js
    templates.js
    lastUsed.js
    settings.js
  utils/
    formula.js
    sizes.js
  screens/
    estimates/
      EstimateListScreen.js
      EstimateFormScreen.js
      PaperTypeFormScreen.js
      SummaryScreen.js
    templates/
      TemplateListScreen.js
      TemplateFormScreen.js
    settings/
      SettingsScreen.js
  components/
    PriceField.js
    SizeSelector.js
    FieldRow.js
    EmptyState.js
    DeleteModal.js
  navigation/
    AppNavigator.js
    EstimateStack.js
    TemplateStack.js
App.js
```

---

## `src/utils/sizes.js`

Export a constant `STANDARD_SIZES` object:

```js
{ A3: [0.420, 0.297], A4: [0.297, 0.210], A5: [0.210, 0.148],
  A6: [0.148, 0.105], B4: [0.353, 0.250], B5: [0.250, 0.176],
  Letter: [0.279, 0.216], Custom: null }
```

Export a helper `getArea(sizeKey, customW, customH)` — if sizeKey is Custom, return `(customW/100) * (customH/100)`, else return product of the two values from STANDARD_SIZES. Return `null` if any value is missing.

---

## `src/utils/formula.js`

Export `calcPaperCost({ gsm, area, pricePerKg, sheets })`:

```
sheetWeightKg = gsm * area / 1000
return sheetWeightKg * sheets * pricePerKg
```

Export `calcTotalPerCopy({ paperCost, printCost, bindCost })`:

```
return paperCost + (printCost || 0) + (bindCost || 0)
```

Export `calcBulkTotal(totalPerCopy, qty)`:

```
return totalPerCopy * qty
```

---

## `src/storage/keys.js`

Export string constants:

- `ESTIMATES_KEY = 'pc_estimates'`
- `TEMPLATES_KEY = 'pc_templates'`
- `LAST_USED_KEY = 'pc_last_used'`
- `SETTINGS_KEY = 'pc_settings'`

---

## `src/storage/estimates.js`

All functions are async, use AsyncStorage, parse/stringify JSON, default to empty array `[]` if null.

- `getEstimates()` — return array sorted by `createdAt` descending
- `saveEstimate(estimate)` — fetch array, find by `estimate.id`, if found replace it, if not push it, save back. Estimate shape: `{ id, createdAt, updatedAt, clientName, productType, bulkQty, paperTypes[], totalPerCopy, bulkTotal }`
- `deleteEstimate(id)` — filter out by id, save back

---

## `src/storage/templates.js`

Same pattern as estimates.

- `getTemplates()` — return array sorted by name alphabetically
- `saveTemplate(template)` — upsert by id. Template shape: `{ id, name, gsm, sizeKey, customW, customH, sheets, printCost, bindCost, note }`. No price field.
- `deleteTemplate(id)` — filter out

---

## `src/storage/lastUsed.js`

Stored as a single object keyed by template id. For manual entries (no template), use the key `"manual"`.

- `getLastUsed()` — return full object or `{}`
- `getLastUsedForKey(key)` — return `obj[key] || null`
- `setLastUsedForKey(key, values)` — fetch object, set `obj[key] = values`, save back. Values shape: `{ price, gsm, sizeKey, customW, customH, sheets, printCost, bindCost }`

---

## `src/storage/settings.js`

- `getSettings()` — return object or defaults: `{ defaultBulkQty: 100 }`
- `saveSettings(settings)` — overwrite

---

## Navigation — `src/navigation/AppNavigator.js`

Bottom tab navigator with three tabs: **Estimates**, **Templates**, **Settings**. Use stack navigators inside Estimates and Templates tabs.

### `EstimateStack.js`

Stack with screens:

- `EstimateList` (index screen)
- `EstimateForm` (params: `{ estimateId? }` — if present, load and edit that estimate)
- `PaperTypeForm` (params: `{ paperType?, index?, onSave callback }`)
- `Summary` (params: `{ estimateId }`)

### `TemplateStack.js`

Stack with screens:

- `TemplateList`
- `TemplateForm` (params: `{ templateId? }`)

---

## `screens/estimates/EstimateListScreen.js`

On mount, load all estimates from storage. Display as FlatList. Each row shows: client name, product type, total per copy (₹), date. Tapping a row navigates to `EstimateForm` with that `estimateId`. Header right button: `+` navigates to `EstimateForm` with no params (new estimate).

Show `EmptyState` component if list is empty.

Swipe-to-delete or long-press opens `DeleteModal`. On confirm, call `deleteEstimate(id)` and refresh list.

---

## `screens/estimates/EstimateFormScreen.js`

This screen handles both new and edit.

**On mount:**

- If `estimateId` param exists, load that estimate from storage and populate all fields
- If new, load `settings` to pre-fill `bulkQty` with `defaultBulkQty`

**State:** `clientName`, `productType`, `bulkQty`, `paperTypes[]`

**productType** is a picker with options: Diary, Magazine, Book, Brochure, Notebook, Other.

**Paper types list** — render each as a summary card showing: name, GSM, size, sheets, price per kg, per-copy cost. Each card has an Edit button (navigate to `PaperTypeForm`) and a Delete button.

**Add paper type button** — navigates to `PaperTypeForm` with no params. When `PaperTypeForm` calls `onSave(paperType)`, append to `paperTypes[]`.

**Calculate button** — validate: clientName required, at least one paper type. Then compute `totalPerCopy` by summing all `paperType.totalPerCopy`. Compute `bulkTotal = totalPerCopy * bulkQty`. Build estimate object with `uuid()` as id (or existing id if editing), `createdAt` (existing or `Date.now()`), `updatedAt: Date.now()`. Call `saveEstimate()`. Navigate to `Summary` with `estimateId`.

---

## `screens/estimates/PaperTypeFormScreen.js`

This is the most complex screen. Handle both add and edit.

**On mount logic (field pre-fill priority):**

1. If editing an existing paper type — populate all fields from that paper type's saved values
2. If adding new — for each field, check `lastUsed["manual"]` and pre-fill if present
3. All pre-filled values are shown as editable — user sees the value, can tap to change

**State:** `name`, `templateId` (null if manual), `gsm`, `sizeKey`, `customW`, `customH`, `sheets`, `price`, `printCost`, `bindCost`, `note`

**"Use template" button at top** — opens a modal listing all saved templates. Tapping one:

- Sets `templateId` to that template's id
- Fills `gsm`, `sizeKey`, `customW`, `customH`, `sheets`, `printCost`, `bindCost`, `note` from the template
- For `price`: check `lastUsed[templateId]`, if exists show it pre-filled, else leave empty
- Does NOT lock any field — all remain editable

**"Clear template" button** — sets `templateId` to null, loads `lastUsed["manual"]` into fields

**`PriceField` component** — see components section

**`SizeSelector` component** — see components section

**On save:**

- Validate: name, gsm, sheets, price, size all required
- Compute `area = getArea(sizeKey, customW, customH)`
- Compute `paperCost = calcPaperCost({ gsm, area, pricePerKg: price, sheets })`
- Compute `totalPerCopy = calcTotalPerCopy({ paperCost, printCost, bindCost })`
- Build paper type object: `{ name, templateId, gsm, sizeKey, customW, customH, sheets, price, printCost, bindCost, note, area, paperCost, totalPerCopy }`
- Update lastUsed: call `setLastUsedForKey(templateId || "manual", { price, gsm, sizeKey, customW, customH, sheets, printCost, bindCost })`
- Call `onSave(paperType)` from params and go back

---

## `components/PriceField.js`

Props: `value`, `onChange`, `lastUsedPrice`

Renders a numeric TextInput for price. If `lastUsedPrice` exists and `value` is empty, show a chip below the input: `Last used: ₹XX — tap to use`. Tapping chip sets `value` to `lastUsedPrice` via `onChange`. When user types in the field, clear chip highlight.

---

## `components/SizeSelector.js`

Props: `sizeKey`, `customW`, `customH`, `onSizeChange`, `onCustomWChange`, `onCustomHChange`

Renders a horizontal scrollable row of size option chips (A3, A4, A5, A6, B4, B5, Letter, Custom). Selected chip is filled/highlighted. If `Custom` is selected, show two TextInputs below for width and height in cm.

---

## `screens/estimates/SummaryScreen.js`

Load estimate from storage by `estimateId`.

Display:

- Client name + product type as header
- Each paper type as a card: name, GSM, size, sheets, price/kg, paper cost, print cost, bind cost, **total per copy for this type**
- Divider then **total per copy** (sum of all types)
- Bulk section: editable number input pre-filled with `estimate.bulkQty`. On change, recompute `bulkTotal = totalPerCopy * newQty` live. Show `bulkTotal` in large text.
- **Save bulk qty change button** — updates the estimate in storage with new `bulkQty` and `bulkTotal`

Header right button: **Edit** — navigate back to `EstimateForm` with `estimateId`.

---

## `screens/templates/TemplateListScreen.js`

FlatList of templates. Each row: template name, GSM, size. Tap to edit (navigate to `TemplateForm` with `templateId`). Header `+` button for new template. Long press / swipe to delete via `DeleteModal`.

---

## `screens/templates/TemplateFormScreen.js`

Fields: `name` (required), `gsm`, `sizeKey`, `customW`, `customH`, `sheets`, `printCost`, `bindCost`, `note`. No price field — price is never stored in templates.

Use `SizeSelector` component for size. On save: upsert via `saveTemplate()`. Go back.

---

## `screens/settings/SettingsScreen.js`

Single field: **Default bulk quantity** — numeric input. On blur or save button, call `saveSettings()`. Show a saved confirmation.

---

## `components/EmptyState.js`

Props: `icon`, `title`, `subtitle`. Centered layout, muted text. Used on empty list screens.

---

## `components/DeleteModal.js`

Props: `visible`, `itemName`, `onConfirm`, `onCancel`. A Modal with a single confirm/cancel prompt. "Delete `itemName`?" with red confirm button.

---

## `components/FieldRow.js`

Props: `label`, `children`. Renders a label above the child input. Consistent spacing throughout the app — use this everywhere instead of inline label+input pairs.

---

## Styling rules

- No third-party UI library
- All styles via `StyleSheet.create`
- Consistent spacing scale: 8, 12, 16, 20, 24
- Colors: one primary (dark, for buttons/active states), one danger (red, for delete), greys for labels/borders
- Font sizes: 12 label, 14 body, 16 input, 18 section header, 22 screen title
- All inputs: same height (44px), same border, same border-radius (8px)
- Cards: white background, 1px border, 8px radius, 12px padding
- Bottom safe area inset on all scrollable screens

---

## Build order

Build in this exact sequence — each step is testable before the next:

1. `sizes.js` + `formula.js` — test the math in isolation
2. `keys.js` + all storage files — test read/write in a scratch component
3. `AppNavigator` with placeholder screens — confirm tab and stack nav works
4. `TemplateFormScreen` + `TemplateListScreen` — templates are simplest, no formula
5. `SettingsScreen`
6. `PriceField` + `SizeSelector` + `FieldRow` components
7. `PaperTypeFormScreen` — hardest screen, build and test standalone
8. `EstimateFormScreen` — wire up PaperTypeForm via navigation
9. `SummaryScreen`
10. `EstimateListScreen`
11. `EmptyState` + `DeleteModal` — plug into all list screens
12. End-to-end test: create template → create estimate using that template → edit estimate → check lastUsed populates on second estimate

---

That's the complete plan. Hand this to a dev or follow it yourself — every screen, every data flow, every component is specified. Start with step 1 and don't skip the build order.
