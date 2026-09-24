# Step 4 · Forms

Build the 3 forms in GHL's form builder, field by field, exactly as [spec/forms.md](../spec/forms.md) lists them. Then record their ids and share links.

| | |
|---|---|
| **Owner** | The AI session, in the operator's browser (the operator is logged in to GHL) |
| **Time** | 30 minutes in the first build |
| **Needs** | Step 3 done: the custom fields exist, so the forms can write to them |
| **Makes** | `Refer a Client`, `Partner Sign-Up` and `Staff Attribution`, with their ids in the config and their share links in the build record |
| **Done when** | `double-check.js` passes the 3 forms, and their ids are in the config |

| Form | Who fills it | What it does |
|---|---|---|
| `Refer a Client` (`<REFER_FORM_ID>`) | A partner, from their personal link | Registers a client they refer. Three **hidden** fields fill from the link: `Claimed Partner ID` (query key `claimed_partner_id`), `Claimed Partner Name` (`claimed_partner_name`) and `Claimed Referral Code` (`am_id`) |
| `Partner Sign-Up` (`<SIGNUP_FORM_ID>`) | A new partner, on the Become a Partner page | Signs them up as a partner |
| `Staff Attribution` (`<STAFF_FORM_ID>`) | The client's staff only | Logs a referral that came by an email introduction, a call or a walk-in. The claim fields are visible, and staff type them |

**Why the forms write only to "Claimed ..." fields.** A GHL form overwrites contact fields the moment it is submitted, before any workflow runs. If a form wrote the real credit fields, a second partner registering the same client would silently take the credit. So the forms write to staging fields, and a workflow copies a claim across only when it is the first claim (step 5).

A **hidden field** is on the form but not shown. It takes its value from the URL parameter named in its **Query Key**. So `...?claimed_partner_id=abc` fills `Claimed Partner ID` with `abc`.

## 4.1 · Before you start

1. Read [spec/forms.md](../spec/forms.md) in full.
   **Check:** you know each form's fields in order, and each field's label, type, custom field, required, hidden and query key.
2. Read the "Browser and window" and "Forms" tables in [ghl-traps.md](ghl-traps.md).
   **Check:** you know to take a screenshot right before every click.
3. Confirm the GHL window is on screen, side by side with the chat, and the operator is logged in to the client's sub-account.
   **Check:** a screenshot shows the client's sub-account name at the top of the left menu.

## 4.2 · How to build one form

Use these actions for each of the 3 forms, in the order of section 4.3. The screens are the ones [spec/forms.md](../spec/forms.md) records ("What every form shares"); where the first build did not record a screen, the action says "Confirm:".

1. In the left menu, click **Sites**, then **Forms** at the top, then the **Builder** tab.
   **Check:** the list of forms shows. It may be empty.
2. Click **Create form**, then **Start from Scratch**, then **Create**. Not a template.
   **Check:** the form builder opens on a form named "Form 0", which already holds First Name, Last Name, Phone, Email, two SMS consent checkboxes, a Submit button and "Privacy Policy | Terms of Service" links. The address bar ends in `/form-builder-v2/<FORM_ID>`.
3. Rename the form: click its name at the top of the builder, type the exact name from the spec, and press Enter.
   **Check:** the name shows exactly as in the spec, with the same capitals and hyphen. Confirm: where the name is edited; the first build recorded only that the form starts as "Form 0". If clicking the name does nothing, look for a pencil beside it.
4. Copy the `<FORM_ID>` from the address bar into the build record, next to the form's name.
   **Check:** the id in the build record matches the address bar.
5. Delete what the spec does not keep: both SMS consent checkboxes, and the "Privacy Policy | Terms of Service" links. Click each one, then its trash icon.
   **Check:** the form holds First Name, Last Name, Phone, Email and Submit, and nothing else.
6. Add the spec's next row that the form does not hold yet. Where it comes from:
   - A **standard element** (`Organization`, `Website`, and in the homeowner change `Address`): the builder's **Quick Add** tab. Drag its tile onto the form, below the row before it in the spec. Clicking a tile does nothing.
   - A **custom field**: the **Add Object Fields** tab, object **Contact**, folder **ADDITIONAL INFO**. Search its exact name, tick it (you can tick several rows in a row), then click **Add N fields**.
   **Check:** the field is on the form, with the spec's exact name.
