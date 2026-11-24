/* Scenarios, part 5: notifications, reminders, reports, earnings and payouts. */
chapter('notify', 'Notifications and email', '<p>Every role has a bell. In-app notifications are made instantly; emails go through an outbox that the <b>worker</b> sends every minute (printed in the worker terminal until real email is set up).</p>', [
  T('NTF-01', 'The bell shows what is new', ['C1', 'WA1', 'PA1'], [
    'After a few job steps look at the bell at the top of the page for each role.',
  ], ['A number shows how many are unread (refreshes every minute and when you change pages). Opening the bell page lists them, newest first, with the time.'], { tags: ['smoke', 'core'] }),
  T('NTF-02', 'Who is told about what', ['C1', 'WA1', 'PA1', 'OPS1'], [
    'Walk one job through (JOB-04 to WRK-13) and write down who gets which notification.',
  ], ['Customer: provider took it, visit time set, on the way, work done, rate it, extra work needs approval, payment received/rejected. Worker: new job, work sent back, extra work approved/declined/paid. Provider: new job in pool, cannot attend, work to check, extra work needs check. People not on the job get nothing.'], { tags: ['core'] }),
  T('NTF-03', 'Opening a notification goes to the right page and marks it read', ['C1'], [
    'Press a notification.',
  ], ['You land on the right page (Service requests, Orders, Jobs board, My day) and the notification is no longer unread. "Mark all as read" clears the rest.'], { tags: ['core'] }),
  T('NTF-04', 'Switch email copies off', ['C1'], [
    'On the Notifications page untick "Also send these to me by email". Cause another notification.', 'Tick it again and cause one more.',
  ], ['With email off the bell still gets the notification but the worker terminal prints no email for C1. With it on, an email appears within a minute.'], { tags: ['core'] }),
  T('NTF-05', 'Emails wait while the worker is off', ['TESTER'], [
    'Stop the worker (terminal 4). Cause a notification for C1 (email on). Wait two minutes. Start the worker again.',
  ], ['Nothing is printed while it is off; when started, the waiting email is sent within a minute and not sent twice. The app itself kept working.'], { tags: ['edge', 'core'] }),
  T('NTF-06', 'You cannot read someone else\'s notifications', ['C1', 'C2'], [
    'Open the notifications of C1 and C2 side by side. Check the API page <code>/docs</code> list for "notifications" has only "me" addresses.',
  ], ['Each sees only their own. There is no way to ask for another person\'s.'], { tags: ['security'] }),
]);

chapter('reminders', 'Reminders and alerts', '<p>The worker runs a sweep every <b>10 minutes</b>. Each reminder is sent once. To test, set the data so the condition is true, then wait up to 10 minutes. Keep the worker running.</p>', [
  T('REM-01', 'Unpaid order reminder', ['C1'], [
    'Place an order and do not pay. A developer sets its creation time 25 hours ago (<code>UPDATE orders SET created_at = now() - interval \'25 hours\' WHERE ref_code = \'O-...\'</code>). Wait for the sweep.',
  ], ['C1 gets "An order is waiting for payment" once. After 3 days (80 hours) a second reminder; never a third. A paid order gets none.'], { tags: ['core'] }),
  T('REM-02', 'Visit reminders, on the reader\'s own clock', ['C1', 'WA1'], [
    'With C1\'s time zone set to America/New_York (CUS-01), schedule an assigned job within the next 20 hours (WRK-02). Wait for the sweep.',
    'Move the visit to within 90 minutes and wait again.',
  ], ['C1 and WA1 each get "A visit is coming up" once; C1\'s message shows the time in New York, WA1\'s in IST. When it is under 2 hours away WA1 also gets "A visit starts soon". A moved visit is reminded again. A visit 5 days away is not reminded yet.'], { tags: ['core'] }),
  T('REM-03', 'Nobody accepted: the alert', ['OPS1', 'FR1'], [
    'See JOB-08 for how to age a pool job past its limit.',
  ], ['Operations and the franchise of the area get one "Nobody has accepted a job in time". A job accepted in time never alerts.'], { tags: ['core'] }),
  T('REM-04', 'Extra work waiting a day', ['C1'], [
    'Send an extra-work request (EXT-03) and a developer ages it by 25 hours (<code>UPDATE job_extras SET updated_at = now() - interval \'25 hours\' WHERE status = \'PENDING_APPROVAL\'</code>).',
  ], ['C1 gets "Extra work is waiting for your decision" once.'], { tags: ['edge'] }),
  T('REM-05', 'Document expiry', ['C1'], [
    'Set an expiry 5 days ahead on one document (VLT-04) and a date 2 days in the past on another. Wait for the sweep.',
  ], ['C1 gets "A document is expiring" for the first ("expires in 5 days") and one for the second ("has expired"), each once. A document with a date 90 days away gets nothing.'], { tags: ['core'] }),
  T('REM-06', 'Plan ending', ['C1'], [
    'A developer sets an active plan to end in 6 days (<code>UPDATE subscriptions SET ends_on = current_date + 6 WHERE ref_code = \'S-...\'</code>).',
  ], ['C1 gets "Your plan is ending soon" ("in 6 days") once; again at 1 day. Never for a plan that has ended or is far away.'], { tags: ['edge'] }),
  T('REM-07', 'Running the sweep again does not repeat anything', ['C1'], [
    'Wait for two more sweeps.',
  ], ['No duplicate reminders appear in the bell or the terminal.'], { tags: ['core'] }),
]);

