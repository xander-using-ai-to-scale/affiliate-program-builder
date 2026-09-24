# Step 2 · Access and survey

Get the operator into the client's GHL sub-account with their own login, get a token for the scripts, fill the client config, and take a read-only inventory of what is already in the account.

| | |
|---|---|
| **Owner** | The client (the invite and the token), the operator (saves the token file), the AI session (config and survey) |
| **Time** | Waits on the client. About 15 minutes once they act (estimate). The survey took 15 minutes in the first build |
| **Needs** | The approved blueprint |
| **Makes** | `clients/<CLIENT_SLUG>/config.json`; the survey and the account details in the build record |
| **Done when** | `node tools/ghl/survey.js --client <CLIENT_SLUG>` names the client's sub-account and lists `<PLACEHOLDER_USER>` as a user, and every name clash is settled with the operator |

**Nobody logs in as the client.** The operator gets their own user in the client's sub-account. No shared passwords, ever.

**The build is additive only.** In an account that is already in use, nothing of the client's is renamed, edited or deleted. The scripts skip any name that already exists.

## What we need from the client

| We need | How | Why |
|---|---|---|
| A user for the operator in the client's sub-account, with admin rights | The client invites `<PLACEHOLDER_USER>`'s email as a user (section 2.1). If the sub-account sits under the operator's own GHL agency, the operator may already have access | We build and check with our own login |
| A sub-account Private Integration token | The client creates it, or the operator creates it with the client on a call (section 2.2) | Every script in `tools/ghl/` uses it |
| Instantly on the Hyper Growth plan, only if the client uses Instantly | The client upgrades | Instantly webhooks need that plan (step 7) |

Not needed yet, and not blocking the build: the client's own GHL user (step 9), their domain (step 9), their A2P registration for SMS, and Stripe.

## 2.1 · The operator's user in the client's sub-account

1. Send the operator this message for the client, in a code block, with `<CLIENT_OWNER>` and `<PLACEHOLDER_USER>`'s name and email filled in. If the client's sub-account sits under the operator's own GHL agency, the operator may already have access: then they skip it and add their user themselves.

   ```
   Hi <CLIENT_OWNER>,

   To build your partner program, we need our own user in your GHL account. We never use your login. It takes 2 minutes:

   1. In your GHL account, click Settings (bottom left), then My Staff.
   2. Click "+ Add Employee".
   3. Fill in our name and email: <PLACEHOLDER_USER>.
      If it asks for a password, type any long random one and do not send it to us:
      we set our own with "Forgot password".
   4. Under User Roles, set User Type = Account and User Role = Admin.
   5. Click Save.

   Then reply "done". Thanks!
   ```

   **Check:** the operator confirms the message is sent. Confirm: the menu and button names (`My Staff`, `+ Add Employee`, `User Roles`, `Account`, `Admin`). The first build did not record the client's clicks; some accounts call the page `Team`. If the client sees other names, write them in the build record.
2. When the invite arrives, the operator accepts it and logs in to the client's sub-account in the browser you will drive.
   **Check:** the operator can see the client's sub-account, with its name at the top of the left menu.
3. Ask the operator to open **Marketing** in the left menu of the client's sub-account.
   **Check:** **Affiliate Manager** is in the Marketing menu. If it is not, stop: see "If a step fails", "Affiliate Manager is missing".
4. Take the location id from the browser's address bar: it is the text after `/location/` (for example `.../v2/location/<LOCATION_ID>/dashboard`).
   **Check:** you have the id, and it matches the one in the build prompt if the operator gave one there.

## 2.2 · The Private Integration token

The token lets the scripts read and build the account. The operator or the client creates it, in their own browser. **You never see it**: never ask for it in the chat, never print it, never write it into a file yourself. GHL's settings screens also do not load in the Claude browser pane.

1. Send the operator these instructions, in a code block, to follow with the client:

   ```
   In the client's GHL sub-account (not the agency view):
   1. Click Settings (bottom left), then Private Integrations.
   2. Click "Create new Integration".
   3. Name: Affiliate Program Build. Description: Using AI to Scale build scripts. Click Next.
   4. Tick these scopes (use the search box):
        View Contacts, Edit Contacts
        View Opportunities, Edit Opportunities
        View Custom Fields, Edit Custom Fields
        View Tags, Edit Tags
        View Calendars, Edit Calendars
        View Users, View Workflows, View Locations, View Forms
      Then click Create.
   5. Copy the token. GHL shows it only once.
   6. Save it as the only line of a text file in your .secrets folder:
        ~/.secrets/<CLIENT_NAME> GHL Token.txt
      (on Windows: C:\Users\<you>\.secrets\<CLIENT_NAME> GHL Token.txt)
   7. Send me only the file name, never the token.
   ```

   **Check:** the message is sent. Confirm: the button names (`Private Integrations`, `Create new Integration`, `Next`, `Create`) and the scope labels. The first build did not record the clicks, and GHL may word a scope differently (for example "Contacts: read-only" for "View Contacts"): tick the one that means the same. If **Private Integrations** is not in Settings, see "If a step fails".
2. Wait for the operator to reply with the file name. This is `<TOKEN_FILE>`.
   **Check:** you have a file name ending in `.txt`, not a token. A token starts with `pit-`: if the operator pasted one, tell them to delete it from the chat, and to rotate it if the chat is shared.

Use a **sub-account** token. An agency-level token fails with "user type mismatch". The scopes above ran every script in the first build, and the same token also read the forms. **This is the one scope list for the repo**: [tools/ghl/README.md](../tools/ghl/README.md) points here.

## 2.3 · The client config

