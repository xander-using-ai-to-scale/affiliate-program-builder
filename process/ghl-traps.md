# GHL traps: symptom, cause, fix

Every trap in GoHighLevel's screens and API that cost real time in the first build, and exactly how to get past it. Read the tables for your step before you start it. When a Check fails, look here after the step file's own "If a step fails".

## Browser and window

| Symptom | Cause | Fix |
|---|---|---|
| Screenshots time out or come back stale. Dropdown options and menu items ignore clicks, but plain inputs still take typing | The GHL window is covered or minimised. The page reports `document.visibilityState = "hidden"`, and GHL's embedded apps (the builders, the Affiliate Manager) stop drawing. It cost about an hour in the first build | Snap the GHL window and the chat app side by side (on Windows: Win + ← and Win + →) and leave them so. Clicking the window once does not fix it, and neither do a reload or a zoom change. Check with the JavaScript tool: `document.visibilityState` must return `"visible"` |
| A click lands in the wrong field and overwrites it | The window resized itself, so the coordinates came from an old screenshot. This once overwrote a mapped Email field | Take a screenshot right before every click |
| A screenshot right after a click shows the old screen | The browser pane lags 5 to 8 seconds behind actions | Wait, then take another screenshot before deciding the click failed. Never retype on a lagged frame: it doubled a tag name once |
| In Chrome, a dropdown option ignores the click | Dropdown options in GHL often ignore mouse clicks in Chrome | Hover the option and press Enter. Or type to filter the list, then press Enter. Or open the list, then press Down and Enter |
| In the Claude browser pane, a dropdown option ignores the click | Some options register a click only on their left part | Click the left part of the option's text |
| The wrong row is selected in a dropdown | The click came while the list was still moving | Wait for the list to settle, then take a screenshot and click |
| Typing does strange things in a builder | No field had the focus, so the keys fired the builder's shortcuts | Click into the field first, then type |
| `read_page`, `find` and JavaScript see nothing in the workflow builder | The builder is a cross-origin frame | Use screenshots and coordinate clicks. Do not spend turns on `find` there |
| GHL's settings screens (for example email services, private integrations) hang in the Claude browser pane | The pane does not load those modules | The operator opens them in their own browser |
| Emails, subjects or names come out garbled when typed | Render lag interleaves the characters in some email-builder fields | Try once. If it garbles, give the operator the text in a code block to paste by hand |

## Workflow builder