chapter('reports', 'Reports', '<p>Each role sees only its own numbers. Compare the figures with what you can count on the Jobs board and Orders.</p>', [
  T('RPT-01', 'Operations see everything', ['OPS1'], [
    'Open <b>Reports</b>. Look at the tiles, the two charts and the tables for the last 30 days.',
  ], ['Tiles: money received, jobs requested (with completed and cancelled), time to a provider accepting, share within the acceptance limit, time to do the work, customer rating, jobs still open. Tables: Providers and Busiest pincodes. Charts show a bar for each day and a "show the numbers" table.'], { tags: ['smoke', 'core'] }),
  T('RPT-02', 'The numbers add up', ['OPS1'], [
    'Count the jobs and paid orders you created today on the Jobs board and Orders. Compare with the tiles for "Last 7 days".',
  ], ['Jobs requested equals the jobs created in the period; money received equals the sum of the orders paid in the period (including extra-work orders); "still unpaid" equals the open orders\' total.'], { tags: ['core'] }),
  T('RPT-03', 'Choose the period', ['OPS1'], [
    'Press Last 7 days, 90 days, This month, and pick your own dates; try a first date after the last date; try a range longer than a year.',
  ], ['The page reloads with the chosen days. A backwards range or more than 366 days is refused with a message.'], { tags: ['core', 'edge'] }),
  T('RPT-04', 'A franchise sees only its area', ['FR1', 'FR2'], [
    'Open Reports as FR1 and FR2.',
  ], ['FR1 sees the figures for North (jobs, money, providers, pincodes). FR2 sees zeros for North\'s work. The label says "Your area".'], { tags: ['security', 'core'] }),
  T('RPT-05', 'A provider admin sees its organisation and workers, no money', ['PA1'], [
    'Open Reports as PA1.',
  ], ['Only Provider A\'s jobs, a table for its workers, and no money tiles or money chart. The label says "Your organisation".'], { tags: ['security', 'core'] }),
  T('RPT-06', 'A worker sees only their own jobs', ['WA1', 'WA2'], [
    'Open Reports as WA1 and as WA2.',
  ], ['WA1 sees their own totals and rating; WA2 sees only their own. No tables of other people, no money, no download button.'], { tags: ['security'] }),
  T('RPT-07', 'Download the jobs', ['OPS1', 'PA1', 'WA1', 'C1'], [
    'As OPS1 press <b>Download the jobs (spreadsheet)</b> and open the file. Do the same as PA1.', 'Try WA1 and C1.',
  ], ['A file with Reference, Service, Source, Status, Urgent, Created, Accepted, Work finished, Rating, Provider, Worker, Pincode. PA1\'s file holds only Provider A\'s jobs. Workers have no button and customers are refused.'], { tags: ['core', 'security'] }),
  T('RPT-08', 'A name that starts with = does not run', ['OPS1'], [
    'Give a service a name beginning with <code>=</code> (for example <code>=1+1</code>), make a job for it, download the file and open it in a spreadsheet.',
  ], ['The cell shows the text as typed (with a leading apostrophe), never a calculated value or a link.'], { tags: ['security'] }),
  T('RPT-09', 'Customers cannot open reports', ['C1'], [
    'Open <code>/admin/reports</code> as C1.',
  ], ['Refused.'], { tags: ['security'] }),
]);

