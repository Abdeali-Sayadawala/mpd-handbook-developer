/* Scenarios, part 2: customers and properties, vault and identity, project owners, onboarding. */
chapter('customers', 'Customers and properties', '<p>Customers C1 and C2 come from AUTH-01 and AUTH-02. A property is the thing services are bought for.</p>', [
  T('CUS-01', 'Edit the profile and the time zone', ['C1'], [
    'Open Profile. Change your name, country of residence and choose a time zone (for example America/New_York). Save.',
  ], ['The change saves and shows after refreshing. Times shown later in reminders and messages use this time zone.'], { tags: ['core'], note: 'Set C1 to a non-India zone now: REM-02 checks it. Set it back afterwards if you like.' }),
  T('CUS-02', 'Add a property', ['C1'], [
    'Open My property, add a property: name, address, the pincode PIN-N, a type (Residential, a flat), built area 1,000 sq ft, and the type\'s extra details.',
  ], ['The property is created and listed. It shows as <b>not yet verified</b>: its facts are unchecked until the site visit.', 'Entering a pincode that is not switched on / not served is refused or shows a clear message.'], { tags: ['smoke', 'core'] }),
  T('CUS-03', 'Edit a property before the site visit', ['C1'], [
    'Open the property and change the address line and the built area. Save.',
  ], ['The changes save. (Before the site visit the owner may edit; after it the checked facts are locked: see SV-04.)'], { tags: ['core'] }),
  T('CUS-04', 'Validation on the property form', ['C1'], [
    'Try saving with an empty name, an empty address, and a built area of 0 or negative.',
  ], ['Each shows a clear message next to the field. Nothing is saved.'], { tags: ['edge'] }),
  T('CUS-05', 'One customer cannot see another\'s property', ['C1', 'C2'], [
    'As C1 open the property and copy its address (the id in the web address).', 'As C2 paste that address.',
  ], ['C2 sees "not found". Nothing of C1\'s property shows.'], { tags: ['security', 'smoke'] }),
  T('CUS-06', 'Staff can see a customer', ['OPS1', 'FR1'], [
    'As OPS1 open Customers, search for C1 and open it.', 'As FR1 look for Customers.',
  ], ['OPS1 sees the properties, orders and documents list. FR1 has no Customers menu and the page refuses.'], { tags: ['core', 'security'] }),
  T('CUS-07', 'Property history across owners', ['C1', 'OPS1'], [
    'Open the property History page as C1.', 'Look at what is shown after orders exist (later).',
  ], ['A property shows its own orders and events; a <i>new</i> owner of a unit later sees earlier orders but never the previous owner\'s name or what they paid.'], { tags: ['edge'], note: 'Check again after PRJ-06.' }),
]);

chapter('vault', 'Document vault and identity check', '<p>The vault keeps a customer\'s documents in folders. Files are checked by their real type, limited to 20 MB, and opened only through links that expire in 5 minutes.</p>', [
  T('VLT-01', 'Upload a document', ['C1'], [
    'Open Documents. Choose a folder (or create one), press upload, pick a small PDF, give it a title and a category.',
  ], ['The document is listed with its size and date; you can open it (a link opens the file).'], { tags: ['core', 'smoke'] }),
  T('VLT-02', 'Only real documents and photos are accepted', ['C1'], [
    'Rename a text file to <code>fake.pdf</code> and upload it.', 'Upload a file larger than 20 MB.', 'Upload an <code>.exe</code> or a script file.',
  ], ['Each is refused with a clear message. The first because its real content is not a PDF; the second because of the size limit; the third because of the type.'], { tags: ['security'] }),
  T('VLT-03', 'The same file is not stored twice', ['C1'], [
    'Upload the same file again in the same place.',
  ], ['A message says the file is a duplicate (or it is recognised); no second copy appears.'], { tags: ['edge'] }),
  T('VLT-04', 'Versions, details and expiry date', ['C1'], [
    'On a document press Edit details and set an <b>expiry date</b> 5 days from today.', 'Upload a new version of the document.',
  ], ['The expiry shows on the document; a new version is kept with the earlier one available. (The expiry reminder is checked in REM-05.)'], { tags: ['core'] }),
  T('VLT-05', 'Open links expire; sharing', ['C1', 'C2'], [
    'Open a document; copy the file link and wait 6 minutes; open it again.', 'Share a document by a share link (if offered) and open it in a private window; then stop sharing.',
  ], ['The old link says it has expired. A share link works without signing in until stopped or expired, then no longer works.'], { tags: ['security'] }),
  T('VLT-06', 'Documents of another customer', ['C1', 'C2'], [
    'Copy the address of one of C1\'s documents and open it as C2.',
  ], ['"Not found". No file opens.'], { tags: ['security'] }),
  T('KYC-01', 'Submit an identity document', ['C1'], [
    'Open Identity (KYC). Choose a type, enter the number (an invented one) and upload a scan.',
  ], ['The record shows as waiting for review. Only the last digits of the number are displayed (it is stored masked); the scan is locked in the vault so you cannot delete it while it is under review.'], { tags: ['core'] }),
  T('KYC-02', 'Review: approve and reject', ['OPS1'], [
    'Open KYC review, open the waiting record, look at the scan (the link works for 5 minutes) and the masked number.', 'Reject with a reason. Then have C1 submit again and approve that one.',
  ], ['A rejection needs a reason and C1 sees it; an approval marks the customer verified. Each decision is recorded with your name.'], { tags: ['core'] }),
  T('KYC-03', 'Who can review', ['FR1', 'PA1', 'C1'], [
    'Open <code>/admin/kyc</code> in each session.',
  ], ['Refused for everyone except operations and the super admin.'], { tags: ['security'] }),
]);

