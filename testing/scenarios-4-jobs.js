/* Scenarios, part 4: the job pool, doing the work, extra work and messages. */
chapter('pool', 'Job pool and dispatch', '<p>A paid service becomes a job in a pool. Every eligible provider (covers the pincode, offers the service, live with staff) sees it; the <b>first to accept wins</b>. You need PA1 and PB1 signed in at once, in two sessions.</p>', [
  T('JOB-01', 'A paid service becomes a job', ['C1', 'OPS1', 'PA1'], [
    'After PAY-08 (Tap repair paid) look at the customer\'s Service requests, then the Jobs board of OPS1 and of PA1 (tab <b>My pool</b>).',
  ], ['C1 sees "We are finding a provider for you". OPS1 sees it under All jobs. PA1 sees it in My pool, with the area, the property type and size, but <b>no customer name, phone or full address</b>.', 'PA1 also got a notification "A new job is waiting in your pool".'], { tags: ['smoke', 'core'] }),
  T('JOB-02', 'Privacy before acceptance', ['PA1', 'WA1'], [
    'Open the job in the pool as PA1. Look for the customer details.',
  ], ['The dialog says the customer\'s name, phone and full address appear after a provider accepts. Workers cannot see pool jobs at all.'], { tags: ['security', 'smoke'] }),
  T('JOB-03', 'Only eligible providers see it', ['PA1', 'PB1', 'FR1'], [
    'Make a job for <b>Water tank cleaning</b> (PB1\'s provider does not offer it).', 'Look at My pool for PA1 and PB1.', 'Switch off Tap repair for Provider A (ORG-07) and look again for a Tap repair job.',
  ], ['Water tank cleaning appears for PA1 only. With Tap repair switched off for A, A no longer sees Tap repair jobs. A provider with no staff or inactive is never offered jobs.'], { tags: ['core', 'security'] }),
  T('JOB-04', 'First to accept wins', ['PA1', 'PB1'], [
    'With a Tap repair job in the pool, open it as PA1 and PB1 in two sessions.', 'Press <b>Accept</b> in both at almost the same moment.',
  ], ['Exactly one gets "Accepted. It is yours now." The other is told another provider already has it. The job shows the winner\'s name.'], { tags: ['core', 'smoke'] }),
  T('JOB-05', 'After accepting, the customer is shown', ['PA1', 'C1'], [
    'As PA1 open the accepted job. As C1 look at the request and the bell.',
  ], ['PA1 now sees the customer name, phone and address. C1 sees "A provider has taken your request" and a notification.'], { tags: ['core'] }),
  T('JOB-06', 'Turn down and give back', ['PA1', 'PB1'], [
    'On a new job press <b>Turn down</b> as PB1 (optional reason).', 'On an accepted job press <b>Give back</b> as PA1 with a reason.',
  ], ['Turning down hides the job for that provider only and keeps it in the pool for others. Giving back returns an accepted job to the pool (and removes a worker assignment).'], { tags: ['core'] }),
  T('JOB-07', 'Assign a worker', ['PA1', 'WA1', 'WA2'], [
    'As PA1 on the accepted job open the worker list. Look at who is offered.', 'Choose WA1 and assign.', 'Change to WA2, then back.',
  ], ['Only active workers of Provider A who can do this service are offered (for Water tank cleaning only WA1). The worker gets "A new job for you". The worker can be changed until the work starts.'], { tags: ['core', 'smoke'] }),
  T('JOB-08', 'The acceptance limit and Overdue', ['OPS1'], [
    'Leave a job in the pool past 2 hours (30 minutes for urgent). If you cannot wait, ask a developer to set <code>sla_due_at</code> to the past for that job.',
  ], ['The job shows <b>Overdue</b>. Within 10 minutes operations and the franchise of the area get "Nobody has accepted a job in time" (once).'], { tags: ['core'], note: 'Developer help: <code>UPDATE jobs SET sla_due_at = now() - interval \'1 hour\' WHERE ref_code = \'J-...\'</code>' }),
  T('JOB-09', 'The upline nudges the providers', ['MF1', 'FR1', 'PA1'], [
    'As FR1 open a pool job and press <b>Ask providers to take it</b> with a note. Try again at once.', 'As PA1 look at the bell.',
  ], ['The first nudge works and PA1 gets "A job is still waiting for a provider" with the note. A second nudge within 15 minutes is refused ("reminded a moment ago").'], { tags: ['core', 'edge'] }),
  T('JOB-10', 'The upline gives the job to a provider', ['FR1', 'OPS1'], [
    'On a pool job choose an eligible provider and press <b>Assign</b>; leave the reason empty, then write one.',
  ], ['A reason is required (at least a few characters). Afterwards the job belongs to that provider; the history shows who and why. A provider that is not eligible is not in the list.'], { tags: ['core'] }),
  T('JOB-11', 'Franchise and master franchise see their area only', ['FR1', 'FR2', 'MF1'], [
    'Open the Jobs board as FR1, FR2 and MF1.',
  ], ['FR1 sees the jobs in North pincodes; FR2 sees none of those; MF1 sees the whole city. None can cancel a job.'], { tags: ['security'] }),
  T('JOB-12', 'Operations cancel a job that has not started', ['OPS1', 'C1'], [
    'On a job that has not started press <b>Cancel the job</b> and write why. Try the same on a job that has started.',
  ], ['The job is cancelled with the reason in its history (a plan visit goes back into the customer\'s plan). A job that has started cannot be cancelled.'], { tags: ['core', 'edge'] }),
  T('JOB-13', 'A customer cancels a plan visit', ['C1'], [
    'Request a visit from a plan and cancel it before a worker starts.', 'Try to cancel a service you paid for (not a plan visit).',
  ], ['The plan visit is given back ("1 of 2 left" again). A paid service cannot be cancelled by the customer ("Contact us").'], { tags: ['edge'] }),
  T('JOB-14', 'The job history', ['PA1', 'OPS1'], [
    'Open a job and look at its history.',
  ], ['Every move shows who, what and when (created, accepted, assigned, nudged, and so on).'], { tags: ['core'] }),
]);