chapter('earnings', 'Earnings and payouts', '<p>When a job is <b>closed</b>, the provider that did it, and the franchise and master franchise of its area, earn a percentage of what the customer paid for the job. MPD keeps the rest. Payouts are recorded outside the app and need a second admin.</p>', [
  T('ERN-01', 'Set the shares', ['OPS1'], [
    'Open <b>Earnings</b>. In "Shares of the job price" set the defaults: Service provider 70%, Franchise 10%, Master franchise 5%.',
    'Try to set Master franchise to 25% (70 + 10 + 25 is over 100).', 'Add a different share for one category (for example Provider 60%).',
  ], ['The defaults save and the screen says MPD keeps 15%. 25% is refused with a message that the three together can be at most 100%. A category share appears in its own table and can be removed (the default applies again).'], { tags: ['core', 'smoke'] }),
  T('ERN-02', 'A closed job earns the shares', ['C1', 'PA1', 'FR1', 'MF1'], [
    'Close a Tap repair job (Rs 1,000) by rating it (WRK-13). Wait up to 5 minutes (or just open Earnings).', 'Open Earnings as PA1, FR1 and MF1.',
  ], ['PA1 sees Rs 700 (70%), FR1 Rs 100 (10%), MF1 Rs 50 (5%), each "To be paid", with the job reference, the service, the percentage and the job price. Amounts are rounded down to whole paise.'], { tags: ['core', 'smoke'], note: 'Shares appear a few minutes after closing, or immediately when an earnings screen is opened.' }),
  T('ERN-03', 'Each organisation sees only its own', ['PA1', 'PB1', 'FR2', 'WA1', 'C1'], [
    'Open Earnings as PB1 and FR2; try it as WA1 and C1.',
  ], ['PB1 and FR2 see their own organisations at zero and nothing of Provider A\'s. A worker and a customer are refused (the provider pays its workers).'], { tags: ['security'] }),
  T('ERN-04', 'Approved extra work counts; cancelled jobs earn nothing', ['C1', 'OPS1'], [
    'Close a job that had Rs 400 of approved and paid extra work (EXT-05) and one that was cancelled.',
  ], ['The first earns on Rs 1,400 (provider Rs 980). The cancelled job and a job still open earn nothing.'], { tags: ['core', 'edge'] }),
  T('ERN-05', 'Changing a share never changes what was earned', ['OPS1'], [
    'Change the provider share to 50%. Look at the earnings made before; close another job.',
  ], ['Earlier earnings keep 70%; the new job earns 50%. Each earning shows the percentage it used.'], { tags: ['core'] }),
  T('ERN-06', 'Record a payout; a second admin approves', ['OPS1', 'OPS2', 'PA1'], [
    'As OPS1 on Provider A\'s card press <b>Record a payout</b>: how it was sent, a reference (invented), the date. Press Record.', 'Look at the Payouts table as OPS1, then as OPS2 and press <b>Approve</b>.',
  ], ['The payout covers everything unpaid for that organisation. As OPS1 there is no Approve (only Take back). After OPS2 approves, the earnings are "Paid", the balance cards move from "to be paid" to "paid", and PA1 gets "A payout was recorded for you".'], { tags: ['core', 'smoke'] }),
  T('ERN-07', 'Refuse or take back a payout', ['OPS1', 'OPS2'], [
    'Record a payout; as OPS2 press <b>Refuse</b> with a reason. Record another and press <b>Take back</b> as OPS1.', 'Try to take back as OPS2.',
  ], ['Refusing needs a reason; the earnings go back to "to be paid" and the reference can be used again. Only the person who recorded it can take it back.'], { tags: ['core', 'edge'] }),
  T('ERN-08', 'References cannot be reused while live', ['OPS1'], [
    'Record a payout for one organisation, and a payout with the same reference for another before the first is decided.',
  ], ['The second is refused ("a payout with that reference already exists").'], { tags: ['security'] }),
  T('ERN-09', 'Nothing to pay, and bad input', ['OPS1'], [
    'Record a payout for an organisation with nothing owed; enter a date in the future; enter a reference of 2 characters.',
  ], ['Each is refused with a clear message.'], { tags: ['edge'] }),
  T('ERN-10', 'Only operations record payouts and set shares', ['PA1', 'FR1', 'MF1'], [
    'Look for the record-payout buttons and the shares editor; open <code>/admin/earnings</code>.',
  ], ['Partners see only their balances, earnings and payouts; no record button, no shares editor.'], { tags: ['security'] }),
  T('ERN-11', 'A plan visit earns on its share of the plan', ['C1', 'PA1'], [
    'Close a job that came from a plan visit (PAY-15).',
  ], ['The base is the service\'s share of the plan (after the discounts) divided by its visits, not zero.'], { tags: ['edge'], note: 'Compare with the plan breakdown from PAY-13.' }),
]);

chapter('legal', 'Legal service forms (setup by operations)', '<p>The legal and professional services each need a form, a document checklist and progress steps before customers can ask for them (the customer screens arrive in the next step). Run <code>pnpm db:seed</code> first so the 44 services and the Wave 1 forms exist. The legal services are hidden from the website until operations switch them on.</p>', [
  T('LGL-01', 'The list of legal services', ['OPS1'], [
    'Open <b>Legal service forms</b> (menu group Operations).', 'Look at the groups and the table in each.',
  ], ['The services are listed by group (for example Property Transactions &amp; Documentation, Licenses &amp; Permits). Each row shows the service, <b>Version n</b> or <b>Not set up</b>, the number of questions and documents, and whether it is Active or Hidden on the website. The text at the top says how many services are set up.'], { tags: ['smoke', 'core'] }),
  T('LGL-02', 'Wave 1 services come with a first form', ['OPS1'], [
    'In the group <b>Property Transactions &amp; Documentation</b> find "Sale &amp; Purchase(Drafting Sale Deed)" and press the pencil.', 'Read the introduction, the questions, the documents and the progress steps.',
  ], ['It shows Version 1 with questions grouped under headings (The property, Seller, Buyer, The sale), documents such as the title documents and identity proofs (some required, some optional) and steps like Documents received, Draft prepared, Draft approved by you, Ready to sign, Completed. Every Wave 1 service has a version 1.'], { tags: ['core'], pre: ['The seed has been run.'] }),
  T('LGL-03', 'Edit and save a new version', ['OPS1'], [
    'In the dialog change the wording of one question, add a question, and press <b>Save as a new version</b>.', 'Close and open the same service again.', 'Look at the list.',
  ], ['A message says "Saved as version 2. New cases will use it." After reopening, your changes are there; the list shows Version 2. Saving again makes version 3 (versions are never edited).'], { tags: ['core', 'smoke'] }),
  T('LGL-04', 'The kinds of question', ['OPS1'], [
    'Add one question of each kind: a short answer, a paragraph, a number, a date, yes or no, and pick one option.', 'For the last, enter one option only and save; then add a second option.',
  ], ['With one option the save is refused ("needs at least two different options"). With two it saves. The same option typed twice counts once.'], { tags: ['core', 'edge'] }),
  T('LGL-05', 'Headings group the questions', ['OPS1'], [
    'Give three questions the heading "The seller" and two the heading "The buyer".', 'Add the same wording ("Full name") under both headings; then twice under the same heading.',
  ], ['The same wording is fine under two headings and refused under the same one ("is asked twice").'], { tags: ['edge'] }),
  T('LGL-06', 'Documents and progress steps are checked', ['OPS1'], [
    'Add two documents with the same name; set files up to 0 or 11; remove all but one progress step; give two steps the same name; add 13 steps.',
  ], ['Each is refused with a message that names the problem. Files per document must be 1 to 10; there must be 2 to 12 steps with different names. Nothing is saved after a refusal (the version number does not change).'], { tags: ['edge'] }),
  T('LGL-07', 'Move and remove', ['OPS1'], [
    'Use the up and down arrows on questions, documents and steps; remove one of each; save.',
  ], ['The order and the removals are kept in the saved version.'], { tags: ['core'] }),
  T('LGL-08', 'Limits', ['OPS1'], [
    'Try to add more than 60 questions, 30 documents or 12 steps.', 'Type a very long question (more than 200 characters).',
  ], ['The Add button stops at the limit; the wording is cut at 200 characters or refused.'], { tags: ['edge'] }),
  T('LGL-09', 'Search', ['OPS1'], [
    'Type "Gift" in the search box.',
  ], ['Only matching services remain; clearing the search shows all again.'], { tags: ['core'] }),
  T('LGL-10', 'Only operations set the forms up', ['FR1', 'MF1', 'PA1', 'WA1', 'C1'], [
    'Look for Legal service forms in each menu; open <code>/admin/legal-forms</code> directly.',
  ], ['Missing from the menu and refused for everyone except operations and the super admin.'], { tags: ['security'] }),
  T('LGL-11', 'Older versions are kept', ['OPS1', 'TESTER'], [
    'Save a service three times. (A developer can check the database: <code>SELECT version, jsonb_array_length(questions) FROM service_intake_forms WHERE service_id = ...</code>.)',
  ], ['Versions 1, 2 and 3 all exist exactly as saved. A case started later (next step) keeps the version it began with.'], { tags: ['edge'] }),
]);