chapter('project', 'Project owners and registered owners', '<p>A builder or society (a <b>project owner</b>) registers a property owner for a unit with proof; operations review; the owner is invited and accepts.</p>', [
  T('PRJ-01', 'Make a customer a project owner', ['OPS1', 'PO1'], [
    'Sign up PO1 as a customer. As OPS1 open Customers, open PO1 and change the customer type to <b>Project owner</b>.', 'As PO1 refresh: a <b>Projects</b> menu appears.',
  ], ['PO1 now has Projects and Buy for several properties in the menu; other customers do not.'], { tags: ['core'] }),
  T('PRJ-02', 'Create a project and units', ['PO1'], [
    'Open Projects, add a project "Test Heights" and add two units with the pincode PIN-N.',
  ], ['The project and its units are listed. Each unit is a property that belongs to the project.'], { tags: ['core'] }),
  T('PRJ-03', 'Register an owner for a unit, with proof', ['PO1'], [
    'Open a unit and add the owner (name and the email of C2) with a proof document (a sample PDF).',
  ], ['The registration shows as waiting for operations. A registration without proof is refused.'], { tags: ['core'] }),
  T('PRJ-04', 'Operations review the registration', ['OPS1'], [
    'Open Owner registrations, read the proof. Reject one with a reason; approve the other.',
  ], ['A rejection needs a reason and the builder sees it. An approval sends the owner an invitation (in the terminal: link <code>.../owner-invite?token=...</code>).'], { tags: ['core'] }),
  T('PRJ-05', 'The owner accepts the invitation', ['C2'], [
    'Open the invitation link in a separate session. Sign up or sign in as C2 with the invited email and accept.',
  ], ['C2 now owns the unit: it appears in C2\'s My property. The link works once.'], { tags: ['core'] }),
  T('PRJ-06', 'Purchaser control: only the buyer can change what they bought', ['PO1', 'C2'], [
    'As PO1 buy a service for the unit (after its site visit); as C2 try to cancel or change that order. Then the other way: C2 buys, PO1 tries.',
  ], ['The one who did not buy cannot change it (a clear message). Operations can, with a reason.'], { tags: ['security', 'core'], note: 'Needs the unit\'s site visit done (SV-01 to SV-03).' }),
  T('PRJ-07', 'A unit has one owner; only operations replace it', ['PO1', 'OPS1'], [
    'Try to register a second owner for a unit that has an active owner.', 'As OPS1 replace the owner.',
  ], ['PO1 is refused; OPS1 can replace it.'], { tags: ['edge', 'security'] }),
]);

