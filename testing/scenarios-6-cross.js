/* Scenarios, part 6: public website, phone, security sweeps, whole journeys, look and feel. */
chapter('website', 'Public website', '<p>The public site (port 3001) shows content and takes inquiries. It never shows customer data.</p>', [
  T('WEB-01', 'The home page and the catalogue', ['VISITOR'], [
    'Open <code>http://localhost:3001</code>. Scroll the sections; open a service and a category.',
  ], ['Sections, services, questions and answers, testimonials and the team show from the content you edited in CAT-04. Inactive services are not shown. Nothing about customers appears.'], { tags: ['smoke', 'core'] }),
  T('WEB-02', 'Content changes appear after saving', ['OPS1', 'VISITOR'], [
    'Edit a question in Website content, save, and refresh the public site within a minute.',
  ], ['The new text appears (the site is refreshed when content is saved).'], { tags: ['core'] }),
  T('WEB-03', 'The inquiry form checks its input', ['VISITOR'], [
    'Send the form empty; with a bad email; with a pincode not served.',
  ], ['Clear messages for each; nothing is saved. A valid one is accepted (ONB-01).'], { tags: ['edge'] }),
  T('WEB-04', 'No private data and no admin links', ['VISITOR'], [
    'View the page source and try <code>http://localhost:3001/api</code> paths.',
  ], ['Only public content is present; there are no internal addresses or secrets.'], { tags: ['security'] }),
]);

chapter('phone', 'Phone and installed app', '<p>Use a real phone or Chrome\'s phone view. Workers and customers use phones most.</p>', [
  T('MOB-01', 'Every main screen fits a phone', ['WA1', 'C1'], [
    'In phone view open: My day, the job dialog, the checklist, the photo button, Service requests, Messages, Orders.',
  ], ['No sideways scrolling, buttons are easy to hit (about 44 px), the menu is a drawer opened from the top left, text is readable.'], { tags: ['core', 'smoke'] }),
  T('MOB-02', 'Camera and location', ['WA1'], [
    'On a real phone add a photo to a job: choose Take or choose a photo. Allow location.',
  ], ['The rear camera opens; the photo is added with the time and (if allowed) the place. If you refuse location the photo is still added.'], { tags: ['core'] }),
  T('MOB-03', 'Directions and call', ['WA1'], [
    'On My day press Directions and Call.',
  ], ['Directions opens the map with the job\'s address; Call opens the phone dialler with the customer\'s number.'], { tags: ['core'] }),
  T('MOB-04', 'Dark mode and zoom', ['C1'], [
    'Switch the phone to dark mode; zoom text to 150%.',
  ], ['The app stays readable in both; nothing is cut off.'], { tags: ['edge'] }),
]);

chapter('security', 'Security sweeps', '<p>Try to do what you must <b>not</b> be able to do. Every attempt should end in a refusal and nothing changed.</p>', [
  T('SEC-01', 'Guess other people\'s ids', ['C1', 'C2'], [
    'Copy any address that contains an id (property, order, job, document) from C1 and open it as C2, and vice versa.',
  ], ['Always "not found" (never "forbidden", so ids cannot be probed).'], { tags: ['security', 'smoke'] }),
  T('SEC-02', 'Type a staff address as the wrong role', ['C1', 'WA1', 'PA1', 'FR1'], [
    'For each role open addresses it has no menu for: <code>/admin/payments</code>, <code>/admin/pricing</code>, <code>/admin/masters</code>, <code>/admin/kyc</code>, <code>/admin/customers</code>, <code>/admin/orders</code>.',
  ], ['Refused every time. Hiding a menu item is only cosmetic: the server decides.'], { tags: ['security', 'smoke'] }),
  T('SEC-03', 'Two-person rule for money', ['OPS1', 'OPS2'], [
    'Try to approve your own customer payment and your own payout in every way you can (buttons, the API page <code>/docs</code> with your token).',
  ], ['Always refused: "you recorded this, so a different person must approve it".'], { tags: ['security', 'smoke'] }),
  T('SEC-04', 'Text with markup is shown as text', ['C1', 'OPS1'], [
    'Enter <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> and <code>&lt;b&gt;bold&lt;/b&gt;</code> as a property name, a note, a chat message, a service name and an organisation name.',
  ], ['They are displayed literally everywhere. No pop-up, no bold.'], { tags: ['security'] }),
  T('SEC-05', 'Codes are never visible to staff', ['PA1', 'WA1', 'OPS1'], [
    'Look in the worker\'s job dialog, the history and the API page for the start and finish codes.',
  ], ['Only the customer sees the code, once. Staff see that a code was used, never its value.'], { tags: ['security'] }),
  T('SEC-06', 'Used or expired access links', ['C1'], [
    'Open a document link after 6 minutes; open an old invitation link; open an old share link.',
  ], ['Each says it is no longer valid.'], { tags: ['security'] }),
  T('SEC-07', 'The signed-out API', ['TESTER'], [
    'Open <code>http://localhost:4000/v1/me/customer</code> in the browser without signing in.',
  ], ['The API answers 401 (not signed in), not data.'], { tags: ['security'] }),
  T('SEC-08', 'A suspended person is locked out', ['OPS1', 'WA2'], [
    'Deactivate WA2 while signed in as WA2 in another session; press any button there.',
  ], ['The next request fails and the session ends or is refused.'], { tags: ['security', 'edge'] }),
]);