chapter('legalreq', 'Legal requests (customer and operations)', '<p>The customer asks for a legal service; operations see what was sent. For a service to be offered, operations must set up its form (LGL-02 or LGL-03) and <b>switch the service on</b> in the Service catalogue (legal services are imported hidden). Use C1 and C2 and OPS1.</p>', [
  T('LGR-01', 'Switch a legal service on', ['OPS1'], [
    'In <b>Service catalogue</b> find "Sale &amp; Purchase(Drafting Sale Deed)" (group Legal) and make it <b>active</b>. Make sure it has a form (LGL-01).',
  ], ['The service is active. It is now offered to customers under Legal services; services without a form or still inactive are not.'], { tags: ['core'], pre: ['The seed has been run (SET-03).'] }),
  T('LGR-02', 'The customer finds and starts a legal service', ['C1'], [
    'Open <b>Legal services</b> in the menu. Search for "sale deed". If you have a property, choose it in "About which property". Press <b>Start</b>.',
  ], ['Only active services with a form are listed, grouped by heading, with a one-line description. Start opens the request page with a reference (L-XXXXXXXX), the introduction, the questions grouped under headings, the documents we need and the progress steps. It shows as "Not sent yet" and lists what is still missing.'], { tags: ['smoke', 'core'] }),
  T('LGR-03', 'Answers are saved as you go', ['C1'], [
    'Type an address, a price, pick a date and choose yes or no. Click away from each field. Reload the page.',
  ], ['A "Saved" note appears; after reloading the answers are still there. Optional questions may stay empty. Clearing an answer removes it.'], { tags: ['smoke', 'core'] }),
  T('LGR-04', 'Answers must fit the question', ['C1'], [
    'In a number field type words; in a date field type a date that does not exist (30 February); leave a required text only spaces; type over 500 characters in a short answer.',
  ], ['Each is refused with a message that names the question. Nothing is saved from a refused change.'], { tags: ['edge'] }),
  T('LGR-05', 'Give the documents', ['C1'], [
    'Under "Documents we need" press <b>Add a file</b> for each required item and choose a small PDF or photo. Press the name of a file to open it. Add files up to the limit shown for an item, then try one more.',
  ], ['Each file appears under its item with "n added". The name opens the file (a link that works for five minutes). Beyond the limit the Add button disappears (and the server refuses). The file is also in your vault, folder <b>Legal cases</b>, locked.'], { tags: ['core'] }),
  T('LGR-06', 'Only real files; no repeats', ['C1'], [
    'Add a text file renamed to .pdf; a file over 20 MB; the same file twice.',
  ], ['Each is refused with a clear message (not a real PDF, too large, already filed).'], { tags: ['security', 'edge'] }),
  T('LGR-07', 'Take a file back', ['C1'], [
    'Press the bin next to a file while the request is a draft.',
  ], ['The file disappears from the request and from the vault folder.'], { tags: ['core'] }),
  T('LGR-08', 'Sending needs everything required', ['C1'], [
    'With something still missing, look at the "Send to our team" button and the list above it. Try to send anyway by completing all but one item.',
  ], ['The button is disabled while anything required is missing and the list names each missing question and document.'], { tags: ['core'] }),
  T('LGR-09', 'Send it', ['C1', 'OPS1'], [
    'Complete everything and press <b>Send to our team</b>. As OPS1 look at the bell.',
  ], ['The request becomes "Sent to our team" and read-only. C1 gets "We have your legal request"; OPS1 (and every super admin) gets "A new legal request". The answers and documents can no longer be changed or removed.'], { tags: ['smoke', 'core'] }),
  T('LGR-10', 'Withdraw or discard', ['C1'], [
    'On a draft press <b>Discard</b>. On a sent request press <b>Withdraw this request</b>.',
  ], ['A draft or a sent request becomes "Withdrawn" and read-only. The documents stay in your vault and are no longer locked (you can manage them). A withdrawn request cannot be sent.'], { tags: ['core'] }),
  T('LGR-11', 'The form version is kept', ['OPS1', 'C1'], [
    'C1 starts a request. OPS1 saves a new version of that service form with different questions (LGL-03). Reload C1\'s request; then C1 starts another one.',
  ], ['The first request still shows the old questions; the new one shows the new questions.'], { tags: ['edge'] }),
  T('LGR-12', 'Drafts are private', ['OPS1', 'C2'], [
    'With a draft open as C1, look at <b>Legal requests</b> as OPS1; try C1\'s request address as C2.',
  ], ['OPS1 does not see the draft (only sent requests). C2 sees "not found".'], { tags: ['security', 'smoke'] }),
  T('LGR-13', 'Operations read what was sent', ['OPS1'], [
    'Open <b>Legal requests</b>. Filter "Waiting for review" and "Withdrawn". Press Open on a request. Press a document name.',
  ], ['The list shows the request, the customer, when it was sent and its status. The dialog shows the customer\'s name and contact, every answer (with its heading) and each document; a document opens through a short link.'], { tags: ['core'] }),
  T('LGR-14', 'Only operations see the requests', ['FR1', 'PA1', 'WA1', 'C1'], [
    'Look for Legal requests in each menu; open <code>/admin/legal-requests</code>.',
  ], ['Missing and refused for everyone but operations and the super admin.'], { tags: ['security'] }),
  T('LGR-15', 'Too many unfinished drafts', ['C1'], [
    'Start more than 20 requests without sending or discarding them (you can use one service repeatedly).',
  ], ['After 20 unfinished requests a message asks you to finish or withdraw some first.'], { tags: ['edge'], note: 'Discard the drafts afterwards.' }),
  T('LGR-16', 'A request about a property that is not yours', ['C1', 'C2'], [
    'Start a request choosing a property; check that only your own properties are offered.',
  ], ['Only your own properties are in the list; the server refuses anyone else\'s.'], { tags: ['security'] }),
]);

