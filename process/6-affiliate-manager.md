# Step 6 · The Affiliate Manager

Set up GHL's Affiliate Manager: the campaign, the two steps that make each new partner an affiliate, the Affiliate Link workflow, the `am_id` on the Refer a Client form, the step that files each first-claim lead under its partner, and the Become a Partner page.

| | |
|---|---|
| **Owner** | The AI session, in the operator's browser, with the GHL window **visible on screen** the whole time |
| **Time** | About 1.5 hours in the first build |
| **Needs** | Step 5 done: workflows 2, 3 and 4 published |
| **Makes** | The campaign `<PROGRAM_NAME>`; workflow 5 `Referral Engine - Affiliate Link`; new steps in workflows 2, 3 and 4; the funnel `<PROGRAM_NAME>` with its `Become a Partner` page, saved but not published |
| **Done when** | `double-check.js` passes all 8 workflows (7 without Instantly), the campaign is published, and the page is saved |

**What the Affiliate Manager adds.** Every partner gets a profile in **Marketing → Affiliate Manager**, a login to GHL's partner portal, and one link. Every client they register shows up under them. The referral engine from step 5 keeps doing the credit and the commission.

**One link carries both ids.** GHL's affiliate link ends in `?am_id=<the partner's Referral ID>`. The Affiliate Link workflow adds our own `claimed_partner_id` and `claimed_partner_name` to it. So first-claim-wins keeps working, and the lead is filed under the right partner by **custom mapping** on the `am_id`.

**What it cannot do without Stripe.** A campaign that leads to a form holds no sales. Pay Per Sale is greyed out, and **Add Manual Commission** offers no campaign. So partners see their leads in the portal, not their earnings. The commission stays in the Referred Leads cycle, and a person pays partners. Showing commissions in the portal needs the client's Stripe plus a sales campaign with a percentage commission. That is not in v1.

The exact settings are in [spec/affiliate-manager.md](../spec/affiliate-manager.md) and [spec/workflows/5-affiliate-link.md](../spec/workflows/5-affiliate-link.md).

## 6.1 · Before you start

1. Ask the operator to put the GHL window and the chat app side by side, and to leave them so for this whole step. On Windows: Win + ← on one window, Win + → on the other.
   **Check:** in Chrome, `document.visibilityState` returns `"visible"` (run it with the JavaScript tool), or the operator confirms both windows are on screen. A covered window reports `"hidden"`, and then GHL's Affiliate Manager stops drawing and ignores dropdown clicks. This cost about an hour in the first build.
2. Read [spec/affiliate-manager.md](../spec/affiliate-manager.md) in full, and the "Affiliate Manager" and "Funnels and pages" tables in [ghl-traps.md](ghl-traps.md).
   **Check:** you know the campaign's settings and the page's layout.

## 6.2 · The campaign

1. In the left menu, click **Marketing**, then **Affiliate Manager**.
   **Check:** the Affiliate Manager opens, with a **Campaign** tab.
2. Open the **Campaign** tab and click **Add**.
   **Check:** a wizard opens with three tabs: **Campaign Details**, **Set Commission**, **Assign Affiliate**.
3. On **Campaign Details**, type the campaign name `<PROGRAM_NAME>`.
   **Check:** the name matches the blueprint's section 8 exactly.
4. Under "Choose Where Your Affiliate Links Should Lead", pick **Forms**.
   **Check:** Forms is selected.
5. Under "Pick the Form You Want to Promote", pick `Refer a Client`.
   **Check:** `Refer a Client` shows as the chosen form.
6. Under "Unique Tracking", pick `?am_id`.
   **Check:** `?am_id` is selected.
7. Go to the **Set Commission** tab. Under "Set Up Reward", pick **Pay Per Lead**.
   **Check:** Pay Per Lead is selected. Pay Per Sale is greyed out for a form campaign: that is expected.
8. Leave "Default Commission Value (Per Lead)" **off**, unless [spec/variants.md](../spec/variants.md) says otherwise for the blueprint's variant. Do not touch Advanced Commission Settings.
   **Check:** the per-lead amount is off (or set as the variant says).
9. Go to the **Assign Affiliate** tab. Assign no affiliate.
   **Check:** no affiliate is listed.
10. Under Additional Settings, turn **Send affiliate email notification** on, with the **Default Template**. This is GHL's own invite email: it gives each new partner their portal login.
    **Check:** the toggle is on and Default Template is picked.
11. Set the cookie life to `365` days.
    **Check:** it reads 365 days.
12. Open the Payout Terms list and write every option it shows into the build record (the first build saw only `Net-15`). Then pick the blueprint's terms (`Net-15` unless the blueprint says otherwise; the mapping rule is in [spec/affiliate-manager.md](../spec/affiliate-manager.md), section 2, "Payout Terms").
    **Check:** it matches the blueprint's section 2, and the list's options are in the build record. If the blueprint's option is not in the list, stop and ask the operator.
13. Open **Finish ▾** and click **Publish now**.
    **Check:** the campaign list shows `<PROGRAM_NAME>` as published. If the click does nothing, the window is hidden: go back to 6.1, action 1.
14. Write the campaign's name, its settings and the date into the build record.
    **Check:** the entry is in the build record.

## 6.3 · Partner Sign-Up: make each new partner an affiliate

1. Open `Referral Engine - Partner Sign-Up` from the workflows list (**Automation → Workflows**, then click its name).
   **Check:** the canvas shows its steps, and the zoom is 100%.
2. Click the **+** under the last step, search `affiliate`, and click **Add to affiliate manager**. Give it the Action Name from [spec/workflows/4-partner-sign-up.md](../spec/workflows/4-partner-sign-up.md), set any field the spec lists, and click **Save action**.
   **Check:** the new box is now the last box on the canvas, under the step that was last before.
3. Click the **+** under it, search `affiliate`, and click **Add to affiliate campaign**. Pick the campaign `<PROGRAM_NAME>`, give it the spec's Action Name, and click **Save action**.
   **Check:** the box shows under **Add to affiliate manager**, with the campaign named.
4. Click the header **Save**.
   **Check:** the message "Saved! Workflow has been saved." appears. The double-check shows the workflow `published`, with a higher version than before.

## 6.4 · Workflow 5: Referral Engine - Affiliate Link

Spec: [5-affiliate-link.md](../spec/workflows/5-affiliate-link.md). It runs when a partner joins the campaign. It writes the partner's one link into `Affiliate Link` (GHL's link plus our Partner ID and name) and their Referral ID into `Referral Code`. It overwrites the first link that Partner Sign-Up wrote, which has no `am_id`.

1. Create the workflow with [5-workflows.md](5-workflows.md) section 5.2, actions 1 to 4, named `Referral Engine - Affiliate Link`.
   **Check:** the title is exact, and the zoom is 100%.
2. Click **Add new trigger**, search `affiliate`, and click **Affiliate enrolled in campaign**. Add the filter `Campaign Is` → `<PROGRAM_NAME>`. Click **Save trigger**.
   **Check:** the trigger box shows the campaign filter.
3. Click the **+**, search `update contact field`, and click it. Type the spec's Action Name.
   **Check:** the panel is open with the right name.
4. Click **Add field**, then **Select field**, and pick `Affiliate Link`. In its value box, click the tag icon, search `affiliate`, and pick **Affiliate enrolled in campaign . Affiliate Referral Link** (the picker label) from the trigger's own group. Insert it from the list only: its raw `{{…}}` text was never seen, so never type a guessed one.
   **Check:** the value box shows a chip labelled "Affiliate enrolled in campaign . Affiliate Referral Link".
5. Click right after that chip and type the rest of the value exactly as the spec writes it: `&claimed_partner_id={{contact.id}}&claimed_partner_name={{contact.first_name}}%20{{contact.last_name}}`.
   **Check:** the whole value matches the spec character for character: the chip first, then the typed part, no spaces.
6. Click **Add field** again and pick `Referral Code`. In its value box, click the tag icon, search `am id` (searching `affiliate` does not list it), and pick **Affiliate enrolled in campaign . Am Id** (the picker label). Insert it from the list only; never type a guessed `{{…}}`.
   **Check:** the value box shows a chip labelled "Affiliate enrolled in campaign . Am Id", and nothing else.
7. Click **Save action**.
   **Check:** the box shows under the trigger.
8. Finish with [5-workflows.md](5-workflows.md) section 5.2, actions 13 to 17: compare, settings, publish, double-check, record.
   **Check:** the double-check shows `Referral Engine - Affiliate Link` as `published`.

## 6.5 · Refer a Client reads the `am_id`

1. Open **Sites → Forms**, then `Refer a Client` in the builder.
   **Check:** the builder opens on `/form-builder-v2/<REFER_FORM_ID>`.
2. Click the hidden field `Claimed Referral Code`, then its gear icon.
   **Check:** **Hidden** is on and **Query Key** is `am_id` (set in step 4). If not, set them exactly so and click **Save** at the top right; the yellow dot must go away.

## 6.6 · File each first-claim lead under its partner

Do this in workflow 2, then in workflow 3. Only a **first** claim is filed. A disputed lead goes under nobody until a person decides.

1. Open `Referral Engine - Referral Capture` from the workflows list.
   **Check:** the canvas shows both branches, and the zoom is 100%.
2. In the first-claim branch, find the step that copies the claim into the credit fields: `Record first claim` in the first build (the spec, [spec/workflows/2-referral-capture.md](../spec/workflows/2-referral-capture.md), gives its name). Click the **+** right under it.
   **Check:** the **+** you clicked is inside the first-claim branch, directly under that step.
3. Search `affiliate` and click **Add leads under an affiliate**. Type the Action Name `File the lead under its partner`.
   **Check:** the panel shows the name.
4. Choose **Custom Mapping**.
   **Check:** there is no campaign picker. That is expected: the `am_id` names the campaign.
5. For **AM ID**, click the tag icon and pick **Contact → Custom Fields → Referral Code**.
   **Check:** the value shows the contact's `Referral Code` merge field (`{{contact.referral_code}}`).
6. Click **Save action**.
   **Check:** the new box sits in the first-claim branch, right after the step from action 2. The later-claim branch is unchanged.
7. Click the header **Save**.
   **Check:** the "Saved!" message appears. The double-check shows the workflow `published`, with a higher version.
8. Repeat actions 1 to 7 in `Referral Engine - Staff Attribution`, using [spec/workflows/3-staff-attribution.md](../spec/workflows/3-staff-attribution.md) for the step name in action 2.
   **Check:** the same new box in its first-claim branch, and a higher published version.

Staff-logged intros are filed in the Affiliate Manager only when staff type the partner's Referral Code into the Staff Attribution form.

## 6.7 · The Become a Partner page

GHL has no page where partners sign themselves up to the portal. This page, with the Partner Sign-Up form on it, is the way in. Its headline and copy are **DRAFT** until the approver approves them. The layout is in [spec/affiliate-manager.md](../spec/affiliate-manager.md); this client's text is in the blueprint's section 9.

1. In the left menu, click **Sites**, then **Funnels**.
   **Check:** the list of funnels shows.
2. Click **+ New funnel**, then **From blank**. Name it `<PROGRAM_NAME>` and click **Create**.
   **Check:** the new funnel opens, with no steps.
3. Click **+ Add new step or import**. Type the page name `Become a Partner`. In the path box, clear the text GHL filled in, then type `become-a-partner`. Click **Create funnel step**.
   **Check:** the step shows, with the path `/become-a-partner`.
4. Click **Create from blank**.
   **Check:** the page builder opens on an empty page.
5. From **Quick Add**, drag **1 Column** onto the canvas.
   **Check:** an empty one-column row shows on the page.
6. Click the row's **+ Add**, then click **Headline** in Quick Add.
   **Check:** a headline shows inside the row.
7. Double-click the headline's text, press Ctrl+A, and type the headline from the blueprint's section 9.
   **Check:** the headline reads exactly as the blueprint.
8. Click the orange **+** under the headline, then **Paragraph**. Type the copy line from the blueprint's section 9.
   **Check:** the paragraph reads exactly as the blueprint.
9. Click the **+** under the paragraph, then **Forms And Surveys** → **Add Existing Form** → `Partner Sign-Up`.
   **Check:** the Partner Sign-Up form shows on the page.
10. Click the save icon.
    **Check:** the top bar shows "Last saved ...".
11. Copy the preview link from under the builder's top bar into the build record: `https://sites.leadconnectorhq.com/preview/<PAGE_ID>`.
    **Check:** the link opens the page in a new tab, with the headline, the copy and the form.
