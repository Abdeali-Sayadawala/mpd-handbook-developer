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