7. Put the field in the spec's position. Custom fields land **below Submit**: when all of them are in, delete that Submit and drag a fresh **Submit** from Quick Add to the bottom.
   **Check:** a screenshot shows the rows in the spec's order, with Submit last.
8. Click the field, then its gear icon → **General Settings**. Set **Label**, **Label Alignment**, **Placeholder**, **Short Label**, **Query Key**, **Field Width**, **Required** and **Hidden** exactly as the spec's row says (Short Label empty, Label Alignment top). Leave anything the spec does not list at GHL's default. Do this for the four rows the form started with too.
   **Check:** the settings panel shows each value as in the spec.
9. Repeat actions 6 to 8 for every other row in the spec's table, in order.
   **Check:** the form's fields match the spec's table: same count, same order, Submit last.
10. Check the form-level settings against the spec's table ("Form-level settings"): all of them are what Start from Scratch gives, so normally nothing changes. Do not open the builder's **Settings** and **Notifications** tabs: the first build never did.
    **Check:** each setting matches the spec. Any text a partner or client reads (the button, the thank-you message) is marked **DRAFT** in the spec: list it in the build record under "Copy waiting for approval".
11. Click **Save** at the top right.
    **Check:** the yellow dot beside Save is gone. A yellow dot means unsaved changes.

## 4.3 · Build the three forms

1. Build `Refer a Client` with section 4.2, from [spec/forms.md](../spec/forms.md).
   **Check:** the form is saved, with every field in the spec.
2. On `Refer a Client`, open each of the three hidden fields with its gear icon, one at a time: `Claimed Partner ID`, `Claimed Partner Name`, `Claimed Referral Code`.
   **Check:** each has **Hidden** on, and its **Query Key** is exactly `claimed_partner_id`, `claimed_partner_name` and `am_id`, in lowercase with underscores.
3. Build `Partner Sign-Up` with section 4.2.
   **Check:** the form is saved, with every field in the spec.
4. Build `Staff Attribution` with section 4.2.
   **Check:** the form is saved. Its claim fields are visible, not hidden, as the spec says.

## 4.4 · Record the ids and the share links

1. Run `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids` and paste the whole block into the config as `"ids"`, replacing the old block.
   **Check:** `ids.forms` holds 3 ids, and each matches the id you wrote down from the address bar. If the token cannot read forms, type the 3 ids into `ids.forms` by hand, under the exact form names.
2. Write each form's share link into the build record: `https://api.leadconnectorhq.com/widget/form/<FORM_ID>`.
   **Check:** 3 links, one per form, each with its own id.
3. Open each share link in a new browser tab.
   **Check:** each form loads and shows only its visible fields. **Do not submit it.** Public forms carry Cloudflare's bot check (Turnstile), which you never work around. Step 8 stands in for the forms with `tools/ghl/enroll.js`.
4. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** `PASS` on the 3 forms, and still `PASS` on everything from step 3.
5. Add a log line to the build record: `YYYY-MM-DD HH:MM · Step 4 done · 3 forms`, with the 3 ids.
   **Check:** the line is in the log.

## If a step fails

- **A custom field is not in Add Object Fields.** Check the object is **Contact** and the folder **ADDITIONAL INFO**, and search its exact name. If it is still missing, step 3 did not build it: run the double-check and fix step 3 first.
- **The custom fields landed below Submit.** Expected. Delete that Submit and drag a fresh one from Quick Add to the bottom (action 7).
- **Clicking a Quick Add tile does nothing.** Expected: drag it onto the form.
- **You cannot see the whole form while editing.** A side panel covers part of it. Close the panel, or scroll the form. Confirm: the panel's close button; the first build did not record it.
- **The yellow dot does not go away.** Click **Save** again and wait 5 to 8 seconds; the screen lags behind. Reloading the page drops unsaved changes.
- **A setting will not take** (a toggle, a dropdown). See the "Browser and window" table in [ghl-traps.md](ghl-traps.md): take a fresh screenshot, and check the window is visible.
- **The share link shows "Please complete the challenge".** That is the bot check. It is expected for an automated browser. Never work around it.
- **The double-check fails a form as "found 2 times".** Two forms have the same name. Do not delete either one: tell the operator which ids exist, and let them decide.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 4.<N>: <what happened>. Need from you: <one thing>.` Then wait.
