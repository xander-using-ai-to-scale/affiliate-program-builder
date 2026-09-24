# Test log: Example SEO Agency, 2026-09-21 and 2026-09-22

> The worked example's test log: the first build's tests, anonymised. The raw script outputs of the first build were not kept in this form; this log was written on 2026-09-25 from the build log and a read-only API read-back of the test contacts. Times are ET (America/New_York). Contact and deal ids are left out; `<OPP_ID>` stands for the test deal.

**How the tests work.** Public forms carry Cloudflare's bot check, so each test writes exactly what the form writes onto an `@example.com` contact over the API and enrols the contact in the form's workflow (`enroll.js`). Stage-triggered workflows are started by moving the test deal over the API, as a drag does (`move-stage.js`). Workflow 1 is tested by posting a synthetic Instantly payload to its webhook (`fire-test.js`). `verify-test.js` reads a contact back.

**Scenario names.** The first build ran early versions of these scripts. Its test values differ slightly from today's `enroll.js` and `fire-test.js` (notes, company names, and `partnerF` / `claimF`, now `partnerE` / `claimE`). The values below are the ones actually used.

---

## 2026-09-21 12:24 · Mapping sample (before test 0)

- **Sent:** a sample payload to workflow 1's webhook, with the workflow still a draft (lead `mapping-sample@example.com`, campaign "MAPPING SAMPLE - not a real lead").
- **Came back:** `200 {"status":"Success: test request received"}`. No contact created (draft). The trigger then saved with this request as its mapping reference.

## 2026-09-21 12:58 · Test 0: an Instantly interested reply · PASS

- **Sent:** `fire-test.js` with lead `test-partner-0922@example.com`: first name Test, last name Partner, company "Test Web Design Co", phone `+15555550123`, campaign "TEST - Partner Recruiting (Web Design)", reply "TEST - Sounds interesting, happy to hear more about the referral program.", Unibox `https://app.instantly.ai/app/unibox`.
- **Came back:** `200 request sent to trigger execution server`.
- **Read back:** contact "Test Partner" with the phone and company; tags `source/instantly`, `interest/partner-program`; `Instantly Campaign` "TEST - Partner Recruiting (Web Design)"; `Next Action Date` 2026-09-21; one deal `Partner Recruiting` / `Engaged`, named `test-partner-0922@example.com`, source `Instantly reply`, no owner; the note (Reply / Campaign / Unibox); task "Reply to test-partner-0922@example.com - interested partner", on the operator, due 2026-09-22. Execution log: every step Executed; Internal Notification **Success**.
- **Side effect:** GHL created a contact for the operator's alert address by itself (source NOTIFICATION). Kept.

## 2026-09-21 13:00 · Test 0, repeat · PASS

- **Sent:** the same payload again.
- **Read back:** still one contact and one deal; a second note and a second task (intended).

This test contact and its deal were deleted on 2026-09-21 at 13:27, with the demo data.

## 2026-09-21 16:26 · Test 1: a first claim · PASS

- **Sent:** `enroll.js claimA` → workflow 2. `test.referral1@example.com`, Test / Referral One, company "Example Bakery (TEST)"; `Claimed Partner ID` TEST-PARTNER-A, `Claimed Partner Name` "Test Partner A", `Claimed Referral Code` TESTA, `Claim Notes` "TEST - wants to rank on Google Maps".
- **Read back:** `Contact Role` Referred Lead; tag `referred-lead`; `Referring Partner ID` TEST-PARTNER-A, `Referring Partner Name` Test Partner A, `Referral Code` TESTA; `Referral Evidence` = the notes; `Referral Source Type` Partner; `Referral Attribution Method` Partner Submission; `Attribution Confidence` Claimed; `Referral Date` 2026-09-21; deal `Referred Leads` / `Referral Received`, source `Partner referral`; task "Contact referred lead test.referral1@example.com from partner Test Partner A".

## 2026-09-21 16:27 · Test 2: a second claim on the same client · PASS

- **Sent:** `enroll.js claimB` → workflow 2, the same contact; TEST-PARTNER-B / "Test Partner B" / TESTB / "TEST - B says they sent this client too".
- **Read back:** the credit fields unchanged (partner A); the Claimed fields now B's; tag `referral-attribution-conflict`; `Attribution Confidence` Conflicting; the one deal moved to `Attribution Review`; task "Review attribution conflict: test.referral1@example.com".

## 2026-09-21 16:34 · Test 3: a staff-logged introduction · PASS

- **Sent:** `enroll.js staffC` → workflow 3. `test.referral2@example.com`, Test / Referral Two, "Example Plumbing (TEST)"; TEST-PARTNER-C / "Test Partner C" / TESTC / "TEST - Partner C emailed the owner an intro on Sep 21".
- **Read back:** as test 1, with `Referral Attribution Method` **Staff Entered**; deal `<OPP_ID>` at `Referral Received`; task "Contact referred lead test.referral2@example.com from partner Test Partner C".

## 2026-09-21 16:55 · Test 4: a partner sign-up · PASS

