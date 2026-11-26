/* Scenarios, part 1: setup, sign-in, network and areas, masters, services and prices. */
chapter('setup', 'Setup and the test world', '<p>Run these once, in order. They start the app and build the small world (areas, organisations, people, services and prices) that every later area uses. If one fails, stop and fix it before going on: the rest will be blocked.</p>', [
  T('SET-01', 'The app is alive', ['TESTER'], [
    'Start the five terminals as in section 2.2 (database, API, worker, web app, public site).',
    'Open <code>http://localhost:4000/health</code>.', 'Open <code>http://localhost:4000/docs</code>.', 'Open <code>http://localhost:3000</code> and <code>http://localhost:3001</code>.',
  ], [
    'The health address answers with a short "ok" style message.', 'The API page lists the API groups (identity, orders, jobs, notifications, reports, earnings and others).',
    'The web app shows the sign-in page or the customer home; the public site shows the home page with sections.', 'The worker terminal says "Worker started" and prints nothing alarming.',
  ], { tags: ['smoke', 'core'] }),
  T('SET-02', 'The super admin can sign in', ['ADMIN'], [
    'Open <code>http://localhost:3000/admin/login</code>.', 'Sign in with the seeded super admin email and password.',
  ], [
    'You land on the staff <b>Dashboard</b>.', 'The menu shows Overview, Customers, Operations, Money, Network and Insight &amp; content groups, with Earnings and Reports available.',
    'Your name and the role "Super admin" show at the top right, and the bell is there.',
  ], { tags: ['smoke', 'core'] }),
  T('SET-03', 'Reference data is loaded', ['ADMIN'], [
    'Open <b>Masters</b>.', 'Look at the lists (pincodes, cities, property types).', 'Open <b>Service catalogue</b>.',
  ], [
    'Masters shows cities and pincodes (some switched on, many off) and property types such as Residential.', 'The catalogue shows categories (for example Site visit and others) with sub-categories and services.',
    'At least one service has kind Site visit (the mandatory first service).',
  ], { tags: ['smoke', 'core'] }),
  T('TW-01', 'Switch on the pincodes of the test world', ['ADMIN', 'OPS1'], [
    'Open <b>Masters</b>, choose the pincodes list and search for a city that has several pincodes (for example Vadodara). All 178 pincodes are loaded and start switched off.',
    'Switch <b>on</b> three pincodes of the same city. Note them: <b>PIN-N</b>, <b>PIN-S</b> and <b>PIN-X</b> (a spare, left uncovered on purpose).',
  ], [
    'The three pincodes show as switched on.', 'A pincode switched on is still not available to customers: that needs a provider that covers it (checked in later scenarios).',
  ], { tags: ['core'], pre: ['Signed in as ADMIN.'], note: 'Use the same three pincodes for the whole test.' }),
  T('TW-02', 'Create the master franchise for a city', ['ADMIN'], [
    'Open <b>Organisations</b>.', 'Press <b>+</b> on the head office row and add a <b>Master franchise</b> named "Test City MF". Under <b>City it runs</b> type the first letters of your city (for example Vadodara) and pick it from the list.',
    'Press the map icon (Territories) on its row.',
  ], [
    'The master franchise appears in the tree under MPD and its row says "runs Vadodara". The map icon shows one read-only area, "Vadodara (whole city)", holding <b>every</b> pincode of the city (there is no way to add or remove pincodes: the city is the area). A pincode added to the city later joins it by itself.', 'Adding a <i>second</i> master franchise for the same city is refused with a message (one per city): try it and then cancel. Saving a master franchise without choosing a city is refused.',
  ], { tags: ['core'] }),
  T('TW-03', 'Invite MF1, OPS1 and OPS2, and accept the invitations', ['ADMIN', 'MF1', 'OPS1', 'OPS2'], [
    'As ADMIN open <b>Staff</b> and press <b>Invite</b>. Choose organisation <b>MPD</b>, role <b>Operations</b>, enter the name and email of OPS1. Repeat for OPS2.',
    'Invite MF1 into "Test City MF" with role <b>Master franchise</b>.',
    'Find each invitation email in the API terminal and copy the link (<code>.../admin/accept-invite?token=...</code>).',
    'Open each link in a separate browser session, set a password (at least 10 characters) and sign in at the staff login.',
  ], [
    'Each invitation shows under "Waiting to join" until accepted, then disappears.', 'Each person signs in and sees a menu that matches their role (OPS: like the super admin without the ability to invite a super admin; MF: Onboarding, Jobs board, Organisations, Staff).',
    'The link works <b>once</b>: opening it again shows a clear "no longer valid" message.',
  ], { tags: ['core'], note: 'Keep OPS1 and OPS2 signed in permanently in two separate browser sessions. You will need them in nearly every later area.' }),
  T('TW-04', 'MF1 builds two franchises with their areas', ['MF1'], [
    'Sign in as MF1. Open <b>Organisations</b>.', 'Press + on the master franchise row, add a <b>Franchise</b> "Test Franchise North". Add its area "North" with PIN-N.',
    'Add a second franchise "Test Franchise South" with its area "South" holding PIN-S.',
    'Try to add PIN-N to the South area as well.', 'Try to add a pincode of another city to either area (a franchise may only hold pincodes of its master franchise city).',
  ], [
    'Both franchises exist with their own areas.', 'Adding PIN-N to South is <b>refused</b> and the message says which franchise already holds it (franchises never overlap).',
    'A pincode outside your city is refused (a child can only hold pincodes of its parent).',
  ], { tags: ['core', 'edge'] }),
  T('TW-05', 'Franchises invite providers; providers and workers are invited', ['MF1', 'FR1', 'PA1', 'PB1'], [
    'As MF1 open <b>Staff</b> and invite FR1 into "Test Franchise North" (role Franchise) and FR2 into "Test Franchise South". Accept both invitations as before.',
    'As FR1 open <b>Organisations</b>, add two <b>Service providers</b> "Test Provider A" and "Test Provider B" under North. Give each provider the area PIN-N (providers choose from their franchise\'s pincodes).',
    'As FR1 invite PA1 into Provider A and PB1 into Provider B (role Provider admin). Accept both.',
    'As PA1 open <b>Staff</b> and invite WA1 and WA2 (role Field worker). As PB1 invite WB1. Accept all three.',
  ], [
    'Two providers exist under North, both holding PIN-N: <b>providers may overlap each other</b>.', 'Each provider admin sees only their own organisation under Organisations and Staff.',
    'The workers can sign in at the staff login and see a small menu (My day, Jobs board, Reports, notifications).',
  ], { tags: ['core'] }),
  T('TW-06', 'Create the services, prices and a plan used by the tests', ['OPS1'], [
    'Open <b>Service catalogue</b>. Find or add a category "Test plumbing" and in it two services: <b>Tap repair</b> and <b>Water tank cleaning</b> (both active, kind Field).',
    'Open <b>Pricing</b>. Make sure each service has a rate type: Tap repair = <b>Lump sum</b>; Water tank cleaning = <b>Per sq ft</b>.',
    'Create a <b>price list</b> (draft). Set Tap repair = Rs 1,000 and Water tank cleaning = Rs 5 per sq ft for PIN-N, PIN-S and PIN-X. Find the <b>site visit</b> service and price it Rs 500 for the same pincodes.',
    '<b>Publish</b> the list. Check it shows as the live list.',
    'Open <b>Pricing, Plans</b> and make a plan "Yearly home care" (12 months) with Tap repair done 2 times and Water tank cleaning 1 time. Use <b>Try a price</b> on a property size of 1,000 sq ft.',
  ], [
    'The price list shows as live (only one list is live at a time).', 'The plan price is worked out from the prices: with a 1,000 sq ft property: 2 x Rs 1,000 + 1 x (1,000 x Rs 5 = Rs 5,000) = Rs 7,000 before any discount.',
    'The plan has no typed-in price field: the price is always calculated.',
  ], { tags: ['core'], note: 'Write down the numbers: later scenarios check totals against them.' }),
  T('TW-07', 'Give the providers the services; give the workers a subset', ['PA1', 'PB1'], [
    'As PA1 open <b>Organisations</b> and the Services dialog of Test Provider A. Tick <b>Tap repair</b>, <b>Water tank cleaning</b> and the <b>Site visit</b> service. Save.',
    'As PB1 do the same for Test Provider B but tick <b>Tap repair</b> and <b>Site visit</b> only.',
    'As PA1 open <b>Staff</b>, the Services dialog of WA1: tick all three. For WA2 tick only Tap repair.',
  ], [
    'The services are saved. A worker\'s list only offers what the provider offers (a service the provider does not offer cannot be ticked for a worker).',
  ], { tags: ['core'] }),
  T('TW-08', 'Add the franchise-link and make the pincodes available', ['OPS1'], [
    'Open <b>Masters</b>. Check PIN-N is on and covered by an active provider that has staff.',
    'Open the public site <code>http://localhost:3001</code> or the customer sign-up later: choose PIN-N.',
  ], [
    'A pincode is available only when it is switched on <b>and</b> an active, staffed provider covers it: PIN-N is available; PIN-S and PIN-X are <b>not</b> (no provider there yet).',
  ], { tags: ['core', 'edge'] }),
]);