chapter('onboarding', 'Onboarding: from inquiry to paying customer', '<p>A visitor sends an inquiry on the public site; a case is created and handed to the franchise that holds the pincode; operations take it to a priced offer and an order.</p>', [
  T('ONB-01', 'An inquiry on the public website', ['VISITOR'], [
    'Open <code>http://localhost:3001</code> and fill in the <b>Talk to us</b> form: name, email (use C3\'s invented email), country, pincode PIN-N and what they need. Submit.',
  ], ['A thank-you message appears. No private data shows on the page.', 'Submitting the same form many times quickly eventually shows a "too many" message.'], { tags: ['smoke', 'core'] }),
  T('ONB-02', 'The case appears for the right people only', ['OPS1', 'FR1', 'FR2'], [
    'As OPS1 open Onboarding: the new case is at the top, assigned to Test Franchise North.', 'As FR1 open Onboarding.', 'As FR2 open Onboarding.',
  ], ['OPS1 sees it. FR1 sees it (it is in their area). FR2 does <b>not</b> see it.'], { tags: ['core', 'security'] }),
  T('ONB-03', 'Notes and marking contacted', ['FR1', 'OPS1'], [
    'As FR1 open the case, add an internal note and press Mark contacted.', 'As OPS1 look at the case.',
  ], ['The note and the contact are in the history with the name of the person. FR1 can do only notes and "contacted"; operations run the case.', 'Notes are never shown to the customer.'], { tags: ['core'] }),
  T('ONB-04', 'The case links to the customer who signs up', ['C3', 'OPS1'], [
    'Sign up C3 using the same email as the inquiry. Open Getting started as C3.', 'As OPS1 look at the case.',
  ], ['The case links to C3 by itself (by the verified email). C3 sees "Getting started" with their next step.', 'If the emails differ, OPS1 can link by hand.'], { tags: ['core'] }),
  T('ONB-05', 'Arrange the site visit', ['OPS1', 'C3'], [
    'As C3 add a property (PIN-N).', 'As OPS1 open the case, choose the property and press <b>Arrange site visit</b>, choose the site-visit service and write a reason.',
  ], ['An order for the site visit is made for C3 at the site-visit price. Nothing else can be offered before the visit.'], { tags: ['core'] }),
  T('ONB-06', 'Pay for the visit; complete it', ['OPS1', 'OPS2'], [
    'Record the payment (see PAY-06) and have OPS2 approve it.', 'In Site visits press <b>Visit done</b> for it and complete it (see SV-02).',
  ], ['The case moves on: the site visit is done. The property is verified.'], { tags: ['core'] }),
  T('ONB-07', 'Make an offer', ['OPS1'], [
    'Open the case. Press <b>Make an offer</b>: add Tap repair and a plan, a discount of Rs 100 with a reason, and 7 days open. Press <b>Work out the price</b>, then <b>Send the offer</b>.',
  ], ['The price is calculated by the system from the live prices; the discount appears with its reason. The customer is told.'], { tags: ['core'] }),
  T('ONB-08', 'The customer accepts; an order appears', ['C3'], [
    'Under Getting started read the offer and accept it.',
  ], ['An order is created at exactly the offered price. The offer cannot be accepted twice, nor after it expired.'], { tags: ['core', 'edge'] }),
  T('ONB-09', 'Pay; the case becomes active', ['OPS1', 'OPS2'], [
    'Record and approve the payment for the order.',
  ], ['The order is paid, the case becomes Active, the paid services turn into jobs (see JOB-01).'], { tags: ['core'] }),
  T('ONB-10', 'Mark lost and reopen; skip the site visit', ['OPS1'], [
    'On another case press Close the case / mark Lost with a reason, then reopen it.', 'On a third case use <b>Skip the site visit</b> with a reason (where allowed).',
  ], ['The status and history show every change with who and why.'], { tags: ['edge'] }),
  T('ONB-11', 'A case with attention needed', ['OPS1'], [
    'Look at the list for an inquiry older than a day or a case with no activity for 3 days (you may need a developer to age one).',
  ], ['Such cases are flagged "needs attention".'], { tags: ['edge'] }),
]);

chapter('sitevisit', 'Site visit first', '<p>The site visit is the first mandatory service for every property. Until it is done, a customer can buy nothing else for it.</p>', [
  T('SV-01', 'Before the visit only the site visit is offered', ['C1'], [
    'Open the property\'s services page (the shop). Look at what is offered.', 'Try to open the plans page for the property.',
  ], ['Only the Site visit service is offered; others are shown as unavailable until the visit is done. Plans are refused with a clear reason.'], { tags: ['smoke', 'core'] }),
  T('SV-02', 'Buy, pay and complete the site visit', ['C1', 'OPS1', 'OPS2'], [
    'As C1 buy the Site visit for the property.', 'OPS1 records the payment, OPS2 approves it.',
    'As OPS1 open Site visits: the paid visit is listed. Press <b>Visit done</b>, write what was found, change the address line (a detail that was wrong) and complete.',
  ], ['The visit appears only after the payment is approved. After completing, the property is <b>verified</b> and the corrections are saved and shown in its history.', 'The same visit cannot be completed twice.'], { tags: ['smoke', 'core'] }),
  T('SV-03', 'After the visit everything is offered', ['C1'], [
    'Open the shop for the property again.', 'Open the plans page.',
  ], ['Services and plans are offered with their prices; the price of the plan uses the verified size.'], { tags: ['core'] }),
  T('SV-04', 'Checked facts are locked for owners', ['C1', 'OPS1'], [
    'As C1 try to change the address, pincode, type or area of the verified property.', 'As OPS1 correct one of them.',
  ], ['C1 cannot (the fields are locked with a reason). OPS1 can.'], { tags: ['security', 'core'] }),
  T('SV-05', 'Another customer cannot see my visit', ['C2'], [
    'Open the property\'s address as C2.',
  ], ['Not found.'], { tags: ['security'] }),
  T('SV-06', 'The site visit also becomes a job', ['PA1', 'WA1'], [
    'Pay for a site visit. As PA1 open the Jobs board.',
  ], ['The visit appears in the pool for providers that cover the pincode and offer the Site visit service (see the Job pool area). A worker can finish it on site and correct the property there (WRK-12).'], { tags: ['core'] }),
]);
