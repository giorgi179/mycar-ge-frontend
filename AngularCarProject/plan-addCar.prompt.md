## Plan: Fix add-car form alignment and design

TL;DR: Update `src/app/components/add-car/add-car.ts` and `add-car.html` so the form payload matches the backend POST `/api/Car/add-car` contract exactly, load option lists from backend metadata if available, and improve the add-car UI/UX and validation.

**Steps**
1. Add backend metadata support for form option lists.
   - Extend `src/app/services/add-car-services.ts` to include one or more GET endpoints for add-car options, preferably from `GET /api/Car/get-all-car-detals` or a backend metadata endpoint.
   - Create typed interfaces for received option data in `src/app/services/components.ts` or in the service file.
   - In `src/app/components/add-car/add-car.ts`, load metadata on component initialization and populate `manufacturerList`, `transmissionList`, `carColorList`, `interiorMaterialList`, and any other selectable lists.
   - Keep current hard-coded defaults as fallback if the backend endpoint is unavailable.

2. Align `AddCar` request payload with the backend contract.
   - In `src/app/components/add-car/add-car.ts`, remove or stop sending form-only fields that are not in the documented API: `saleType`, `carMonth`, `carCategory` if backend does not accept them, and `isTurbo` unless verified.
   - Ensure numeric fields map to correct backend types: use `number` controls for `carPrice`, `cylinders`, and `airbags`, and convert them to string when appending `FormData`.
   - Keep exact request keys: `City`, `CarAge`, `CarModel`, `CarPrice`, `CarType`, `FuelType`, `Manufacturer`, `Mileage`, `EngineVolume`, `Cylinders`, `Transmission`, `DriveType`, `Doors`, `Airbags`, `SteeringWheel`, `Color`, `InteriorColor`, `InteriorMaterial`, `IsExchangePossible`, `HasTechInspection`, `HasCatalyst`, `Description`, `UserPhone`, `VinCode`, `Images`.
   - Improve image upload validation: require at least one image and/or use the backend’s actual supported image count rather than hard-coding exactly 6.
   - Add clear error messages and reset `error` state when the user modifies fields.

3. Repair the step wizard and form UX.
   - Fix the step rail so displayed steps and actual step logic are consistent.
   - Improve step navigation button states and error display.
   - Ensure `formControlName` bindings and input types match control semantics; e.g. use `type="number"` where backend expects numeric values.
   - Make the photo picker show selected image count and allow image removal clearly.

4. Polish design details in `src/app/components/add-car/add-car.scss`.
   - Clean up responsive behavior for the sidebar rail and main form.
   - Improve input focus, visible field states, and step card spacing.
   - Make the add-by-VIN and step rail sections look consistent and less brittle on small screens.

5. Verify thoroughly.
   - Manually fill and submit the add-car form in the browser.
   - Confirm network request body matches the documented backend payload and that the endpoint returns success.
   - Check validation flows: required fields, image upload count, step switching.
   - Run the existing `add-car` unit spec and add a small test for initial form state if time allows.

**Relevant files**
- `src/app/components/add-car/add-car.ts` — request payload, step logic, form validation, image handling.
- `src/app/components/add-car/add-car.html` — form bindings, step UI, file upload and error display.
- `src/app/components/add-car/add-car.scss` — layout and styling improvements.
- `src/app/services/add-car-services.ts` — backend POST and optional frontend metadata service methods.
- `src/app/services/components.ts` — shared request interface definitions.

**Verification**
1. Confirm that the network request to POST `/api/Car/add-car` sends the documented field names and file parts in multipart/form-data.
2. Confirm the form no longer insists on exactly 6 images unless that is backend-mandated.
3. Confirm the add-car wizard steps are usable, labels match the current flow, and error states show only when expected.
4. Run the existing `add-car` component test and verify the component compiles.

**Decisions / assumptions**
- The user wants backend-driven options and contract alignment, so the plan prioritizes the actual POST payload over current UI-only fields.
- The backend currently documents no `saleType`, `carMonth`, `carCategory`, or `isTurbo` fields.
- If metadata endpoints are absent, the component will keep static lists while still aligning the payload.

**Further considerations**
1. Confirm whether `GET /api/Car/get-all-car-detals` returns option lists for front-end forms; if not, the backend must be extended later.
2. Confirm if the backend expects repeated `Images` fields or an array key name like `Images[]`; adjust `FormData` accordingly.
3. Decide whether the add-by-VIN quick-fill should be implemented now or remain a placeholder.