chapter('auth', 'Sign-in and accounts', '<p>Customers use <code>/login</code> and <code>/signup</code>; staff use <code>/admin/login</code>. Verification codes are in the API terminal.</p>', [
  T('AUTH-01', 'A customer signs up and verifies their email', ['C1'], [
    'Open <code>http://localhost:3000/signup</code>.', 'Enter a name, an email you invented, a password (10+ characters) and submit.',
    'Find the email in the API terminal and copy the 6-digit code.', 'Enter the code on the verification page.',
  ], [
    'After signing up you are asked for a code.', 'With the right code you are signed in and see the customer home with a menu: My property, Services, and so on.',
    'The terminal shows an email with subject "...: your verification code" and "Your code is NNNNNN. It expires in 10 minutes."',
  ], { tags: ['smoke', 'core'] }),
  T('AUTH-02', 'A wrong or old code is refused, and the tries are limited', ['C2'], [
    'Start a second sign-up (C2).', 'Enter a wrong code five times.', 'Request a new code and use it.',
  ], [
    'Each wrong code says it is not right and how many tries are left.', 'After five wrong tries the code is dead and a new one is needed.', 'A fresh code works.',
  ], { tags: ['security'] }),
  T('AUTH-03', 'Sign in, wrong password, sign out', ['C1'], [
    'Sign out (button at the top right).', 'Sign in with a wrong password.', 'Sign in with the right one.',
  ], [
    'The wrong password shows one general message (it does not say whether the email exists).', 'The right password signs you in; after signing out, pressing Back does not show private pages.',
  ], { tags: ['smoke', 'core'] }),
  T('AUTH-04', 'Forgot password', ['C1'], [
    'On the sign-in page press the forgot-password link and enter C1\'s email.', 'Find the email in the terminal and follow the reset link or code.', 'Set a new password and sign in with it.',
  ], [
    'The page says that if the email exists you will get a message (it never confirms whether it exists).', 'The new password works; the old one no longer does.',
  ], { tags: ['core'] }),
  T('AUTH-05', 'Password rules', ['C2'], [
    'On sign-up or reset, try a password of fewer than 10 characters.',
  ], ['A clear message says the password is too short. Nothing is saved.'], { tags: ['edge'] }),
  T('AUTH-06', 'Customers and staff use different doors', ['C1', 'OPS1'], [
    'Signed in as C1, open <code>http://localhost:3000/admin/dashboard</code>.', 'Signed in as OPS1, open <code>http://localhost:3000/dashboard</code>.',
  ], [
    'The customer is not shown the staff console (sent to the staff login or refused).', 'Staff are not shown the customer portal as if they were customers.',
  ], { tags: ['security'] }),
  T('AUTH-07', 'Not signed in', ['TESTER'], [
    'In a private window open <code>http://localhost:3000/jobs</code> and <code>http://localhost:3000/admin/jobs</code>.',
  ], ['Each sends you to the matching sign-in page. Nothing private is visible.'], { tags: ['security', 'smoke'] }),
  T('AUTH-08', 'Staff first sign-in and the invitation link', ['OPS1'], [
    'Open an invitation link that you already used.', 'Open an invitation link after editing a character of the token.',
  ], ['Both show a clear message that the link is not valid. No account is created.'], { tags: ['security'] }),
  T('AUTH-09', 'The session stays alive while you work', ['C1'], [
    'Sign in and work normally for 20 minutes (open pages, press buttons).',
  ], ['You are not thrown out in the middle of a task. (The short-lived pass is renewed quietly.) After 30 days of inactivity you are asked to sign in again.'], { tags: ['edge'], note: 'You may skip the 30 days; check only the first sentence.' }),
  T('AUTH-10', 'Too many attempts', ['TESTER'], [
    'Try to sign in with a wrong password about 15 times quickly.',
  ], ['After several attempts the page says "Too many attempts. Wait a minute and try again." Then it works again.'], { tags: ['security', 'edge'] }),
]);

