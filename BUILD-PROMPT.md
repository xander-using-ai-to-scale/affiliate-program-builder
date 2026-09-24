# Build prompt

Paste the message below into a **new** Claude Code chat, opened in an empty folder. Codex and Hermes take the same message. Fill every `<...>` blank first. Attach the client's context (call transcripts, notes, emails, their website link), or paste it under the message.

## Before you paste

- [ ] The session can reach this repo: a GitHub link it can clone, a folder on this computer, or the release zip `dist/affiliate-program-builder-v1.0.0.zip` attached to the message.
- [ ] You have the client's context at hand: at least the call where the program was discussed.
- [ ] Node 18 or newer is installed: `node --version` prints `v18` or higher.
- [ ] The session can drive a browser (Claude in Chrome, or the Claude app's browser pane), and you can log in to GHL there with your own login.
- [ ] You can keep the GHL window and the chat side by side on screen while the session builds (on Windows: Win + ← and Win + →).
- [ ] If you have them already: the client's GHL location id, and their token saved in a file in `~/.secrets/`. If not, write "not yet": step 2 gives you a ready-to-send message asking the client to add you as a user, and the clicks to create the token with them.
- [ ] You know who runs the GHL agency the client's sub-account sits under. If **Marketing → Affiliate Manager** is missing there, that agency owner switches it on (step 2).
- [ ] Your approver (at Using AI to Scale, Justin) can review the client-facing texts during the build.

## The message

```
You're going to build a GoHighLevel (GHL) affiliate program for <CLIENT_NAME>, with the Affiliate Program Builder.

Repo: <REPO_LOCATION>
(A GitHub link: clone it into this folder. A folder path: work in that folder. A zip file: unzip it here.)

Client context: attached (or pasted below this message).

Access (write "not yet" where you don't have it; step 2 of the process collects it):
- GHL location id: <LOCATION_ID>
- Token file name in ~/.secrets/: <TOKEN_FILE>
- My GHL user, the placeholder for every task, alert and the calendar until the client has one: <PLACEHOLDER_USER>
- Does the client run cold email in Instantly? <USES_INSTANTLY>

1. Read CLAUDE.md, then process/README.md, in full.
2. Follow process/0-intake.md through process/9-handover.md in order. Don't skip, merge or reorder steps, and don't move on until a step's Check passes.
3. Ask me only what the process says to ask. Never guess a setting that is not in spec/: ask me instead.
4. Stop after the blueprint, and wait for my approval before you build anything in GHL.
5. Ask me before anything client-facing goes live, before any delete, and before anything is sent to anyone.
6. Keep every client file in the client's folder under clients/. Never put a token in a file or in this chat.
7. Finish with the build record, the flowcharts PDF and the walkthrough video script.
```

## What happens next

| Step | Time (first build) | You do |
|---|---|---|
| 0 Intake | 15–30 min (estimate) | Answer up to 5 questions at a time |
| 1 Blueprint | 15–30 min (estimate) | Reply "approve", or send changes |
| 2 Access and survey | Waits on the client | Get your user in the client's sub-account; create and save the token with the client |
| 3 to 6 Build | About 5.5 hours | Stay logged in to GHL, with its window visible beside the chat |
| 7 Instantly | 2 min once the client upgrades | The client upgrades Instantly; you or the session add the webhook |
| 8 Test | About 2 hours | Do the one real form fill (1 minute) |
| 9 Handover | About 1 hour plus one call | Get the approver's OK on the texts, record and send the 2-minute video, approve the test cleanup |

The first build took about 1.5 days end to end, most of it waiting on people. Everything else: [README.md](README.md) and [process/README.md](process/README.md).
