// Moves a TEST deal to a named stage of its own pipeline, the way a staff member dragging the card
// would, so the "Pipeline stage changed" workflows (the commission cycle) run.
//
// WRITES TO GHL. It prints the account first. It only moves deals whose contact's email ends in
// @example.com; real deals are moved by dragging the card in GHL. The optional last argument also
// writes the deal's "Client Monthly Revenue" field (its id comes from the client's config).
// verify-test.js prints a contact's deal ids.
//
//   node tools/ghl/move-stage.js --client <slug> <opportunityId> "<Stage Name>" [clientMonthlyRevenue]
//   e.g.  node tools/ghl/move-stage.js --client acme 8Hq2... "Sold / Enrolled"
//         node tools/ghl/move-stage.js --client acme 8Hq2... "Commission Approved" 2000
'use strict';
const { api, get, banner, die, full, need, client, LOC, args, isTestEmail, run } = require('./ghl.js');

run(async () => {
  const [oppId, stageName, revenue] = args.positional;
  if (!oppId || !stageName) die(`Usage: node tools/ghl/move-stage.js ${client.cli} <opportunityId> "<Stage Name>" [clientMonthlyRevenue]`);
  if (revenue !== undefined && !Number.isFinite(Number(revenue))) die(`"${revenue}" is not a number.`);

  await banner('Move stage (WRITES: moves one test deal)');
  const opp = (await get(`/opportunities/${oppId}`)).opportunity;
  if (!opp) die(`No opportunity ${oppId}.`);
  const contact = (await get(`/contacts/${opp.contactId}`)).contact;
  if (!isTestEmail((contact && contact.email) || '')) {
    die(`Refused: deal ${oppId} belongs to ${(contact && contact.email) || 'a contact with no email'}. This script moves test deals only (@example.com).`);
  }
  const pipes = (await get(`/opportunities/pipelines?locationId=${LOC}`)).pipelines || [];
  const p = pipes.find((x) => x.id === opp.pipelineId);
  if (!p) die(`The deal's pipeline ${opp.pipelineId} is not in the account's pipeline list.`);
  const stage = (p.stages || []).find((s) => s.name === stageName);
  if (!stage) die(`No stage "${stageName}" in ${p.name}. Its stages: ${(p.stages || []).map((s) => s.name).join(', ')}`);

  const body = { pipelineId: p.id, pipelineStageId: stage.id };
  if (revenue !== undefined) body.customFields = [{ id: need('fields', 'Client Monthly Revenue', 'opportunity'), field_value: Number(revenue) }];
  const r = await api('PUT', `/opportunities/${oppId}`, body);
  if (!r.ok) die(`FAILED ${r.status}\n${full(r.body)}`);
  console.log(`moved ${oppId} (${contact.email}) → ${p.name} / ${stageName}${revenue !== undefined ? `, Client Monthly Revenue ${revenue}` : ''}`);
  console.log(`Check it: node tools/ghl/verify-test.js ${client.cli} ${contact.email}`);
});