chapter('network', 'Network and areas', '<p>The master franchise runs one city; franchises hold areas (pincodes) that never overlap; providers may overlap and can join several franchises. Use the world from TW-02 to TW-05.</p>', [
  T('ORG-01', 'A higher role manages only its own branch', ['MF1', 'FR1', 'PA1'], [
    'As MF1 open Organisations and Staff.', 'As FR1 open the same pages.', 'As PA1 open the same pages.',
  ], [
    'MF1 sees the master franchise, both franchises and their providers.', 'FR1 sees only Test Franchise North and its providers (not South).', 'PA1 sees only Test Provider A and its people.',
  ], { tags: ['security', 'smoke'] }),
  T('ORG-02', 'A franchise cannot edit its own area', ['FR1', 'MF1'], [
    'As FR1 try to change the area of Test Franchise North.', 'As MF1 change it (add PIN-X to North, then remove it again).',
  ], ['FR1 has no way to edit its own area (areas are set by the level above).', 'MF1 can; the change shows.'], { tags: ['security'] }),
  T('ORG-03', 'Franchises never overlap; providers may', ['MF1', 'FR1'], [
    'As MF1 add PIN-N to the South area.', 'As FR1 give Provider B the same PIN-N as Provider A.',
  ], ['The first is refused with the name of the franchise that has it.', 'The second works.'], { tags: ['core', 'edge'] }),
  T('ORG-04', 'A provider can change its own pincodes, but only inside what it may serve', ['PA1', 'FR1'], [
    'As PA1 open Organisations and edit Provider A\'s areas.', 'Add a pincode that belongs to the South franchise.', 'Add PIN-N.',
  ], ['The South pincode is refused (a provider serves its own franchise\'s pincodes, or those of franchises it has joined).', 'PIN-N is accepted.'], { tags: ['core', 'security'] }),
  T('ORG-05', 'A provider joins a second franchise', ['PA1', 'FR2'], [
    'As PA1 open the Franchises dialog of Provider A and find Test Franchise South in the directory; request to join.',
    'As FR2 open Organisations and accept the request.', 'As PA1 add a South pincode (PIN-S) to Provider A\'s areas.',
  ], ['The request shows as pending for FR2, then active after acceptance.', 'After acceptance PA1 can add PIN-S. Before it, it was refused.'], { tags: ['core'] }),
  T('ORG-06', 'Ending a link removes the pincodes it allowed', ['PA1', 'FR2'], [
    'As FR2 (or PA1) end the link between Provider A and South.', 'Look at Provider A\'s areas.',
  ], ['The South pincode is removed from Provider A automatically; its own franchise pincodes stay.'], { tags: ['edge'] }),
  T('ORG-07', 'The upline can suspend a provider\'s service, with a reason', ['FR1', 'PA1'], [
    'As FR1 open the Services dialog of Provider A and switch off Tap repair, writing a reason.', 'As PA1 look at the same dialog.',
  ], ['The service shows as suspended with the reason; PA1 cannot switch it back on.', 'Jobs for Tap repair no longer reach Provider A (checked in JOB-03).'], { tags: ['core', 'security'], note: 'Switch it back on afterwards as FR1.' }),
  T('ORG-08', 'Staff: invitations, roles and who can invite whom', ['OPS1', 'ADMIN', 'MF1'], [
    'As OPS1 try to invite someone as <b>Super admin</b>.', 'As ADMIN invite a second super admin (then cancel the invitation).', 'As MF1 try to invite someone into an organisation outside your branch.',
  ], ['OPS1 cannot invite a super admin (the option is missing or refused).', 'ADMIN can.', 'MF1 can only invite into organisations in their own branch.'], { tags: ['security'] }),
  T('ORG-09', 'An existing user gets an extra role', ['FR1'], [
    'As FR1 invite the email of PA1 into Test Provider B as a Provider admin.',
  ], ['Because the person already has an account, they are given the role at once (no new password), and receive a "you have a new role" email in the terminal.'], { tags: ['edge'] }),
  T('ORG-11', 'A provider admin chooses the services it offers', ['PA1'], [
    'Sign in as PA1 (Provider admin). Open <b>Organisations</b>, find your own provider and press <b>Services</b>.',
    'Search for a service, tick two or three, press <b>Save</b>, close the window and open it again.',
    'Sign in as PB1 and try to open the services of Test Provider A (it is not in PB1 organisation tree).',
  ], ['The list of services appears at once (no "Forbidden" and no endless "Loading"). Your ticks are saved and still there when you reopen it. The site visit is not in the list.', 'PB1 does not see Test Provider A at all. If a window ever cannot load, it shows only the error message, never "Loading" next to it.'], { tags: ['core', 'security'] }),
  T('ORG-10', 'Deactivating an organisation or person', ['OPS1', 'FR1'], [
    'As FR1 deactivate WA2 (or the provider\'s staff entry) and then try to sign in as WA2 in another session.', 'Reactivate.',
  ], ['A deactivated person cannot sign in or act; after reactivation they can again. A provider with no staff is not offered jobs.'], { tags: ['edge', 'security'] }),
]);