12. **Do not publish.** Publishing needs a connected domain: without one, GHL says "At least one domain needs to be selected before publishing funnel". It also needs the approver's OK on the copy. Add "Publish the Become a Partner page" to the build record's open items, owned by the operator.
    **Check:** the open item is in the build record.

## 6.8 · Record and check

1. Run `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids` and paste the whole block into the config as `"ids"`.
   **Check:** `ids.workflows` now holds `Referral Engine - Affiliate Link`. The config is valid JSON.
2. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** every line passes: all fields, tags, pipelines, the calendar, the 3 forms, and all 8 workflows (7 without Instantly) `published`.
3. In the build record, write: the campaign, the new versions of workflows 2, 3 and 4, workflow 5's id and version, the funnel's name and the preview link. Add a log line: `YYYY-MM-DD HH:MM · Step 6 done · Affiliate Manager live`.
   **Check:** all of it is in the build record.

## If a step fails

- **Screenshots time out, or dropdowns and menu items ignore clicks, but typing works.** The GHL window is covered or minimised (`document.visibilityState` is `"hidden"`). Put GHL and the chat side by side. Reloading or zooming does not fix it.
- **A dropdown option ignores the click, in Chrome.** Hover the option and press Enter, or type to filter the list and press Enter.
- **Am Id is not in the picker.** Search `am id`, not `affiliate`.
- **There is no campaign picker in Add leads under an affiliate.** Expected with Custom Mapping.
- **Pay Per Sale is greyed out, or Add Manual Commission lists no campaign.** Expected without Stripe (see the top of this file). Do not try to work around it.
- **Publish now does nothing.** The window is hidden. See the first line of this list.
- **The funnel will not publish.** Expected until a domain is connected. Keep it saved, and use the preview link.
- **An element will not drop onto the page.** Drag a **1 Column** row first, then use the row's **+ Add**.
- **The path came out wrong.** GHL fills the path from the page name. Clear it before typing `become-a-partner`.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 6.<N>: <what happened>. Need from you: <one thing>.` Then wait.