chapter('work', 'Doing the work', '<p>The worker goes, the customer shows <b>codes</b> on their own screen, the worker does the checklist and photos, and the provider checks. You need C1 (customer), WA1 (worker) and PA1 (provider) in three sessions; use the phone view for WA1.</p>', [
  T('WRK-01', 'My day for the worker', ['WA1'], [
    'Sign in as WA1 on a phone (or phone view). Open <b>My day</b>.',
  ], ['A one-column list of your jobs: today\'s first, with the address, a Directions button, a Call button and the next step in words ("Tell the customer you are on the way"). Buttons are large. The list refreshes by itself.'], { tags: ['smoke', 'core'], pre: ['A job is assigned to WA1 (JOB-07).'] }),
  T('WRK-02', 'The provider sets the visit time', ['PA1', 'C1'], [
    'As PA1 open the job and set a visit time in the future ("Set time"). Try a time in the past.',
  ], ['The future time saves; the customer sees "visit planned" and gets "Your visit time is set" in the bell, shown in the customer\'s own time zone (for example New York). A past time is refused.'], { tags: ['core'] }),
  T('WRK-03', 'On the way', ['WA1', 'C1'], [
    'As WA1 press <b>I am on the way</b>.',
  ], ['The status is "On the way"; C1 sees it and is notified "Your worker is on the way".'], { tags: ['core'] }),
  T('WRK-04', 'The worker cannot attend', ['WA1', 'PA1'], [
    'On a job before it starts press the cannot-attend button with a reason.',
  ], ['The job goes back to the provider (no worker), PA1 gets "A worker cannot attend" with the reason and picks another.'], { tags: ['edge'] }),
  T('WRK-05', 'Start with the customer\'s code', ['C1', 'WA1'], [
    'As C1 open the request and press <b>Show my start code</b>. Read the 6 digits.', 'As WA1 open the job and enter the code to start.',
  ], ['The job becomes <b>In progress</b>. The code works for 10 minutes. The worker never sees the code unless told by the customer.'], { tags: ['smoke', 'core'] }),
  T('WRK-06', 'Wrong, expired and reused codes', ['WA1', 'C1'], [
    'Enter a wrong code five times.', 'Ask for a new code; wait 11 minutes; try it.', 'Use a code a second time.',
  ], ['Each wrong code says how many tries are left; after five the code is dead and a new one is needed. An old code says there is no valid code. A used code cannot be used again. Asking for more than 5 codes in an hour is refused.'], { tags: ['security', 'edge'] }),
  T('WRK-07', 'Operations start without a code, with a reason', ['OPS1'], [
    'On a job press <b>Start without a code</b>; try a reason of fewer than 10 characters, then a real reason.',
  ], ['A short reason is refused. With a reason it works and is recorded with your name in the history. A worker, provider or franchise has no such button.'], { tags: ['security', 'core'] }),
  T('WRK-08', 'The checklist and photos', ['WA1'], [
    'Open the job in progress. See the checklist (the version from CAT-03). Answer the steps: tick, number, choice.', 'Press <b>Take or choose a photo</b>: choose Before the work, then After the work, and a photo for a step. Allow location if asked.',
  ], ['Each answer saves; a number must be a number; a pick-one must be one of the options. Photos are listed with the time (and place if allowed). The same photo twice is refused.'], { tags: ['core'] }),
  T('WRK-09', 'Finishing is blocked until everything required is done', ['WA1'], [
    'Try to finish with a required step unanswered, a step photo missing, and no after photo.',
  ], ['The screen lists what is missing ("Before you can finish: ...") and finishing is refused until it is all done.'], { tags: ['core', 'edge'] }),
  T('WRK-10', 'Finish with the customer\'s second code', ['C1', 'WA1'], [
    'As C1 press <b>Show my finish code</b>. As WA1 enter it and finish (add a short summary).',
  ], ['The job is "Work done". C1 and PA1 get notifications ("The work is done", "Work to check").'], { tags: ['smoke', 'core'] }),
  T('WRK-11', 'The provider checks or sends it back', ['PA1', 'WA1'], [
    'As PA1 open the job and press <b>Send back</b> with a reason. As WA1 finish again with a new code. As PA1 press <b>Verify</b>.',
  ], ['Sent back: the worker is told the reason and the job returns to In progress. Verified: the job is "Checked" and the customer can rate.'], { tags: ['core'] }),
  T('WRK-12', 'A site visit is finished with corrections', ['WA1', 'C1'], [
    'Run a paid Site visit job. As WA1 start it with the customer\'s code, then finish: fill the corrections (address, pincode, area) and the findings.',
  ], ['Finishing records the findings and corrections and <b>verifies the property</b> (as in SV-02). Operations cannot finish a site visit that has not been recorded.'], { tags: ['core'] }),
  T('WRK-13', 'The customer rates; the job closes', ['C1'], [
    'On the checked job press a rating from 1 to 5.', 'Try to rate again.',
  ], ['The job is Completed and shows the rating. A second rating is refused. The provider can also close a checked job.'], { tags: ['core', 'smoke'] }),
  T('WRK-14', 'The customer sees what was done', ['C1'], [
    'Open <b>What was done, and photos</b> on the request; then the vault\'s property folder Job evidence.',
  ], ['The checklist and answers and the before/after photos are shown. The photos are also in the vault, locked (cannot be edited or deleted by the owner) and open through 5-minute links.'], { tags: ['core'] }),
  T('WRK-15', 'Not your job', ['WA2', 'WB1', 'C2'], [
    'Open the address of a job that belongs to WA1 as WA2, WB1 and C2.',
  ], ['Each gets "not found". Nobody can start, finish or see a job that is not theirs.'], { tags: ['security', 'smoke'] }),
  T('WRK-16', 'Once started, a job cannot be cancelled or released', ['PA1', 'OPS1'], [
    'Try to Give back, reassign or Cancel a job that is In progress.',
  ], ['Refused with a message ("only before the work starts").'], { tags: ['edge', 'security'] }),
  T('WRK-17', 'Install the app on a phone', ['WA1'], [
    'In Chrome on an Android phone open the staff login, sign in, open the browser menu and choose <b>Add to Home screen</b> / <b>Install app</b>.', 'Open it from the home screen.',
  ], ['It opens full screen without the address bar, at My day, with the MPD icon.'], { tags: ['core'], note: 'On iPhone use Share, then Add to Home Screen.' }),
]);