chapter('legaloffer', 'Legal requests: review and the priced offer', '<p>Operations review a request that C1 sent (LGR-09) and send a price; C1 accepts and pays. Use OPS1, OPS2 (second person for the payment), C1 and C2.</p>', [
  T('LGO-01', 'Ask the customer for more', ['OPS1', 'C1'], [
    'As OPS1 open <b>Legal requests</b>, press Open on a request that was sent, press <b>Ask for more</b>, write what is missing (at least five characters) and press <b>Ask the customer</b>. As C1 look at the bell and open the request.',
  ], ['The status is "Waiting for the customer". C1 gets "We need a little more for your legal request"; the request page shows what was asked in a notice and the request is <b>editable again</b> with the missing list and the Send button.'], { tags: ['core', 'smoke'] }),
  T('LGO-02', 'The customer adds it and sends again', ['C1', 'OPS1'], [
    'As C1 add the missing document or answer and press <b>Send to our team</b> again. As OPS1 look at the bell and the request.',
  ], ['The status returns to "Waiting for review"; OPS1 gets "A new legal request" again; the history reads: sent, we asked for more, you sent it again.'], { tags: ['core'] }),
  T('LGO-03', 'Send an offer', ['OPS1', 'C1'], [
    'As OPS1 press <b>Send an offer</b>. Add three lines: Professional fee "Drafting the sale deed" 5000, Government fee "Registration fee" 1500, Stamp duty "Stamp duty" 2000. Add a discount of 500 with the reason "Existing customer". Open for 14 days. Press <b>Send the offer</b>.',
  ], ['The screen shows the total (Rs 8,000) before sending, and after sending the offer shows each line, the discount, the total, and "Open until" the date 14 days ahead. The status is "Offer sent". C1 gets "Your legal request has a price".'], { tags: ['smoke', 'core'] }),
  T('LGO-04', 'The offer is checked', ['OPS1'], [
    'Try to send an offer with: no lines; only a government fee (no professional fee); an amount of 0; a discount with no reason; a discount as large as all the lines; 0 days or 31 days; two identical lines.',
  ], ['Each is refused with a message naming the problem. Nothing changes after a refusal.'], { tags: ['edge'] }),
  T('LGO-05', 'Change an open offer', ['OPS1', 'C1'], [
    'On a request with an open offer press <b>Change the offer</b>, remove a line and send.',
  ], ['The new offer replaces the old one (version 2); the customer sees only the new one; the history shows "offer revised". Only one offer is ever open.'], { tags: ['core'] }),
  T('LGO-06', 'The customer sees the offer', ['C1'], [
    'Open the request as C1.',
  ], ['An "Our offer" table: each line with its kind (Professional fee, Government fee, Stamp duty), a discount line with its reason, the total to pay, the last day, a note if any, and the buttons <b>Accept and pay</b> and <b>Decline</b>.'], { tags: ['core'] }),
  T('LGO-07', 'Accept and get an order', ['C1', 'OPS1', 'OPS2'], [
    'As C1 press <b>Accept and pay</b>. Open <b>Orders</b>. As OPS1 record the payment for that order (PAY-06) and as OPS2 approve it (PAY-08).',
  ], ['The request is "Accepted" with a notice naming order O-XXXXXXXX that waits for payment. Under Orders there is a new order for the exact total, with one line per fee. After approval the order is Paid and the request page says it is paid. OPS1 and the super admins got "A legal offer was accepted". Accepting again is refused.'], { tags: ['smoke', 'core'] }),
  T('LGO-08', 'A request that is not about a property', ['C1'], [
    'Start a request without choosing a property, get an offer and accept it. Open Orders.',
  ], ['The order is made and listed as "Legal service" (no property). It can be paid and cancelled like any order.'], { tags: ['edge'] }),
  T('LGO-09', 'Decline the offer', ['C1', 'OPS1'], [
    'On another offer press <b>Decline</b> and write a note.',
  ], ['The request is "Declined" with the note; OPS1 gets "A legal offer was declined". The offer cannot be accepted any more and operations cannot review the request again.'], { tags: ['core'] }),
  T('LGO-10', 'An offer expires', ['OPS1', 'C1'], [
    'Send an offer. A developer sets its last day in the past (<code>UPDATE legal_offers SET valid_until = current_date - 3 WHERE status = \'SENT\'</code>). As C1 reload the request and try to accept.',
  ], ['The offer shows as Expired and the Accept button is gone. Operations can send a new offer, which can be accepted.'], { tags: ['edge'] }),
  T('LGO-11', 'We cannot take it', ['OPS1', 'C1'], [
    'On a request press <b>We cannot take it</b> and write a reason.',
  ], ['The request is "We cannot take it" and C1 sees the reason on the page and in a notification. It cannot be edited, offered or asked about any more.'], { tags: ['core'] }),
  T('LGO-12', 'Withdraw while an offer is open; cancel the order after accepting', ['C1'], [
    'Withdraw a request that has an open offer. On another accepted request (order unpaid) try Withdraw, then cancel its order under Orders.',
  ], ['Withdrawing with an open offer works and the offer is withdrawn too. After accepting, Withdraw is refused and says to cancel the order; cancelling the order closes the request ("The order was cancelled").'], { tags: ['edge'] }),
  T('LGO-13', 'Only operations review; only the buyer accepts', ['FR1', 'PA1', 'C2', 'OPS1'], [
    'Look for the review buttons as FR1 and PA1 (and the Legal requests page). As C2 open C1\'s request address. As OPS1 try to accept for C1 (API page).',
  ], ['No review buttons or page for franchises and providers; C2 sees "not found"; OPS1 is refused when accepting (only the customer can).'], { tags: ['security'] }),
  T('LGO-14', 'The history', ['C1', 'OPS1'], [
    'Open a request that went through several steps as C1 and as OPS1.',
  ], ['A dated history in order (sent, asked for more, sent again, offer, accepted...). The customer sees plain wording; operations see the notes and who acted in the audit log.'], { tags: ['core'] }),
  T('LGO-15', 'Filters', ['OPS1'], [
    'On Legal requests use the status filter: waiting for review, waiting for the customer, offer sent, accepted, declined, refused, withdrawn.',
  ], ['Each shows only requests in that state; "Every sent request" shows all but drafts.'], { tags: ['core'] }),
]);