chapter('journeys', 'Whole journeys', '<p>The full story, end to end, with every role. Run these last. Each journey says which accounts you need at once.</p>', [
  T('E2E-01', 'Inquiry to rated job to payout', ['VISITOR', 'OPS1', 'OPS2', 'C3', 'FR1', 'PA1', 'WA1', 'MF1'], [
    'A visitor sends an inquiry (ONB-01). OPS1 takes the case to a site visit order; pay and complete it (ONB-05, ONB-06). Make an offer with one service; the customer accepts; pay (ONB-07 to ONB-09).',
    'PA1 accepts the job and assigns WA1 (JOB-04, JOB-07). Set the visit time (WRK-02). WA1: on the way, start code, checklist and photos, an extra-work request approved and paid (EXT-03, EXT-05), finish code.',
    'PA1 verifies; the customer rates (WRK-11, WRK-13). Wait for the earnings and record and approve a payout (ERN-02, ERN-06).',
    'Open Reports for each role and compare the figures.',
  ], [
    'Every step works with no manual database help. The customer, worker and provider each got the notifications listed in NTF-02. The earnings add up (provider 70%, franchise 10%, master franchise 5% of Rs job + extra) and the payout is approved by a different admin.',
    'The reports show the job, the money and the rating in the right scopes.',
  ], { tags: ['smoke', 'core'] }),
  T('E2E-02', 'A plan customer for a year', ['C1', 'OPS1', 'OPS2', 'PA1', 'WA1'], [
    'C1 buys the plan, it is paid (PAY-13). C1 requests the two Tap repair visits (PAY-15); each is done and rated (WRK-05 to WRK-13). Request a third: refused.',
    'Age the plan so it ends in 6 days (REM-06).',
  ], ['Each visit is a job and earns on the plan\'s per-visit value. The remaining visits count down correctly. The renewal reminder arrives once.'], { tags: ['core'] }),
  T('E2E-03', 'A builder with many units', ['PO1', 'C2', 'OPS1', 'OPS2'], [
    'PO1 creates a project and two units, registers C2 as the owner of one with proof (PRJ-03 to PRJ-05), completes both site visits, buys Tap repair for both units in one batch and pays once (PAY-17).',
  ], ['One batch payment pays both orders; the jobs appear; C2 can see and rate their own unit\'s job but cannot change what PO1 bought (PRJ-06).'], { tags: ['core'] }),
  T('E2E-04', 'Two providers race for a job', ['C1', 'PA1', 'PB1', 'FR1'], [
    'Pay for a Tap repair. PA1 and PB1 both see it; accept at the same time (JOB-04). Then switch off Tap repair for the loser and make another job.',
  ], ['One winner. The loser is told it is taken and does not see later Tap repair jobs while switched off.'], { tags: ['edge'] }),
  T('E2E-05', 'A job that goes wrong', ['C1', 'PA1', 'WA1', 'OPS1'], [
    'WA1 cannot attend (WRK-04); PA1 reassigns to WA2; work is sent back once (WRK-11); the customer declines extra work (EXT-06); the job still closes and rates.',
  ], ['The history shows each event; nothing is lost; earnings are made once for the closed job.'], { tags: ['edge'] }),
]);

chapter('ux', 'Look and feel', '<p>Quick checks on every page you visit. Note anything odd and attach a screenshot.</p>', [
  T('UX-01', 'Keyboard and labels', ['C1', 'OPS1'], [
    'On three forms (property, payment, extra work) use only the keyboard: Tab, Shift+Tab, Enter, Space.',
  ], ['Every field has a visible label, the focus is always visible, you can reach and press every button, and dialogs can be closed with the Close button.'], { tags: ['edge'] }),
  T('UX-02', 'Messages are plain and helpful', ['C1', 'OPS1'], [
    'Provoke five different errors (wrong code, missing field, refused action, closed job, too many tries).',
  ], ['Each message is in plain words, says what to do next, and shows no technical text or code.'], { tags: ['core'] }),
  T('UX-03', 'Loading, empty and error states', ['C1', 'OPS1'], [
    'Open a list with nothing in it (new customer\'s orders), a slow page, and a page while the API is stopped.',
  ], ['A friendly "nothing yet" message, a loading note, and a clear error (not a blank page).'], { tags: ['edge'] }),
  T('UX-04', 'Money and dates read well', ['C1', 'OPS1'], [
    'Look at amounts and times on orders, payments, jobs and reports.',
  ], ['Amounts show as ₹ with Indian grouping (₹1,00,000 style or ₹100,000 consistently) and whole paise where needed; times are in the reader\'s zone, with IST named where relevant.'], { tags: ['edge'] }),
  T('UX-05', 'Resizing the window', ['OPS1'], [
    'Make the browser narrow and wide on the Jobs board, Orders, Reports and Earnings.',
  ], ['Tables scroll sideways inside their box; nothing overlaps; the menu becomes a drawer on narrow screens.'], { tags: ['edge'] }),
]);