chapter('extra', 'Extra work', '<p>When more work is needed the worker asks, with photos and a reason; a large one is checked by the provider; the customer approves and pays; only then does the work continue. The job price here is Rs 1,000 (Tap repair).</p>', [
  T('EXT-01', 'The worker raises extra work', ['WA1'], [
    'On a job in progress press <b>More work is needed</b>. Enter a title, a reason (10+ characters) and one item (name, how many, price of one in rupees). Press <b>Save, then add photos</b>.', 'Add a photo; then press <b>Send for approval</b>.',
  ], ['A draft is made; sending without a photo is refused ("Add at least one photo..."). After sending, the job is <b>Waiting for extra payment</b> and the worker cannot finish or continue.'], { tags: ['core', 'smoke'] }),
  T('EXT-02', 'The total is calculated by the server', ['WA1'], [
    'Add two items (for example 2.5 x Rs 100 and 1 x Rs 50).',
  ], ['The request shows each line total and the sum (Rs 300) computed by the system. A zero or negative price is refused.'], { tags: ['core', 'edge'] }),
  T('EXT-03', 'A small request goes straight to the customer', ['WA1', 'C1'], [
    'Send a request of Rs 400 (40% of the Rs 1,000 job).', 'As C1 open the request.',
  ], ['It goes to C1 (not to a sign-off) and shows the reason, photos, items and the total with <b>Approve and pay</b> and <b>Decline</b>. C1 gets "Extra work needs your approval".'], { tags: ['core'] }),
  T('EXT-04', 'A large request needs the provider\'s check first', ['WA1', 'PA1', 'C1'], [
    'Send a request of Rs 800 (more than 50% of the job price).', 'As C1 look at the request: nothing yet.', 'As PA1 press <b>Sign off, show to the customer</b>.',
  ], ['PA1 gets "Extra work needs your check" and the customer does not see it until signed off. After sign-off C1 sees it. A plan visit (no known price) always needs a sign-off.'], { tags: ['core', 'edge'] }),
  T('EXT-05', 'Approve, pay, and the work continues', ['C1', 'OPS1', 'OPS2', 'WA1'], [
    'As C1 press <b>Approve and pay</b>. Open Orders: a new order "Extra work: ..." for the exact total.', 'Record and approve the payment (PAY-06 to PAY-08).', 'As WA1 reload the job.',
  ], ['The job stays "Waiting for extra payment" until the payment is approved. Then it returns to <b>In progress</b> and WA1 is told "Extra work paid". The extra amount is part of the job price for earnings (ERN-04).'], { tags: ['core', 'smoke'] }),
  T('EXT-06', 'Decline', ['C1', 'WA1'], [
    'Send another request and as C1 press <b>Decline</b> with a note.',
  ], ['The worker is told "Extra work declined" and the job is In progress again, to continue as first agreed.'], { tags: ['core'] }),
  T('EXT-07', 'Withdraw and cancel', ['WA1', 'PA1', 'C1'], [
    'WA1 withdraws a request before the customer approves. Send another; C1 approves (order made); then as PA1 press <b>Cancel request</b> with a reason.',
  ], ['Withdrawing works until the customer approves; after approval the worker cannot withdraw. The provider or operations can cancel with a reason: the unpaid order is cancelled and work continues as first agreed.'], { tags: ['edge'] }),
  T('EXT-08', 'The customer cancels the order of an approved request', ['C1', 'WA1'], [
    'Approve a request, then cancel its order under Orders.',
  ], ['The request becomes cancelled and the job continues as first agreed.'], { tags: ['edge'] }),
  T('EXT-09', 'One request at a time; only the assigned worker', ['WA1', 'WA2', 'PA1'], [
    'While a request is open try to start another.', 'Try to raise one as WA2 and as PA1 on WA1\'s job.',
  ], ['A second open request is refused. Only the assigned worker (WA1) can raise it, and only while the job is in progress.'], { tags: ['security', 'edge'] }),
  T('EXT-10', 'A customer cannot approve someone else\'s request', ['C2'], [
    'Open the extra-work request address of C1\'s job as C2 and try Approve.',
  ], ['Not found.'], { tags: ['security'] }),
]);