chapter('legalcase', 'Legal cases and the legal pool', '<p>After C1 accepted an offer (LGO-07) and the order is paid and approved, a case opens. You need: OPS1 and OPS2 (second person for the payment), FR1 (franchise of the area), two legal providers PA1 and PA2 that cover the area and offer the legal service (tick it under their organisation\'s Services; operations must have switched the service on), PA3 (a provider that does not offer it or covers another area), C1 and C2. The case appears within ten minutes, or at once when someone opens Legal cases.</p>', [
  T('LGC-01', 'A paid order opens a case', ['OPS1', 'C1', 'PA1'], [
    'After LGO-07 (and its payment approved) open <b>Legal cases</b> as OPS1. Look at C1\'s request page. As PA1 look at the bell.',
  ], ['A case LC-XXXXXXXX is "In the pool" with the area and the order total. C1\'s request page shows "Finding your legal partner"; C1 was told "We are finding your legal partner". PA1 and PA2 were told "A new legal case is waiting in your pool"; PA3 was not.'], { tags: ['smoke', 'core'] }),
  T('LGC-02', 'No case before the payment is approved', ['C1', 'OPS1'], [
    'Accept an offer but do not pay (or only record the payment without approving it). Open Legal cases as OPS1.',
  ], ['No case exists. If the customer cancels the unpaid order there is never a case.'], { tags: ['edge'] }),
  T('LGC-03', 'The pool hides the customer', ['PA1', 'PA3'], [
    'As PA1 open <b>Legal cases &rarr; My pool</b>, open the case. As PA3 look at My pool.',
  ], ['PA1 sees the service, the area, the order total and the 24-hour limit, but <b>not who the customer is</b>, and no answers, documents or messages. PA3 does not see the case at all.'], { tags: ['smoke', 'security'] }),
  T('LGC-04', 'The first provider to accept wins', ['PA1', 'PA2'], [
    'PA1 and PA2 both press <b>Accept</b> (as close together as you can).',
  ], ['One succeeds ("Accepted. It is yours now."); the other is told another provider already has it and the case disappears from its pool. C1 is told who took it.'], { tags: ['smoke', 'core'] }),
  T('LGC-05', 'The provider sees the request and documents', ['PA1', 'C1'], [
    'As the provider that won open the case. Press a document name.',
  ], ['The customer\'s name and contact, every answer and each document are shown; the document opens in a new tab (the link works for five minutes). The price discussion (offer and discount) is not shown to the provider.'], { tags: ['core', 'security'] }),
  T('LGC-06', 'Turn a case down', ['PA2'], [
    'On a new case as PA2 press <b>Open</b> then <b>Turn it down</b> with a reason.',
  ], ['The case disappears from PA2\'s pool but stays in the others\'. PA2 cannot accept it later.'], { tags: ['core'] }),
  T('LGC-07', 'Work has begun', ['PA1', 'C1'], [
    'As the provider that has a case press <b>Work has begun</b>.',
  ], ['The status is "In progress"; C1\'s request page says "Work in progress" and C1 was told. The buttons Give it back and Work has begun disappear.'], { tags: ['core'] }),
  T('LGC-08', 'Give a case back', ['PA1', 'PA2', 'OPS1'], [
    'On an accepted case (work not begun) PA1 presses <b>Give it back</b> with a reason. Check My pool for PA1 and PA2.',
  ], ['The case is "In the pool" again for PA2 (not for PA1, who gave it back); operations are told with the reason; the customer is not.'], { tags: ['edge'] }),
  T('LGC-09', 'Only eligible providers can take it', ['PA3'], [
    'As PA3 try to open the case through its address (or ask a developer to call accept).',
  ], ['It is refused or not found: the provider must be active with staff, cover the pincode and offer the service.'], { tags: ['security'] }),
  T('LGC-10', 'Nudge and give to a provider', ['FR1', 'OPS1', 'PA1'], [
    'On a case nobody has taken, as FR1 press <b>Nudge providers</b>, then choose a provider under <b>Give it to a provider</b>, write a reason and press Give it.',
  ], ['The providers get "A legal case is still waiting for a provider". Only providers that offer the service and cover the area are listed. After giving it the case is Accepted by that provider, who is told, and C1 is told who has it.'], { tags: ['core'] }),
  T('LGC-11', 'A request with no area', ['C1', 'OPS1', 'PA1'], [
    'Make a legal request that is not about a property, get the offer, accept and pay. Open Legal cases as OPS1, then as FR1 and PA1.',
  ], ['The case shows "No area" and operations are told. It is in nobody\'s pool, FR1 cannot see it, PA1 cannot accept it. OPS1 lists every live provider that offers the service and gives it to one; that provider then sees the request.'], { tags: ['edge'] }),
  T('LGC-12', 'Nobody takes it in time', ['OPS1', 'FR1'], [
    'A developer sets the limit in the past (<code>UPDATE legal_cases SET sla_due_at = now() - interval \'1 hour\' WHERE status = \'OPEN\'</code>) and waits up to ten minutes (or opens Legal cases).',
  ], ['The case shows Overdue; OPS1 and FR1 get "Nobody has taken a legal case in time" once.'], { tags: ['edge'] }),
  T('LGC-13', 'Messages with the customer', ['C1', 'PA1', 'FR1', 'C2'], [
    'Before a provider has the case C1 tries to write. After PA1 accepted, C1 and PA1 exchange messages. FR1 opens the case. C2 tries C1\'s case address.',
  ], ['Before: "Messages open once a legal partner has taken the case". After: both see each other\'s messages; C1 sees the provider by first name only; a new message sends one notification until it is read. FR1 can read but not write; C2 gets "not found".'], { tags: ['core', 'security'] }),
  T('LGC-14', 'Cancel a case', ['OPS1', 'PA1', 'C1'], [
    'As PA1 look for a Cancel button. As OPS1 press <b>Cancel the case</b> with a reason on an accepted case.',
  ], ['PA1 has no Cancel button. After OPS1 cancels, the case is Cancelled, C1 and PA1 are told, the messages are closed and no button works any more.'], { tags: ['edge', 'security'] }),
  T('LGC-15', 'Who sees which cases', ['PA1', 'PA2', 'FR1', 'FR2', 'MF1', 'OPS1'], [
    'Open the <b>All cases</b> tab as each person.',
  ], ['Providers see only cases they hold; the franchise sees cases in its area; the master franchise those in its city; another franchise sees none of them; operations see all.'], { tags: ['security'] }),
]);