- **Sent:** `enroll.js partnerD` → workflow 4. `test.partner.d@example.com`, Test / Partner D, `+15555550142`, "Example Web Design (TEST)", website `https://example.com`, `Partner Type` Web Design / Development, `Partnership Type` Referral, `Partner Notes` "TEST - builds sites for local restaurants", `Payment Preference` ACH.
- **Read back:** `Contact Role` Referral Partner; `Partner ID` = the contact's own id; `Reward Model` Revenue Share; `Revenue Share Percent` 15; `Affiliate Link` `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?claimed_partner_id=<D's contact id>&claimed_partner_name=Test%20Partner D` (the space in "Partner D" is not encoded); tags `referral-partner`, `partner-onboarding`; deal `Partner Lifecycle` / `Onboarding`, source `Partner sign-up form`; task "Onboard new referral partner: test.partner.d@example.com".
- The Affiliate Manager steps did not exist yet, so D is not an affiliate.

## 2026-09-21 17:18–17:56 · Test 5: the commission cycle and the monthly loop · PASS

| Time | Sent | Read back |
|---|---|---|
| 17:18 | `move-stage.js <OPP_ID> "Sold / Enrolled" 1500` | The deal moved on to `Commission Pending`; `Client Monthly Revenue` 1500; `Sale Date` 2026-09-21 (the API gives epoch milliseconds, midnight UTC); `Commission Status` Pending; `Attribution Lock` Locked; task "Approve partner commission: test.referral2@example.com" |
| 17:31 | `move-stage.js <OPP_ID> "Commission Approved"` | `Commission Status` Approved; `Commission Approval Date` set; the deal stays at `Commission Approved`; task "Pay partner commission for test.referral2@example.com" |
| 17:49 | Workflow 8's wait set to 1 minute and published | |
| 17:50 | `move-stage.js <OPP_ID> "Commission Paid"`; read at +30 s and +2.5 min | +30 s: `Commission Status` Paid, `Last Commission Payment Date` set. +2.5 min: the deal back at `Commission Pending`, `Commission Status` Pending, task "Monthly partner commission due: test.referral2@example.com" |
| 17:52 | `move-stage.js <OPP_ID> "Commission Paid"`, then 15 s later `"Lost / No Sale"`; read at +150 s | The deal stays at `Lost / No Sale`; `Commission Status` stays Paid; no new task. The run took the `None` branch |
| 17:56 | Workflow 8's wait set back to 30 days; header Save | Confirmed 30 days; workflow 8 v4 |

Not run: a second month's approval (8.7 action 8 in this repo).

## 2026-09-22 12:09 · Test 6, first run: an affiliate sign-up (Test Partner E) · PASS, with a note

- **Sent:** `enroll.js partnerE` → workflow 4 (now with the two Affiliate Manager steps). `test.partner.e@example.com`, Test / Partner E, `+15555550143`, "Example Affiliate Co (TEST)".
- **Read back:** every workflow 4 step ran. In the Affiliate Manager, E is listed in the campaign Example SEO Partner Program. Profile → Active Referral Links → Customize: Referral ID `testpartnere9104`.
- **Note:** E's `Affiliate Link` has no `am_id`, and `Referral Code` is empty: workflow 5 did not exist until 12:13.

## 2026-09-22 12:26 · Test 6, second run: the link carries both ids (Test PartnerF) · PASS

- **Sent:** `enroll.js partnerF` (today `partnerE`) → workflow 4. `test.partner.f@example.com`, Test / **PartnerF** (no space), `+15555550144`, "Example Affiliate Two (TEST)".
- **Read back:** `Affiliate Link` `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=testpartnerf409&claimed_partner_id=<F's contact id>&claimed_partner_name=Test%20PartnerF`; `Referral Code` `testpartnerf409`. The onboarding task's body still shows the first link (written before workflow 5 ran).

## 2026-09-22 12:27 · Test 7: a referral through the partner's link · PASS

- **Sent:** `enroll.js claimF` (today `claimE`) → workflow 2. `test.referral3@example.com`, Test / Referral Three, "Example Florist (TEST)"; the claim read off F's contact (Partner ID, name, Referral Code); notes "TEST - registered through partner F's affiliate link".
- **Read back:** credit to F (`Referring Partner Name` came out "test partnerf" in lower case: the early script read the name from the contact search, which lowercases names; today's `enroll.js` reads the contact itself); `Partner Submission`, `Claimed`; deal at `Referral Received`; the follow-up task. `File the lead under its partner` ran.
- **Affiliate Manager:** F's profile → Leads: "Test Referral Three (test.referral3@example.com)", Source **Forms**, campaign Example SEO Partner Program. The Affiliate list: F Leads 1, E Leads 0.

## 2026-09-22 12:29 · Check: a manual commission without Stripe

- **Done:** F's profile → Commissions → Add Sales Manually → "Add Manual Commission".
- **Seen:** the Campaign Name list shows "No Data". Closed without submitting. A form campaign cannot hold sales.

## Not tested

- Test 8: one real form fill by a person through a partner's link.
- A real Instantly event (the webhook waits on the Hyper Growth plan).
- The conflict branch of workflow 3.
- GHL's affiliate invite email (test partners use `@example.com`).
- Whether GHL also files a lead by itself from the `am_id` on a real form fill.