chapter('masters', 'Pincodes and availability', '<p>A pincode is available to customers only when it is <b>switched on</b> AND an <b>active provider with staff</b> covers it.</p>', [
  T('MST-01', 'Switching a pincode on and off', ['OPS1'], [
    'Open Masters, find PIN-X and switch it on, then off.', 'Open the public site pincode check (or the owner\'s service shop later) for PIN-N and PIN-X.',
  ], ['The switch saves. PIN-N (on and covered) is offered; PIN-X is not offered because no provider covers it.'], { tags: ['core'] }),
  T('MST-02', 'Only operations can edit the masters', ['FR1', 'PA1', 'C1'], [
    'As FR1 and PA1 look for Masters in the menu; try opening <code>/admin/masters</code>.', 'As C1 try the same address.',
  ], ['Franchise and provider have no Masters menu and the page refuses; the customer is refused.'], { tags: ['security'] }),
  T('MST-03', 'Property types and their extra details', ['OPS1', 'C1'], [
    'In Masters look at the property types and the extra details each type asks for (for example flat: floor).', 'Later, when C1 adds a property, check the form asks for the same details.',
  ], ['The extra fields shown in the property form match the type chosen.'], { tags: ['core'] }),
]);

chapter('catalogue', 'Services and website content', '<p>The catalogue (category, sub-category, service) feeds the public website and the shop. Inactive means hidden from new bookings.</p>', [
  T('CAT-01', 'Add, edit and order services', ['OPS1'], [
    'Open Service catalogue. Add a category, a sub-category and a service with name, descriptions and a picture.', 'Edit the name; reorder two services by dragging.',
  ], ['The new items appear in the list in the chosen order. Names, slugs and descriptions save.', 'A slug that is already used is refused with a message.'], { tags: ['core'] }),
  T('CAT-02', 'Inactive services are hidden from new bookings', ['OPS1', 'C1'], [
    'Make "Water tank cleaning" inactive.', 'As C1 (after the site visit is done, later) or on the public site, look for it.', 'Make it active again.',
  ], ['It disappears from the website and from the shop for new orders; it comes back when active. Existing jobs for it are not affected.'], { tags: ['core', 'edge'] }),
  T('CAT-03', 'Write a checklist for a service', ['OPS1'], [
    'In the catalogue press the list icon on Tap repair.', 'Add three steps: a tick ("Turn off the water"), a number ("Meter reading", photo needed), a pick-one ("Condition": Good / Needs repair, not required).',
    'Tick "The worker must add a before photo and an after photo". Save.', 'Change one step and save again.',
  ], ['Each save says "Saved as version N". The latest version is what new jobs use.', 'Options for a pick-one must be at least two different values; an empty label is refused.'], { tags: ['core'], note: 'The scenarios in "Doing the work" use this checklist.' }),
  T('CAT-04', 'Website content', ['OPS1'], [
    'Open Website content. Edit a homepage section, a question and answer, a testimonial and a team member.', 'Open the public site and refresh.',
  ], ['The public site shows the new text. Content is shown to everyone; no customer data appears anywhere on it.'], { tags: ['core'] }),
  T('CAT-05', 'Only operations edit the catalogue and content', ['FR1', 'PA1', 'MF1'], [
    'Look for Service catalogue, Pricing and Website content in the menu; open the addresses directly.',
  ], ['The menu items are missing for these roles and the pages refuse.'], { tags: ['security'] }),
]);