| Symptom | Cause | Fix |
|---|---|---|
| A workflow's direct link opens a blank page | The builder needs the page around it to log in | Open **Automation → Workflows** and click the workflow's name. The first click after the page loads often does nothing: click again |
| Clicks on the canvas's boxes never register | The canvas is not at 100% zoom | Set the zoom to 100% |
| After about 20 edits, clicks stop working and screenshots time out | The builder wedges | Click the header **Save** often. Reload the page: it is the only fix, and it drops unsaved changes (which also makes a reload a safe undo) |
| A change is not live. The header Save is blue with a red dot | An edit to a published workflow is not saved. **Save action** only puts a step on the canvas | Click the header **Save**. Wait for "Saved! Workflow has been saved." Confirm with `double-check.js`: the version goes up |
| The canvas looks right, but the workflow does not behave | The canvas is not proof of what was saved | Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`: its status and version are the truth |
| You cannot find If / else in the actions list | It is listed under another word | Search `Else` |
| After inserting an If / else, the logic runs the wrong way | Inserted mid-chain, GHL attaches the steps below it to the **first** branch | Check each branch before saving, and move steps to the branch the spec names |
| A deal did not move, and there is no error | "Create opportunity" never updates a deal. With duplicates off, it silently does nothing when the contact already has a deal in that pipeline | In a form- or contact-started workflow: **Find opportunity** (the pipeline, plus Opportunity Name = `{{contact.email}}`), then **Update opportunity**. In a deal-started workflow, **Update opportunity** acts on that deal. To move back to an earlier stage, turn on "allow previous stage" |
| After duplicating a workflow, Update-opportunity values show as typed text | Duplicating turns their dropdown values into free text | Delete each of those rows and add it again, picking from the list |
| A task went to the wrong person, or the next click did nothing | The task's **Assign to** list stayed open invisibly and swallowed the click. It once reassigned a task to the wrong person | After picking the user, click the Assign to box once more to close it, then press Tab. One task goes to one person |
| Text typed into a note, an email body or a task description drops spaces or is ignored | Rich-text editors do not take typed text reliably | Click the `</>` source button, triple-click the box to select everything, type the whole text as HTML with plain `{{merge.fields}}`, then Save |
| You cannot put today's date in a date field | Contact and deal date fields take it in different ways | **Contact** date field (**Update contact field**): pick **Current date** from the field's dropdown. **Deal** (opportunity) date field (**Update opportunity**): ⋮ → **Dynamic** → the tag icon → **Right now** → **Date**. Each spec step names the method for its field; the rule is in [spec/workflows/README.md](../spec/workflows/README.md), "Dates" |
| The wait units stop at days | GHL has no month unit | A month is `30` days |
| A webhook field is missing from the picker | The picker lists only keys from the captured sample | Click right of the existing chip, press Ctrl+A, type `{{inboundWebhookRequest.<key>}}`. An orange chip is valid and fills in at runtime. The warning "No step provides this data" is expected |
| The Inbound Webhook trigger will not save | It needs a sample request first | Run `fire-test.js` (step 5.4), then click **Fetch sample requests** and pick the sample |
| Cancel, Escape and the menus stop working in a step's panel | The panel has a validation error, which blocks leaving it | Reload the workflows list page |
| Closing a panel with its X added a field instead | The X moves as the panel scrolls, and lands on "Add field" | Close panels with **Cancel** |
| A whole step disappeared | The red **Delete** at the panel's bottom left deletes the step, after a confirm | Keep clicks away from it. A deleted step is gone: rebuild it from the spec |
| The step's panel does not scroll, or does not fit the window | Scrolling over a text editor scrolls the editor, not the panel | Scroll with the mouse at the panel's far right edge |
| A workflow was deleted by mistake | GHL keeps deleted workflows for 30 days | Restore it from the workflows list's **Deleted** tab |

## Forms

| Symptom | Cause | Fix |
|---|---|---|
| You cannot see the form while building it | The left **Form Element** panel covers it | Close the panel |
| A yellow dot shows beside Save | Unsaved changes | Click **Save** at the top right and wait for the dot to go |
| An automated form fill shows "Please complete the challenge" | Public GHL forms carry Cloudflare's bot check (Turnstile) | Never work around it. Tests stand in for the forms with `tools/ghl/enroll.js`, and a person does the one real fill (step 8, test 8) |
| A hidden field stays empty after a real fill | Its **Query Key** does not match the URL parameter's name | Open the field's gear icon, and set the Query Key exactly (`claimed_partner_id`, `claimed_partner_name`, `am_id`) |
| A partner's name breaks in their link in some email apps | A space in the last name | Known limit. The credit still works, because it keys on the Partner ID |

## Affiliate Manager

| Symptom | Cause | Fix |
|---|---|---|
| Pay Per Sale is greyed out | The campaign's links lead to a form, and there is no Stripe | Expected. Use **Pay Per Lead** with the per-lead amount off. The commission runs in the Referred Leads cycle |
| **Add Manual Commission** lists no campaign | A form campaign cannot hold sales | Expected without Stripe. Partners see leads, not earnings, in the portal |
| **Am Id** is not in the merge-field picker | Searching `affiliate` may not list it | Search `am id` |
| **Add leads under an affiliate** shows no campaign picker | With **Custom Mapping**, the `am_id` names the campaign | Expected. Map **AM ID** to the contact's `Referral Code` |
| **Finish → Publish now** does nothing | The window is hidden | See the first row of "Browser and window" |
| There is no page where partners sign themselves up | GHL's portal has no self sign-up | The Become a Partner page with the Partner Sign-Up form, plus the two Affiliate Manager steps in the Partner Sign-Up workflow, are the way in |
| A partner's Referral ID changed | Staff can change it on the affiliate profile (**Customize**) | Update that partner's `Referral Code` and `Affiliate Link` fields to match |

## Funnels and pages

| Symptom | Cause | Fix |
|---|---|---|
| An element will not drop onto the page | The page needs a row first | Drag **1 Column** from Quick Add onto the canvas, click the row's **+ Add**, then click the Quick Add item |
| The step's path is wrong | GHL fills the path from the page name | Clear the path box first, then type `become-a-partner` |
| "At least one domain needs to be selected before publishing funnel" | No domain is connected to the account | Expected until the client's domain is connected. Keep the page saved and use the preview link, `https://sites.leadconnectorhq.com/preview/<PAGE_ID>` |

## API and scripts

| Symptom | Cause | Fix |
|---|---|---|
| Every call returns error 1010 | Cloudflare blocks requests without a browser User-Agent. It looks exactly like an auth failure, but it is not | The repo's scripts send one. If you ever write a call by hand, send a browser `User-Agent` header |
| "user type mismatch" | An agency token was used | Create a **sub-account** Private Integration token (step 2.2) |
| 401, or "not authorized" for one kind of item | The token lacks a scope | Add the scope in Settings → Private Integrations, or create a new token (step 2.2) |
| GHL's API cannot create or edit a workflow (404) | Workflows are UI-only. The API can only list them | Build workflows in the builder (step 5) |
| The custom-fields list has none of GHL's standard fields | The endpoint lists only the account's own custom fields | Expected |
| A field or pipeline shows as "found 2 times" | A GHL snapshot was loaded as well, or the item was made twice | Do not delete anything. Show the operator both ids and let them decide |

## Tests and cleanup

| Symptom | Cause | Fix |
|---|---|---|
| A test script refuses a contact | Test scripts accept only `@example.com` contacts | Expected. Never test on a real contact |
| A deleted contact is needed again | GHL's deletes are soft | Contacts → the **Restore** tab, or the Audit Logs, for 60 days |
| A contact with the placeholder user's email appeared by itself | GHL creates one for an alert address (source "notification") to log the alerts | Keep it. It would come back with the next alert |

## If a step fails

- **The trap is in a table above.** Apply its fix, then redo the action and its Check.
- **The trap is not here.** Take a screenshot, write the symptom and what you tried into the build record, and tell the operator: `Blocked at step <N.N>: <symptom>. Tried: <fix>. Need from you: <one thing>.` Then wait.
- **You found a new trap and its fix.** Write it into the build record. After the build, the operator adds it to this file, following the rule for changes in `CHANGELOG.md`.