chapter('legalwork', 'Doing a legal case: steps, delivery, completion, rating', '<p>Continue from a case that PA1 has accepted (LGC-04). You need: PA1 (the provider that holds the case), PA2 (another legal provider), OPS1, FR1, C1 (the customer) and C2 (another customer). The service must have progress steps (Legal service forms).</p>', [
  T('LGP-01', 'Nothing before work has begun', ['PA1'], [
    'On an accepted case (work not begun) open it as PA1.',
  ], ['There is no Progress section with buttons: no step can be ticked and no document delivered, and the customer sees no steps yet.'], { tags: ['edge'] }),
  T('LGP-02', 'Work has begun: the steps appear', ['PA1', 'C1'], [
    'Press <b>Work has begun</b>. Open the case again. As C1 open the request page.',
  ], ['The case lists the steps of the service in order, none ticked, with the button Tick the next step. C1 sees the same steps under Your legal case.'], { tags: ['smoke', 'core'] }),
  T('LGP-03', 'Tick the steps in order', ['PA1', 'C1'], [
    'Press <b>Tick the next step</b> twice, then <b>Take back the last step</b>, then tick again until all are ticked.',
  ], ['Steps are ticked one at a time in order, with the time. Taking back un-ticks only the last one. C1 sees each change and got one notification per tick. After the last step the Tick button is gone.'], { tags: ['smoke', 'core'] }),
  T('LGP-04', 'Deliver a document', ['PA1', 'C1'], [
    'Under Documents for the customer type a name, choose a PDF or photo and press <b>Deliver</b>. As C1 open Documents in the vault and the request page.',
  ], ['The document is listed on the case. C1 got "A document was added to your vault"; it is in C1\'s vault, folder Legal cases, with the name given, and opens from the request page. C1 cannot delete it from the vault ("cannot be changed or removed").'], { tags: ['smoke', 'core'] }),
  T('LGP-05', 'Bad or repeated files', ['PA1'], [
    'Deliver the same file twice. Deliver a file that is not a PDF or image.',
  ], ['The same file again is refused ("already filed"). A file type that is not allowed is refused. Nothing is added.'], { tags: ['edge'] }),
  T('LGP-06', 'Take a wrong document back', ['PA1', 'C1'], [
    'Press the bin next to a delivered document and confirm.',
  ], ['It disappears from the case and from C1\'s vault and request page.'], { tags: ['edge'] }),
  T('LGP-07', 'Complete needs everything', ['PA1'], [
    'With a step still unticked press Complete the case (the button is off, and a hint says what is missing). Then tick all steps but deliver nothing.',
  ], ['The button stays off until every step is ticked and at least one document is delivered. Calling it anyway is refused.'], { tags: ['edge'] }),
  T('LGP-08', 'Complete the case', ['PA1', 'C1'], [
    'Tick every step, deliver a document and press <b>Complete the case</b>, then confirm. As C1 open the request page.',
  ], ['The status is Complete, with the date. No tick, deliver or complete button is left. C1 was told "Your legal case is complete" and sees a rating form.'], { tags: ['smoke', 'core'] }),
  T('LGP-09', 'The customer rates once', ['C1', 'PA1', 'C2'], [
    'As C1 pick 4 stars, write a few words and press Send my rating. Try to rate again. As PA1 open the case. As C2 try C1\'s case address.',
  ], ['C1 sees "You rated this 4 of 5". A second rating is refused. PA1 sees the rating and its note and was told. C2 gets "not found".'], { tags: ['core', 'security'] }),
  T('LGP-10', 'Only the holder can do the work', ['PA2', 'OPS1', 'FR1', 'C1'], [
    'As PA2, OPS1, FR1 and C1 look for the steps, delivery and Complete buttons of PA1\'s case, or ask a developer to call tick, deliver and complete as each.',
  ], ['PA2 gets "not found". OPS1, FR1 and C1 are refused (they can read the case but not do the work). Only PA1 can tick, deliver and complete.'], { tags: ['security'] }),
  T('LGP-11', 'A completed case is final', ['PA1', 'OPS1'], [
    'On a completed case look for Cancel (OPS1) and for any button on the progress section (PA1).',
  ], ['Operations cannot cancel it; the provider cannot tick, take back, deliver or complete again. The messages stay open so the customer can still ask a question.'], { tags: ['edge'] }),
  T('LGP-12', 'Cancel a case in progress', ['OPS1', 'PA1', 'C1'], [
    'On a case with work begun but not complete, OPS1 presses Cancel the case with a reason.',
  ], ['The case is Cancelled; PA1 and C1 are told; PA1 can no longer tick or deliver; documents already delivered stay in C1\'s vault.'], { tags: ['edge'] }),
]);