chapter('pricing', 'Prices and plans', '<p>Prices are worked out only on the server. One rate type per service; price per pincode in dated price lists; only one list is live.</p>', [
  T('PRC-01', 'A draft price list does nothing until it is published', ['OPS1', 'C1'], [
    'Make a new price list (draft) and change Tap repair to Rs 2,000.', 'Look at the price shown to a customer (later, in the shop).', 'Publish it; then publish the earlier one again (or edit back).',
  ], ['Customers see the live list only. After publishing the new list it becomes the only live list; the old one stops being live.'], { tags: ['core'] }),
  T('PRC-02', 'A service must be priced in the area to be bought', ['OPS1', 'C1'], [
    'Remove the price of Tap repair for PIN-N in a draft list and publish.', 'Try to buy Tap repair for a property in PIN-N.', 'Restore and publish.',
  ], ['The shop does not offer it (or says it cannot be priced there). It returns when priced again.'], { tags: ['edge'] }),
  T('PRC-03', 'Minimum charge and per-area pricing (and changing how a service is charged)', ['OPS1', 'C1'], [
    'Set a minimum charge of Rs 600 on Water tank cleaning (Rs 5 per sq ft). Buy it for a 100 sq ft property and for a 1,000 sq ft one.',
  ], ['100 sq ft: 100 x 5 = Rs 500, but the minimum applies, so Rs 600. 1,000 sq ft: Rs 5,000. The quote shows the rate, the size and any minimum.'], { tags: ['core', 'edge'] }),
  T('PRC-04', 'Plan price is calculated per property', ['OPS1'], [
    'In Plans press Try a price for 1,000 sq ft and for 2,000 sq ft.', 'Add a discount of 10% on Water tank cleaning and 5% on the whole plan, then try again.',
  ], ['The price scales with the size. With the discounts the breakdown shows each service, its discount, the subtotal, the plan discount and the total, rounded to whole paise.'], { tags: ['core'] }),
  T('PRC-05', 'Only operations can change prices', ['FR1', 'PA1', 'C1'], [
    'Open <code>/admin/pricing</code> in each session.',
  ], ['Refused or missing for everyone but operations and the super admin.'], { tags: ['security'] }),
]);