chapter('chat', 'Messages on a job', '<p>The customer, the assigned worker, the provider\'s admins and operations can write; the franchise of the area can read. It opens when a provider has taken the job and closes for writing when the job is closed or cancelled.</p>', [
  T('CHT-01', 'Not open before a provider takes the job', ['C1', 'OPS1'], [
    'Open Messages on a job still in the pool.',
  ], ['It says messages open once a provider has taken the job; writing is not possible.'], { tags: ['edge'] }),
  T('CHT-02', 'Everyone on the job can write', ['C1', 'WA1', 'PA1', 'OPS1'], [
    'As C1 open <b>Messages</b> on the request and write. Reply as WA1, PA1 and OPS1.',
  ], ['Each message shows the sender and their role (Customer, Worker, Provider, Operations) and the time. C1 sees only <b>first names</b>; staff see full names. Messages are plain text and never editable.'], { tags: ['core', 'smoke'] }),
  T('CHT-03', 'Unread counts and the bell', ['C1', 'WA1'], [
    'Have C1 write two messages. As WA1 look at My day / Jobs board and the bell.', 'Open the messages; look again.',
  ], ['The job shows "(2 new)" and the bell has ONE notification for the chat (not two). Opening the chat clears the count and that notification. The writer is never notified of their own message.'], { tags: ['core'] }),
  T('CHT-04', 'Check the text', ['C1'], [
    'Try to send an empty message, spaces only, and more than 1000 characters.',
  ], ['Each is refused. A normal message is trimmed.'], { tags: ['edge'] }),
  T('CHT-05', 'Franchise can read, not write', ['FR1'], [
    'As FR1 open the chat of a job in North.',
  ], ['The messages are shown and the screen says you can read but not write.'], { tags: ['security'] }),
  T('CHT-06', 'Others cannot see it at all', ['WA2', 'PB1', 'C2', 'FR2'], [
    'Open the job and its messages as each of these.',
  ], ['"Not found" for all of them.'], { tags: ['security', 'smoke'] }),
  T('CHT-07', 'Closed after the job is finished', ['C1'], [
    'After the job is closed or cancelled, open Messages.',
  ], ['The messages can still be read; writing says the chat is closed.'], { tags: ['core'] }),
  T('CHT-08', 'The open chat refreshes', ['C1', 'WA1'], [
    'Keep the chat open as C1 and write as WA1.',
  ], ['The message appears for C1 within about 15 seconds without reloading.'], { tags: ['edge'] }),
]);