chapter('legalearn', 'Earnings for legal cases', '<p>Continue from completed legal cases (LGP-08). You need: OPS1 and OPS2 (second person for payouts), FR1, MF1, PA1 (the provider that completed the case), PB1 (another provider) and the shares set under Earnings (for example 10% master franchise, 20% franchise, 50% provider for the service category). Earnings appear within five minutes of completion, or at once when someone opens Earnings.</p>', [
  T('LGE-01', 'Nothing before completion', ['OPS1'], [
    'With a legal case in progress (not complete) open <b>Earnings</b> as OPS1 and look for its reference.',
  ], ['No earning exists for it, even if every step is ticked and a document is delivered.'], { tags: ['edge'] }),
  T('LGE-02', 'A completed case earns every level', ['OPS1', 'PA1', 'FR1', 'MF1'], [
    'Complete a legal case whose offer had a professional fee of 5,000, a government fee of 2,000, a courier charge of 1,000 and a discount of 500. Open Earnings as OPS1.',
  ], ['Three rows with the case reference and "(legal case)": the base is 5,500 (fee plus courier less discount; the government fee is left out). With 50%, 20% and 10%: provider 2,750, franchise 1,100, master franchise 550. Status "to be paid".'], { tags: ['smoke', 'core'] }),
  T('LGE-03', 'Government fees and stamp duty earn nothing', ['OPS1'], [
    'Complete a case whose offer has only a government fee and stamp duty plus a small professional fee. Check the base shown.',
  ], ['The base is only the professional fee and other charges, less the discount. If nothing is left no earning is made.'], { tags: ['edge'] }),
  T('LGE-04', 'Each organisation sees its own share', ['PA1', 'PB1', 'FR1', 'C1'], [
    'Open Earnings as PA1, PB1, FR1 and C1.',
  ], ['PA1 sees only the provider share, FR1 only the franchise share, PB1 sees nothing of this case, and C1 cannot open Earnings.'], { tags: ['security'] }),
  T('LGE-05', 'Earned once only', ['OPS1'], [
    'Open Earnings several times, and wait for the five-minute sweep.',
  ], ['The same three rows; nothing is added twice.'], { tags: ['edge'] }),
  T('LGE-06', 'A cancelled case earns nothing', ['OPS1'], [
    'Cancel a case that is in progress and open Earnings.',
  ], ['No earning for it, even if some steps were ticked.'], { tags: ['edge'] }),
  T('LGE-07', 'A case with no area pays only the provider', ['OPS1', 'PA1'], [
    'Complete a case that was not about a property (given to PA1 by operations). Open Earnings.',
  ], ['Only the provider share exists (there is no franchise or master franchise to pay).'], { tags: ['edge'] }),
  T('LGE-08', 'The share goes into a payout', ['OPS1', 'OPS2', 'PA1'], [
    'As OPS1 record a payout for PA1 covering these earnings, then approve it as OPS2.',
  ], ['The legal earning moves to "in a payout" and then "paid" like a job earning; the maker cannot approve their own payout.'], { tags: ['core'] }),
]);
