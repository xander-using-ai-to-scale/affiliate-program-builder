# Step 7 · The Instantly webhook

**Only if the client runs cold email in Instantly.** Connect Instantly to workflow 1, so that every lead someone marks **Interested** lands in GHL as a partner prospect at `Partner Recruiting` → `Engaged`, with a note, an alert and a reply task.

| | |
|---|---|
| **Owner** | The client pays for the plan. Then the operator, or the AI session in the operator's browser, adds the webhook |
| **Time** | 2 minutes once the plan is upgraded |
| **Needs** | Workflow 1 published (step 5.4); the config's `instantly.webhookUrl` (the `<INSTANTLY_WEBHOOK_URL>`); the client's Instantly on the **Hyper Growth** plan |
| **Makes** | A webhook in the client's Instantly on the event "Lead is marked as interested" |
| **Done when** | One real interested lead lands at `Partner Recruiting` → `Engaged`, and its note shows the reply |

**The process rule: nothing reaches GHL unless someone marks the lead Interested** in Instantly's Unibox (its shared inbox). Firing on "interested", rather than on every reply, keeps auto-replies and refusals out of the pipeline, because Instantly's own classification does the filtering.

**This step often waits on the client.** Instantly webhooks need the Hyper Growth plan ($97 a month, as of Sep 2026). If the client has not upgraded, go on to step 8, list this step as an open item, and come back.

**Not yet proven: a real Instantly event.** The first build tested workflow 1 only with `fire-test.js`. Instantly documents `lead_email`, `campaign_name` and `unibox_url` in its payload, but the reply text, the company and the phone arrive under key names its docs do not pin down. Section 7.3 checks them on the first real lead.

## 7.1 · Before you start

1. Confirm with the operator that the client's Instantly is on the Hyper Growth plan. The client upgrades it themselves; never enter payment details.
   **Check:** the operator confirms the plan. If not, stop here and list "Instantly on Hyper Growth" as an open item owned by the client.
2. Confirm who adds the webhook: the operator (or the client) in their own browser, or you, in the operator's browser, logged in to the client's Instantly by the operator.
   **Check:** you know who does section 7.2.
3. Ask whether the client's Instantly workspace also runs campaigns for other offers.
   **Check:** you have the answer. If it does, the operator confirms which campaigns to include before 7.2, action 3.
4. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** `Instantly - Interested Partner Reply` is `published`, and the config holds `instantly.webhookUrl`.

## 7.2 · Add the webhook in Instantly

1. In the client's Instantly, open **Settings → Integrations → Webhooks**, and add a webhook.
   **Check:** the new-webhook form is open.
2. Set the event to **Lead is marked as interested**.
   **Check:** that event, and only that event, is chosen.
3. Set the campaigns to **All Campaigns**, unless the operator narrowed them in 7.1, action 3.
   **Check:** the campaign choice matches the operator's answer.
4. Paste the target URL: the `<INSTANTLY_WEBHOOK_URL>` from the config's `instantly.webhookUrl`.
   **Check:** the URL matches the config character for character.
5. Save the webhook.
   **Check:** the webhook shows in the list, active.
6. Write the webhook's event, campaigns, URL and the date into the build record.
   **Check:** the entry is in the build record.

## 7.3 · Check it with one real lead

1. Ask the operator to have the client (or their setter) mark one real, genuinely interested reply as **Interested** in the Unibox, and to send you that lead's email address.
   **Check:** you have the email.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> <that email>`. It only reads.
   **Check:** the contact exists with the tags, fields, deal, note and task that [spec/workflows/1-instantly-interested-reply.md](../spec/workflows/1-instantly-interested-reply.md) lists. The deal is at `Partner Recruiting` → `Engaged`. The task is on `<PLACEHOLDER_USER>`.
3. Read the note and the contact's company.
   **Check:** the note shows the lead's reply and the Unibox link, and the company is filled. If the reply or the company is blank, do action 4. If both are there, skip action 4.
4. Instantly used other key names. Open workflow 1 from the workflows list, open its trigger, and read the real request's keys. In the steps that map the reply and the company, type the right keys as merge fields (`{{inboundWebhookRequest.<key>}}`), save each action, then click the header **Save**. The Unibox link still opens the thread in the meantime.
   **Check:** the double-check shows workflow 1 `published` with a higher version. The next real lead's note shows the reply.
5. Write the result into the build record: the date, the lead's email, and what matched. Add a log line: `YYYY-MM-DD HH:MM · Step 7 done · Instantly webhook live`.
   **Check:** both are in the build record.
6. Tell the operator the rule for the client's team, in one line: "Only leads marked Interested in the Unibox reach GHL."
   **Check:** the message is sent.

## If a step fails

- **Instantly has no Webhooks page, or it is locked.** The plan is below Hyper Growth. The client upgrades; list it as an open item until then.
- **The real lead did not reach GHL.** Check the webhook's event is "Lead is marked as interested" and its URL matches the config exactly. Check the lead was marked Interested (not just replied). Check workflow 1 is `published`.
- **The contact arrived, but with no deal.** Open workflow 1's execution log for that contact, find the step that failed, and compare it with the spec.
- **The note's reply or the company is blank.** See 7.3, action 4.
- **The workspace runs other offers, and their leads arrive too.** Narrow the webhook's campaigns to the partner-recruiting ones, with the operator's OK.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 7.<N>: <what happened>. Need from you: <one thing>.` Then wait.