chapter('loaders', 'Loaders: the screen always shows that it is waiting', '<p>Whenever the browser waits for the server, a thin blue bar runs along the top of the page and the mouse pointer shows the busy cursor. Answers faster than a fifth of a second show nothing, so the screen does not flicker. Opening a page also shows a grey page-shaped placeholder until the page arrives.</p>', [
  T('LDR-01', 'Opening a page shows that something is happening', ['OPS1'], [
    'In the browser developer tools (F12, tab Network) choose the speed <b>Slow 3G</b>. Click a menu item such as <b>Orders</b> or <b>Pricing</b>.',
  ], ['At once the grey placeholder appears in place of the page, the blue bar runs along the top and the pointer shows the busy cursor. When the page arrives all of that disappears.'], { tags: ['smoke', 'core'] }),
  T('LDR-02', 'A button that talks to the server shows that it is working', ['OPS1'], [
    'With Slow 3G still on, press a save button (for example <b>Save</b> in a services window, or an Active switch in the catalogue).',
  ], ['The blue bar runs while the server works and the pointer is busy. Buttons that already show "Saving..." or are disabled while working keep doing so.'], { tags: ['core'] }),
  T('LDR-03', 'A quick answer does not flicker', ['OPS1'], [
    'Switch the speed back to <b>No throttling</b> and click through a few menu items.',
  ], ['Nothing flashes: fast pages simply appear. The bar only shows for answers that take longer than about a fifth of a second.'], { tags: ['edge'] }),
]);