1. Copy `templates/client-config.json` to `clients/<CLIENT_SLUG>/config.json`.
   **Check:** the file exists. Its notes explain every key.
2. Set `locationId` to `<LOCATION_ID>` from section 2.1.
   **Check:** the value matches the id in the operator's GHL address bar.
3. Set `tokenFile` to `<TOKEN_FILE>`: the file **name** only, for example `Example SEO Agency GHL Token.txt`.
   **Check:** no folder path, and no token. The scripts refuse a value that looks like a token.
4. Set `client` to `<CLIENT_NAME>`. If the blueprint does not build workflow 1 (no Instantly), delete the whole `instantly` block, as its note says. Leave `calendarOwnerUserId` for section 2.4, and `structure` and `ids` for steps 3 to 6.
   **Check:** the file is valid JSON: `node -e "JSON.parse(require('fs').readFileSync('clients/<CLIENT_SLUG>/config.json','utf8'))"` prints nothing and exits without an error.

## 2.4 · The survey (read-only)

`survey.js` only reads. It changes nothing in the account.

1. Run `node tools/ghl/survey.js --client <CLIENT_SLUG>`.
   **Check:** the first line names the client's sub-account and `<LOCATION_ID>`. The users list includes `<PLACEHOLDER_USER>`. If you see error 1010, 401 or "user type mismatch", see "If a step fails".
2. Copy the whole output into the build record, under "Survey before the build", with the date and time.
   **Check:** the output is in the build record.
3. Fill the build record's "The account" section: the sub-account's name, `<LOCATION_ID>`, the time zone (the survey prints it), `<TOKEN_FILE>` (the name only), the users, and `<PLACEHOLDER_USER>` as the placeholder.
   **Check:** every line of that section is filled.
4. Copy `<PLACEHOLDER_USER>`'s user id from the survey's users list into the config key for the placeholder user (`calendarOwnerUserId`).
   **Check:** the id in the config matches the survey line exactly, and the file is still valid JSON.
5. Write down where the client's leads land today: which pipelines hold deals, which forms and workflows are in use.
   **Check:** the build record has a short "In use today" list, or `none`.
6. Compare the account's time zone (the survey prints it) with the brief's field 1. Tasks come due at 00:00 in the account's zone, and the calendar's hours use it. A new, empty sub-account may carry GHL's default zone, not the client's.
   **Check:** they match, or the brief's time zone is the `default` (the account's). If they differ, tell the operator: the client, or the operator with the client's OK, changes it in the sub-account's settings (Confirm: Settings → Business Profile → the time zone). You never change an account setting yourself (additive only). Run the survey again afterwards and write the new zone into the build record.

## 2.5 · Name clashes

A clash is a name in the account that the standard build also uses: a pipeline, a field, a tag, a form, a workflow or a calendar. The build skips any name that exists and never edits it. So a clashing item keeps the client's version, which may be of another type or have other options.

1. Compare the survey's pipelines, custom fields, tags, forms, workflows and calendars with the standard names in [spec/structure.json](../spec/structure.json) and the form and workflow names in [spec/README.md](../spec/README.md).
   **Check:** you compared all six lists.
2. List each clash in the build record: the name, what the client has (type, options, stages), and what the standard build expects.
   **Check:** the list is written, or says `no clashes`.
3. If there is a clash, send the operator the list, with a recommended answer for each: reuse the client's item (when it has the same type and options), or ask the client to rename theirs before step 3.
   **Check:** the message is sent, or there is no clash.
4. Write the operator's decision for each clash into the build record.
   **Check:** every clash has a decision. Step 3 does not start while a clash is open.

## 2.6 · Close the step

1. Add a log line to the build record: `YYYY-MM-DD HH:MM · Step 2 done · survey clean` (or `· <N> clashes settled`).
   **Check:** the line is in the log.
2. Send the operator one line: `Step 2 done · access and survey · step 3: structure`.
   **Check:** the message is sent.

## If a step fails

- **Error 1010 on every call.** Cloudflare blocks requests that do not look like a browser. The repo's scripts send a browser User-Agent, so this means a script was changed or a call was written by hand. Use the scripts as they are.
- **"user type mismatch".** The token is an agency token. Create a sub-account token (section 2.2).
- **401, or "not authorized" for one kind of item.** A scope is missing. The operator adds it in Settings → Private Integrations, or creates a new token with the scopes in section 2.2.
- **"Token file not found".** The file is not in `~/.secrets/`, or its name differs from `tokenFile`. The operator checks the folder and the exact name, spaces included.
- **The forms are not readable.** The token has no forms scope. The survey still runs. Record the form ids by hand in step 4.
- **Affiliate Manager is missing** from the Marketing menu. It is usually switched on per sub-account by the **agency** that owns the account, not by the client: in the agency view, the sub-account's settings, or the SaaS plan the sub-account is on. Confirm: the exact place; the first build's account already had it. Stop, and tell the operator: `Blocked at step 2.1: Affiliate Manager is not in the client's Marketing menu. Need from you: ask whoever runs the GHL agency for this sub-account to enable Affiliate Manager for it (agency view → the sub-account's settings, or its SaaS plan).` The standard program needs it (step 6). Steps 3 to 5 do not use it, so they may go ahead while it is sorted, with the operator's OK.
- **Private Integrations is missing from Settings.** It may be switched off for the sub-account by the agency. Confirm: where the agency turns it on. Tell the operator, and ask the agency owner to enable it.
- **The operator's user is not in the users list.** The invite went to another sub-account, or was not accepted. The operator checks with the client.
- **Anything else.** Retry the action once. If it fails again, tell the operator: `Blocked at step 2.<N>: <what happened>. Need from you: <one thing>.` Then wait.
