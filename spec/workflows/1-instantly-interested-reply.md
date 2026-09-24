# Workflow 1: Instantly - Interested Partner Reply

**Build it only if the client runs cold email in Instantly** (the blueprint's section 7). Otherwise skip this file, and the config's `structure.remove.workflows` lists this workflow.

| | |
|---|---|
| **GHL name** | `Instantly - Interested Partner Reply` |
| **Purpose** | A partner prospect answers the client's cold email and someone marks the lead **Interested** in Instantly's Unibox. Instantly posts the lead to GHL. The workflow makes (or updates) the contact, tags it, opens a deal at `Partner Recruiting` → `Engaged`, adds a note with the reply, alerts `<PLACEHOLDER_USER>` and gives them a reply task |
| **Trigger** | Type **Inbound Webhook**. Search word: `inbound webhook`. It shows the badge "This is a premium trigger. Using this trigger will incur additional charges per execution" |
| **Trigger name** | `Instantly - lead marked interested` (type it in **Workflow trigger name**) |
| **Filters** | None ("No filters applied") |
| **Webhook URL** | GHL generates it in the trigger panel: `https://services.leadconnectorhq.com/hooks/<LOCATION_ID>/webhook-trigger/<a GHL id>`. Copy it with the field's copy icon into the config as `instantly.webhookUrl`: this is the `<INSTANTLY_WEBHOOK_URL>`. The panel cuts the long URL off, so never retype it from the screen |
| **Mapping reference** | Required: the trigger will not save without one ("A Mapping Reference is required for an Inbound Webhook Trigger"). Send a sample with `node tools/ghl/fire-test.js --client <CLIENT_SLUG> test.instantly1@example.com` while the workflow is still a draft. Then **Fetch sample requests** → **Select reference payload** → the newest request (click the far-left part of the option) → **Save trigger** |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off** (seen in the first build) |
| **Depends on** | The fields `Instantly Campaign` and `Next Action Date`; the tags `source/instantly` and `interest/partner-program`; the pipeline `Partner Recruiting`; `<PLACEHOLDER_USER>` as a user in the account |
| **Published in the first build** | Sep 21 2026, version 4 |

**The payload keys.** Instantly documents `lead_email`, `campaign_name` and `unibox_url`. The workflow also maps `first_name`, `last_name`, `phone`, `company_name` and `reply_text`, which Instantly sends as extra lead data under names its docs do not pin down. `fire-test.js` sends all of them. **Not yet proven** (confidence medium): the real key names for the reply text, the company and the phone. [7-instantly](../../process/7-instantly.md), section 7.3, checks them on the first real lead.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Create contact` | **Create update contact**. GHL adds it by itself when the webhook trigger is saved ("Automatically creates a new contact. If a contact already exists, it will be updated. This action only works with contactless execution methods like 'Inbound webhook'") | **+ Add field**, five rows, each value **typed** as a merge field: **Email** = `{{inboundWebhookRequest.lead_email}}` · **First Name** = `{{inboundWebhookRequest.first_name}}` · **Last Name** = `{{inboundWebhookRequest.last_name}}` · **Phone** = `{{inboundWebhookRequest.phone}}` · **Business Name** = `{{inboundWebhookRequest.company_name}}` | A typed key the sample lacks shows as an orange chip and the warning "No step provides this data". That is expected: it fills in when the workflow runs. The Email chip reads "Inbound Webhook Trigger . Lead Email" |
| 2 | `Update contact field` | **Update contact field** (`update contact field`) → Action type **Update field data** | Row 1: **Instantly Campaign** = `{{inboundWebhookRequest.campaign_name}}` · Row 2: **Next Action Date** = **Current date** (the field's dropdown option) | Add each row with **Add field** → **Select field** → search the name |
| 3 | `Add Tag` | **Add contact tag** (`tag`) | Tags: `source/instantly`, `interest/partner-program`, picked from the existing tag list | The tag box lags. Type one tag, wait, hover the result and click it, then the next. If the box shows run-together text, cancel the step and add it again |
| 4 | `Create opportunity` | **Create opportunity** (`create opportunity`) | Pipeline: `Partner Recruiting` · Duplicate opportunity: **Disabled** (leave as shown) · Fields: **Pipeline Stage** = `Engaged` · **Opportunity Name** = `{{contact.email}}` · **Opportunity Source** = `Instantly reply` | The Opportunity Source row comes pre-filled with a Contact Source chip: delete it, then type `Instantly reply`. Set no value, status or owner. A repeat reply keeps one deal (duplicates disabled) |
| 5 | `Note` | **Add note** (`note`) | **Title**: `Instantly reply - marked interested` · **Note**, three lines: `Reply:` then `{{inboundWebhookRequest.reply_text}}` · `Campaign:` then `{{inboundWebhookRequest.campaign_name}}` · `Unibox:` then `{{inboundWebhookRequest.unibox_url}}` · Color: the first (default, yellow) | The first build inserted the three values from the tag icon's list, and the editor dropped the space typed after each colon, so the note reads `Reply:<text>`. That is cosmetic. Confirm: whether this editor has a `</>` source view; the first build did not use one here. The API shows only the note's body; the title was set in the panel (confidence high) |
| 6 | `Internal Notification` | **Internal notification** (`internal notification`) → Type of notification **Email** | From Name: empty · From Email: empty (GHL then sends with its default values) · **To User Type**: `Particular user` · **Select Users**: `<PLACEHOLDER_USER>` · Notify followers: Contact followers **Off**, Opportunity followers **Off** · Cc / Bcc: none · Templates: none · **Subject**: `New interested partner reply - act today: {{contact.email}}` · **Message**, typed in the `</>` source view: `<p><b>New interested partner reply - reply to them today.</b></p><p>Name: {{contact.name}}<br>Email: {{contact.email}}<br>Company: {{contact.company_name}}<br>Campaign: {{inboundWebhookRequest.campaign_name}}</p><p>Their reply:<br>{{inboundWebhookRequest.reply_text}}</p><p>Open in Instantly: {{inboundWebhookRequest.unibox_url}}</p>` | Internal: goes to the placeholder user, not to the lead. GHL creates a contact for the alert address by itself (source "notification"): keep it |
| 7 | `Add task` | **Add task** (`add task`) | **Title**: `Reply to {{contact.email}} - interested partner` · **Description**, typed in the `</>` source view: `<p>This partner prospect replied to the Instantly campaign and was marked Interested. Reply to them today and offer a Partner Intro Call.</p><p>Their reply: {{inboundWebhookRequest.reply_text}}</p><p>Open in Instantly: {{inboundWebhookRequest.unibox_url}}</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | After picking the user, click the Assign to box once more to close it, then press Tab: the list can stay open invisibly and take your next click. The canvas shows it as "#1 Add task" |

End after step 7. No branches.

## Test

Test 0 in [8-test](../../process/8-test.md), section 8.2.

1. `node tools/ghl/fire-test.js --client <CLIENT_SLUG> test.instantly1@example.com`, then after 1 minute `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.instantly1@example.com`.
2. Expected readback:
   - Contact `Test Partner`, `test.instantly1@example.com`, phone `+15555550123`, company `Test Partner Co`.
   - Tags `source/instantly`, `interest/partner-program`.
   - `Instantly Campaign` = the payload's `campaign_name` (`TEST - Partner Recruiting`). `Next Action Date` = today.
   - One deal: `Partner Recruiting` / `Engaged`, named `test.instantly1@example.com`, source `Instantly reply`, no owner.
   - A note with the reply, the campaign and the Unibox link.
   - A task `Reply to test.instantly1@example.com - interested partner`, on `<PLACEHOLDER_USER>`, due the next day at 00:00 in the account's time zone.
   - The execution log shows every step ran, and the Internal Notification step shows **Success**.
3. Fire the same email again: still one contact and one deal, plus a second note and a second task (intended: every reply gets its own follow-up).

Not yet proven: a real Instantly event, and whether the alert email reached the inbox (GHL logged Success; the inbox was not checked). Step 7 of the process checks the first real lead.

## Client-specific values

| Setting | Per client |
|---|---|
| Webhook URL | Generated by GHL in each account |
| Step 6 recipient, step 7 assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Everything else | The same in every build. If the blueprint says the client does not use Instantly, the workflow is not built |
