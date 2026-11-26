/* The content of the role guide. Plain words, no internal names. To document a change: edit this file only.
   Keep it in step with the app (see mpd-context/09-handbooks.md). Last reviewed: see GUIDE.updated. */
window.GUIDE = {
  updated: "1 Dec 2026 (after property work history)",

  groups: [
    { id: "head", name: "Head office" },
    { id: "network", name: "Franchise network" },
    { id: "customers", name: "Customers (what they see)" }
  ],

  roles: [
    /* ------------------------------------------------------------------ head office */
    {
      id: "super_admin", group: "head", name: "Super admin", icon: "👑",
      short: "The owner of the platform. Sees everything and can do everything.",
      youAre: "You run the whole business. You set up the services and prices, build the franchise network, and you are the final safety net for money.",
      reportsTo: "Nobody. You are at the top.",
      manages: "Everything: operations staff, master franchises, the catalogue, prices, the website, the list of pincodes.",
      menu: [
        { group: "Overview", items: [{ label: "Dashboard", what: "A quick look at the day." }] },
        { group: "Customers", items: [
          { label: "Customers", what: "Everyone who has registered. Open one to see their properties, orders and documents." },
          { label: "KYC review", what: "Identity checks waiting for a person to approve or reject." },
          { label: "Owner registrations", what: "Builders registering a property owner for a unit, with proof. You approve before the owner is invited." },
          { label: "Onboarding", what: "Every inquiry and prospect, from the first contact to a paying customer." }
        ] },
        { group: "Operations", items: [
          { label: "Site visits", what: "Paid site visits waiting to be done. Mark one done after the visit." },
          { label: "Jobs board", what: "The job pool and every job. Nudge providers, give a job to a provider, or cancel." },
          { label: "Service catalogue", what: "The list of services shown on the website and in the app." },
          { label: "Pricing", what: "Rate types, price lists per pincode, service prices and plans." }
        ] },
        { group: "Money", items: [
          { label: "Orders", what: "What customers bought. Record the payment you received here." },
          { label: "Payments", what: "Payments waiting for a second person to approve." },
          { label: "Earnings", what: "Partner earnings.", soon: true }
        ] },
        { group: "Network", items: [
          { label: "Organisations", what: "The tree of master franchises, franchises and providers, with their areas and services." },
          { label: "Staff", what: "People in each organisation, and invitations." },
          { label: "Masters", what: "Pincodes, cities, units and property types. Switch pincodes on or off." }
        ] },
        { group: "Insight & content", items: [
          { label: "Website content", what: "Homepage sections, questions and answers, testimonials, team." },
          { label: "Reports", what: "Reports.", soon: true },
          { label: "Audit log", what: "Who did what.", soon: true }
        ] }
      ],
      tasks: "HEAD_OFFICE",
      cannot: [
        "Approve a payment that you recorded yourself. A different person must.",
        "Change a property's facts as a customer. After a site visit those facts are locked for owners; staff correct them."
      ],
      tips: [
        "Only a super admin can invite another super admin.",
        "Every action is recorded with your name. Use clear reasons when the screen asks for one."
      ]
    },
    {
      id: "ops", group: "head", name: "Operations", icon: "🛠️",
      short: "Runs the day-to-day: customers, payments, site visits, jobs.",
      youAre: "You keep things moving. You answer inquiries, arrange site visits, record and approve payments, make offers, and step in when a job is stuck.",
      reportsTo: "The super admin.",
      manages: "Customers, onboarding, orders, payments, site visits, job dispatch, catalogue and prices.",
      menu: "SAME_AS:super_admin",
      tasks: "HEAD_OFFICE",
      cannot: [
        "Approve a payment you recorded. Ask a colleague.",
        "Invite a super admin (only a super admin can).",
        "Change an organisation's own area from inside it: areas are set by the level above."
      ],
      tips: [
        "Two people for money: one records, another approves. Plan your shifts so there is always a second person.",
        "When a job has waited too long it shows Overdue. Open it and use Ask providers to take it, or give it to a provider yourself."
      ]
    },

    /* ------------------------------------------------------------------ network */
    {
      id: "master_franchise", group: "network", name: "Master franchise", icon: "🏙️",
      short: "Runs one city. Builds the franchises and providers in it.",
      youAre: "You run one city for MPD. You decide which franchises look after which parts of the city and you keep an eye on every job and inquiry there.",
      reportsTo: "Head office (super admin and operations).",
      manages: "Franchises and providers in your city, and your city's pincodes.",
      menu: [
        { group: "Overview", items: [{ label: "Dashboard", what: "A quick look." }] },
        { group: "Customers", items: [{ label: "Onboarding", what: "Inquiries in your city. You can read them, add notes and mark that you contacted the person." }] },
        { group: "Operations", items: [{ label: "Jobs board", what: "Every job in your city's pincodes. Nudge providers or give a job to one." }] },
        { group: "Network", items: [
          { label: "Organisations", what: "Your franchises and providers: add them, set their areas, choose providers' services." },
          { label: "Staff", what: "Invite people into the franchises and providers you manage." }
        ] }
      ],
      tasks: [
        { id: "mf_franchise", title: "Add a franchise and give it an area", where: "Organisations", steps: [
          "Open Organisations and find your master franchise row.",
          "Press the + button on it to add a Franchise. Give it a name and save.",
          "On the new franchise press the map icon (Territories) and add an area: a name and the pincodes it will look after.",
          "Choose only pincodes inside your city. A pincode can belong to only one franchise: if another franchise already has it, the screen tells you which."
        ], tips: ["An area name is only a label. What counts are the pincodes."] },
        { id: "mf_invite", title: "Invite the person who will run a franchise or provider", where: "Staff", steps: [
          "Open Staff and press Invite.",
          "Choose the organisation, the role and enter their name and email.",
          "They get an email with a one-time link to set their password. Until they accept, the invitation shows under Waiting to join."
        ] },
        { id: "mf_watch", title: "See what is happening in your city", where: "Onboarding and Jobs board", steps: [
          "Onboarding lists inquiries from your city. Open one to read it, add an internal note, or mark that you contacted the person.",
          "Jobs board shows every job in your pincodes. Overdue jobs are flagged.",
          "Open a job to see who has it and its history."
        ] },
        { id: "mf_dispatch", title: "Help a job nobody has taken", where: "Jobs board", steps: [
          "Open the job and read the history.",
          "Press Ask providers to take it. They are reminded (a record for now, messages come later).",
          "Or choose an eligible provider from the list and press Assign. You must write a reason.",
          "You cannot cancel a job. Ask operations."
        ] }
      ],
      cannot: [
        "See other cities.",
        "Make two master franchises for the same city.",
        "Change an inquiry beyond notes and marking contacted. Operations run the case."
      ],
      tips: ["Your franchises cannot overlap each other. Providers can."]
    },
    {
      id: "franchise", group: "network", name: "Franchise", icon: "📍",
      short: "Runs an area (some pincodes) of a city. Accepts providers.",
      youAre: "You look after an area of the city. You decide which service providers work for you and you watch the inquiries and jobs in your pincodes.",
      reportsTo: "Your master franchise.",
      manages: "Service providers under you, and your pincodes.",
      menu: [
        { group: "Overview", items: [{ label: "Dashboard", what: "A quick look." }] },
        { group: "Customers", items: [{ label: "Onboarding", what: "Inquiries in your pincodes (read, notes, mark contacted)." }] },
        { group: "Operations", items: [{ label: "Jobs board", what: "Every job in your pincodes." }] },
        { group: "Network", items: [
          { label: "Organisations", what: "Your providers, their areas and services, and requests from other providers to join you." },
          { label: "Staff", what: "Invite people into your providers." }
        ] }
      ],
      tasks: [
        { id: "fr_provider", title: "Add a service provider", where: "Organisations", steps: [
          "Open Organisations and find your franchise.",
          "Press + to add a Service provider. Give it a name.",
          "Press the map icon on the provider to set its pincodes. Only pincodes inside your area are allowed.",
          "Providers may overlap each other: two providers can look after the same pincode.",
          "Press Services on the provider to choose what it offers (or ask the provider to).",
          "Invite the provider's admin from Staff."
        ] },
        { id: "fr_accept", title: "Accept a provider from another franchise", where: "Organisations → Providers (on your franchise row)", steps: [
          "A provider that wants to work in your pincodes asks to register under you.",
          "Open Organisations and press Providers on your franchise row.",
          "Waiting requests show Accept and Reject. Reject needs a reason.",
          "Once you accept, that provider can hold your pincodes. If you end the registration later, it loses the pincodes only you covered."
        ], tips: ["The provider keeps its own franchise too. Each franchise sees only its own pincodes."] },
        { id: "fr_switch", title: "Switch off a service for a provider", where: "Organisations → Services", steps: [
          "Press Services on the provider.",
          "Beside the service press Switch off and write a reason (for example a failed quality check).",
          "The provider stops seeing new jobs for it and its workers lose it. Press Switch on to restore it."
        ], tips: ["The provider cannot do this to itself."] },
        { id: "fr_dispatch", title: "Help a job nobody has taken", where: "Jobs board", steps: [
          "Open the job, then press Ask providers to take it, or give it to an eligible provider with a reason."
        ] }
      ],
      cannot: [
        "Take a pincode that another franchise already has.",
        "Cancel a job (operations do that).",
        "See jobs outside your pincodes."
      ],
      tips: ["Your area can be one pincode or many. You can hold the same pincode in two named areas; it is still yours."]
    },
    {
      id: "provider_admin", group: "network", name: "Service provider (admin)", icon: "🧰",
      short: "A contractor. Accepts jobs from the pool and gives them to its workers.",
      youAre: "You run a company that does the work. You choose which services you offer, you accept jobs that come up, and you give each job to one of your workers.",
      reportsTo: "Your franchise.",
      manages: "Your workers and what you and they can do.",
      menu: [
        { group: "Overview", items: [{ label: "Dashboard", what: "A quick look." }] },
        { group: "Operations", items: [{ label: "Jobs board", what: "My pool: jobs you could take. All jobs: the ones you have." }] },
        { group: "Network", items: [
          { label: "Organisations", what: "Your own organisation: Services you offer and Franchises you are registered under." },
          { label: "Staff", what: "Your workers: invite them and choose what each can do." }
        ] }
      ],
      tasks: [
        { id: "sp_areas", title: "Choose the pincodes you serve", where: "Organisations → map icon on your company", steps: [
          "Open Organisations and press the map icon (Territories) on your company.",
          "Add an area: a name and the pincodes you serve. You can add, change or remove areas whenever you like.",
          "Only pincodes of the franchise you were created under, or of a franchise that has accepted you, are allowed. Each pincode stays under the franchise that covers it.",
          "To serve a pincode that belongs to another franchise, first ask that franchise to register you (Franchises button), then add the pincode once it accepts."
        ], tips: ["Other providers may serve the same pincodes. That is normal: the first to accept a job gets it.", "If a registration ends, the pincodes only that franchise covered are removed from your areas."] },
        { id: "sp_services", title: "Choose the services you offer", where: "Organisations → Services", steps: [
          "Open Organisations, find your company and press Services.",
          "Tick every service you can do. Search by name.",
          "Press Save. You will see new jobs for these services in your area."
        ], tips: ["If your franchise switches a service off you will see why. You cannot switch it on yourself."] },
        { id: "sp_pool", title: "Take a job from the pool", where: "Jobs board → My pool", steps: [
          "Open Jobs board. My pool lists jobs waiting for a provider in your area for services you offer.",
          "You see the service, the area, the type and size of the property, and how long you have to accept. You do not see the customer's name, phone or full address yet.",
          "Press Accept. The first provider to accept gets the job. If someone was faster you are told it is taken.",
          "Press Turn down if you do not want it: it disappears from your pool only."
        ], tips: ["Overdue means it has waited too long. Accepting quickly keeps customers happy."] },
        { id: "sp_worker", title: "Give the job to a worker", where: "Jobs board → Open", steps: [
          "Open the job you accepted. You now see the customer and the full address.",
          "Choose a worker from the list. Only your active workers who can do this service are listed.",
          "Press Assign. You can change the worker until the work starts.",
          "If nobody is listed, open Staff and tick that service for a worker (Services button)."
        ] },
        { id: "sp_schedule", title: "Set the visit time and check the finished work", where: "Jobs board → Open", steps: [
          "Open an accepted job, pick the visit time and press Set time. The customer sees it.",
          "When the worker has finished, the job shows under To check. Open it and press Work is fine: check it, or Send back with a reason.",
          "After it is checked the customer can rate it, or you can press Close the job."
        ], tips: ["Once the work has started the job can no longer be given back or cancelled."] },
        { id: "sp_back", title: "Give a job back", where: "Jobs board → Open", steps: [
          "If you cannot do it, press Give back to the pool and write why.",
          "It returns to the pool for other providers, not for you."
        ] },
        { id: "sp_invite", title: "Invite a worker", where: "Staff", steps: [
          "Open Staff, press Invite, choose your company, the role Field worker, their name and email.",
          "Once they accept, press Services beside them and tick what they can do. They can only get services you offer."
        ] },
        { id: "sp_franchise", title: "Work in an area of another franchise", where: "Organisations → Franchises", steps: [
          "Press Franchises on your company.",
          "Choose the franchise that runs that area and press Ask.",
          "Wait for that franchise to accept. After that you can add its pincodes to your own areas (see Choose the pincodes you serve)."
        ] }
      ],
      cannot: [
        "See the customer before you accept.",
        "Switch a service back on after your franchise switched it off.",
        "Pick a pincode outside the areas of the franchises you are registered under."
      ],
      tips: ["Other providers see the same pool. Speed matters."]
    },
    {
      id: "field_worker", group: "network", name: "Service worker", icon: "👷",
      short: "Does the visit at the property.",
      youAre: "You are the person who goes to the property. Your provider gives you jobs.",
      reportsTo: "Your service provider.",
      manages: "Nothing. You see only jobs given to you.",
      menu: [
        { group: "Operations", items: [{ label: "Jobs board", what: "Only the jobs your provider gave you, with the customer and address." }] }
      ],
      tasks: [
        { id: "fw_jobs", title: "See my jobs", where: "Jobs board", steps: [
          "Open Jobs board. You see only jobs assigned to you.",
          "Open one to see the service, the customer's name and phone, and the full address."
        ] },
        { id: "fw_services", title: "Which jobs I can be given", where: "Ask your provider admin", steps: [
          "Your provider admin ticks the services you can do under Staff → Services.",
          "You only get jobs for those services."
        ] },
        { id: "fw_work", title: "Do the visit: on the way, start, finish", where: "Jobs board → Open", steps: [
          "Press I am on the way so the customer knows. If you cannot go, press I cannot attend and say why: your provider gives it to someone else.",
          "At the property ask the customer to open their request and press Show my start code. Type the 6 digits and press Start the work.",
          "When you have finished, ask for the finish code the same way. Write what you did and press Finish the work.",
          "For a site visit also fill in the details that were wrong on file (address, pincode, area). This verifies the property.",
          "Your provider or operations then check the work. If it is sent back, finish it again with a new code."
        ], tips: ["A code works for 10 minutes and five tries. If it stops working ask the customer for a new one.", "Never ask a customer to read out a code before you are at the property."] },
        { id: "fw_earn", title: "Your provider's earnings (providers)", where: "Earnings", steps: [
          "Open Earnings to see what your organisation has earned from closed jobs: a share of what the customer paid for each job.",
          "The cards show what is waiting to be paid, what is in a payout, and what has been paid.",
          "Payouts are recorded and approved by our team. When one is approved you get a message in the bell."
        ], tips: ["A share appears a few minutes after a job is closed. A cancelled job earns nothing."] },
        { id: "fw_stats", title: "See how you are doing", where: "Reports", steps: [
          "Open Reports. You see your own jobs for the last 30 days.",
          "The tiles show how many jobs you had, how many you completed, how long the work took on average and your customers' average rating.",
          "Change the period with the buttons at the top."
        ], tips: ["Only you can see your own numbers (and your provider sees the team's)."] },
        { id: "fw_chat", title: "Message the customer or your provider", where: "Jobs board → Open → Messages", steps: [
          "Open the job and open Messages. It is available once a provider has taken the job.",
          "Write your message and press Send. The customer, your provider and the office can see it.",
          "New messages from others are shown as (n new) and arrive in your bell."
        ], tips: ["Use messages for quick questions such as which gate or which flat. The customer sees only your first name.", "Do not share a start or finish code in chat."] },
        { id: "fw_notify", title: "Know when something needs you", where: "Bell at the top", steps: [
          "The bell at the top shows how many notifications are unread. Press it to open them.",
          "You are told when a job is given to you, when work is sent back, and when the customer approves or pays for extra work. You also get a reminder the day before a visit and two hours before it starts.",
          "Press a notification to go to the job. It is then marked as read."
        ], tips: ["Press Also send these to me by email on the Notifications page if you want a copy by email."] },
        { id: "fw_myday", title: "See your day on your phone", where: "My day", steps: [
          "Open My day. Your jobs are listed, the ones in progress and today's first, then the ones coming up.",
          "Each card shows when, where, who the customer is and the next thing to do.",
          "Tap Directions to open the map, or Call to phone the customer.",
          "Tap I am on the way when you set off, then Open and start when you are with the customer.",
          "To keep it on your phone like an app, open the site in your browser, open the browser menu and choose Add to Home screen. It then opens straight to My day."
        ], tips: ["The list refreshes by itself every minute, or press the refresh button.", "You do everything on the job in the same screen the office uses, so nothing is lost."] },
        { id: "fw_checklist", title: "Follow the checklist and take photos", where: "Jobs board → Open (after you start)", steps: [
          "After you start, the job shows its checklist. Answer each step: tick it, type a note or a number, or pick an option.",
          "Press Take or choose a photo. Choose Before the work, After the work or Other, and the step it belongs to if any. Allow location if your phone asks: it records where the photo was taken.",
          "The screen lists anything still missing. You cannot finish until every required step, step photo and (if the service asks) before and after photo is done.",
          "Then finish with the customer's code as usual."
        ], tips: ["Take the before photo before you touch anything.", "The same photo cannot be added twice."] },
        { id: "fw_extra", title: "Ask for extra work", where: "Jobs board → Open (work in progress)", steps: [
          "If you find more work than was sold, press More work is needed on the job.",
          "Give it a short title, say why it is needed, and list each item with how many and the price of one in rupees.",
          "Press Save, then Add a photo that shows the problem. At least one photo is needed.",
          "Press Send for approval. The job now waits. You cannot finish or carry on until the customer approves and pays.",
          "If it is a large amount, your provider checks it first. You can withdraw the request until the customer approves."
        ], tips: ["If the customer says no, carry on with the work that was agreed.", "You will see the job go back to In progress as soon as the payment is approved."] }
      ],
      cannot: ["See other workers' jobs, other customers, or anything outside your jobs."],
      tips: ["Never share a customer's phone number or address."]
    },

    /* ------------------------------------------------------------------ customers */
    {
      id: "property_owner", group: "customers", name: "Property owner", icon: "🏠",
      short: "A customer with a house or flat. Usually an NRI.",
      youAre: "You own a property in India and want it looked after.",
      reportsTo: "—", manages: "Your own properties, orders and documents.",
      menu: [
        { group: "Overview", items: [{ label: "Dashboard", what: "Home." }, { label: "Getting started", what: "Your request, and any offer we have sent you to accept." }] },
        { group: "My property", items: [{ label: "Properties", what: "Your properties. Each has Services, Plans and History (orders, plans, owners and every job done on it, with checklist and photos, even before you owned it)." }, { label: "Documents", what: "Your private vault." }] },
        { group: "Services", items: [{ label: "Orders", what: "What you bought and whether it is paid." }, { label: "Service requests", what: "Where your paid services and plan visits stand." }] }
      ],
      tasks: [
        { id: "po_start", title: "Get started", where: "Properties", steps: [
          "Add your property (address, pincode, type, size).",
          "Book the site visit first. A person visits, checks the property and corrects the details. You pay for it like any service.",
          "After the visit you can choose services or a plan."
        ] },
        { id: "po_pay", title: "Pay", where: "Orders", steps: [
          "Pay by bank transfer, cheque, UPI or cash as our team tells you.",
          "Our team records the payment with proof and a second person approves it. Your order then shows Paid."
        ] },
        { id: "po_requests", title: "Follow a service or ask for a plan visit", where: "Service requests", steps: [
          "Each paid service shows here with where it stands and the planned visit time.",
          "For a plan visit press Request a visit (or Urgent)."
        ] },
        { id: "po_codes", title: "Let the worker start and finish, and rate", where: "Service requests", steps: [
          "When the worker is with you press Show my start code and read the 6 digits to them. It works for 10 minutes.",
          "When the work is done press Show my finish code the same way.",
          "After we have checked the work, rate it from 1 to 5."
        ], tips: ["Never share a code with anyone who is not at your property."] },
        { id: "po_legal", title: "Ask for a legal service", where: "Legal services", steps: [
          "Open Legal services. Search for the service you need, for example sale deed, and press Start. If it is about one of your properties, choose it first.",
          "Answer the questions. Each answer is saved when you leave the field. Optional questions can stay empty.",
          "Under Documents we need, add a file for each item (a photo or a PDF). Press the name of a file to open it, or the bin to remove it.",
          "The page lists what is still missing. When it is all there, press Send to our team.",
          "After sending you cannot change the answers or documents, but you can withdraw the request. Our team reviews it. If something is missing they ask you in the bell and on the request page: add it and press Send to our team again.",
          "When our team sends a price you see each fee on its own line (our fee, government fees, stamp duty), any discount and the total. Press Accept and pay, or Decline. The offer stays open until the date shown.",
          "If you accept, an order is made for the total. Pay it from Orders like any other (we record your payment and a second person approves it).",
          "Once the payment is approved your request becomes a case and we find a legal partner in your area. The request page shows who has taken it, the steps of the work as they are done, the finished documents (also kept in your vault, folder Legal cases) and a message box to talk to them.",
          "When the case is complete you can rate the work from 1 to 5, once."
        ], tips: ["You can stop at any time. Your draft is kept and nobody else can see it until you send it.", "Your files are kept in your vault, in the folder Legal cases."] },
        { id: "po_extra", title: "Approve or decline extra work", where: "Service requests", steps: [
          "If the worker finds more work, your request shows Extra work with the reason, the photos, each item and the total.",
          "Press Approve and pay, or Decline. Declining sends the worker back to the work that was agreed.",
          "If you approve, an order is made for that amount. Pay it from Orders like any other. The worker carries on once we approve the payment."
        ] },
        { id: "po_chat", title: "Message the provider about your job", where: "Service requests → Messages", steps: [
          "Open Messages on your request. It is available once a provider has taken your job.",
          "Write your message and press Send. The worker, the provider and our team can read it.",
          "You see the people by their first name and role. You are told in the bell when someone replies."
        ], tips: ["Never share a code in chat. Show it to the worker only when you are together.", "The chat closes when the job is finished, but you can still read it."] },
        { id: "po_notify", title: "Follow your requests from the bell", where: "Bell at the top", steps: [
          "The bell at the top shows what is new: a provider took your request, the visit time, the worker is on the way, the work is done, extra work needs your decision, a payment was received. You also get a reminder the day before a visit, when an order is still unpaid, when a plan is about to end, and when a document in your vault is about to expire.",
          "Press a notification to go straight to the right page. It is then marked as read.",
          "On the Notifications page you can switch email copies on or off. Messages in the app are always on."
        ] },
        { id: "po_report", title: "See what was done and the photos", where: "Service requests", steps: [
          "When the work is done, open What was done, and photos on your request.",
          "You see the checklist the worker followed and the before and after photos. They are also kept in your vault under the property's Job evidence folder."
        ] }
      ],
      cannot: ["Change what a builder bought for your unit.", "Edit the address, pincode, type or area after the site visit."],
      tips: []
    },
    {
      id: "project_owner", group: "customers", name: "Project owner", icon: "🏗️",
      short: "A builder or society with many units.",
      youAre: "You build or manage many units and pay MPD offline.",
      reportsTo: "—", manages: "Your projects and their units.",
      menu: [
        { group: "My property", items: [{ label: "Projects", what: "Your projects and units. Register an owner for a unit with proof." }] },
        { group: "Services", items: [{ label: "Buy for several properties", what: "Choose units, then the same services or one plan for all, and pay once." }] }
      ],
      tasks: [
        { id: "pr_owner", title: "Register an owner for a unit", where: "Projects", steps: [
          "Open the project, then the unit, and add the owner with proof documents.",
          "Our team reviews it, then the owner is invited by email and accepts."
        ] },
        { id: "pr_bulk", title: "Buy for many units and pay once", where: "Orders → Buy for several properties", steps: [
          "Tick the units. Each needs its site visit done first.",
          "Choose the services or one plan and press Show me the price.",
          "Place the orders. Our team records one payment for the whole batch and a second person approves it."
        ] }
      ],
      cannot: ["Change what the owner of a unit bought for themselves."],
      tips: []
    }
  ],

  /* Tasks shared by Super admin and Operations */
  headOfficeTasks: [
    { id: "ho_case", title: "Take an inquiry all the way to a paying customer", where: "Onboarding", steps: [
      "Open Onboarding. New inquiries are at the top and are already assigned to the franchise whose area they are in.",
      "Open the case. Press Mark contacted after you speak to them.",
      "When they sign up with the same email, the case links to them by itself. You can also link by hand.",
      "Choose their property. Then arrange the site visit (next task). Nothing else can be offered before it.",
      "After the visit, press Make an offer: add services (or one plan), an optional discount with a reason, and how many days it stays open. The server works out the price.",
      "The customer accepts under Getting started. An order is created at that price.",
      "Record and approve its payment (see Record a payment). When it is paid the case becomes Active."
    ], tips: ["Mark Lost with a reason if it goes nowhere. You can reopen it later.", "Internal notes are never shown to the customer."] },
    { id: "ho_visit_order", title: "Arrange a site visit for a customer", where: "Onboarding → the case", steps: [
      "In the case press Arrange site visit, choose the site-visit service and give a reason.",
      "This makes an order for the customer. Record its payment as usual.",
      "When it is paid the visit appears under Site visits and in the job pool."
    ] },
    { id: "ho_visit_done", title: "Complete a site visit", where: "Site visits", steps: [
      "Open Site visits: paid visits waiting for someone to go.",
      "After the visit press Visit done. Write what was found.",
      "Fill in only the details that were wrong on file (address, pincode, area). Leave the rest empty.",
      "Complete the visit. The property is now verified, the owner can buy services and plans, and the checked facts are locked for the owner."
    ], tips: ["A site visit can be completed only once, and only against its paid order."] },
    { id: "ho_record", title: "Record a payment you received", where: "Orders → Waiting for payment", steps: [
      "Open Orders, tab Waiting for payment, and find the order (search by reference).",
      "Press Record payment. If the order belongs to a batch, the button says Record batch payment and covers every order in it.",
      "The amount is filled in and must equal the total. Choose how it was paid and enter the reference (UTR, cheque number or UPI reference). Choose the date the money arrived.",
      "Attach the proof: the bank slip, cheque image or screenshot.",
      "Save. The order is not paid yet. A different person must approve it."
    ], tips: ["The same reference or slip cannot be used twice."] },
    { id: "ho_approve", title: "Approve (or reject) a payment", where: "Payments", steps: [
      "Open Payments. Payments waiting for approval are listed with who recorded them.",
      "Open the proof and compare it with the bank statement.",
      "Press Approve to mark the order paid (a plan then starts, and the paid services become jobs). Or Reject with a reason: the order stays unpaid.",
      "If the buttons are missing you recorded this payment yourself. A colleague must approve it. You can Withdraw your own mistake."
    ] },
    { id: "ho_kyc", title: "Review an identity check", where: "KYC review", steps: [
      "Open KYC review and a waiting record.",
      "Look at the scan (the link works for five minutes) and the masked number.",
      "Approve, or reject with a reason."
    ] },
    { id: "ho_reg", title: "Review an owner registered by a builder", where: "Owner registrations", steps: [
      "Open a registration. Read the proof documents.",
      "Approve to send the owner an invitation by email, or reject with a reason."
    ] },
    { id: "ho_dispatch", title: "Help a job nobody has taken", where: "Jobs board", steps: [
      "Open Jobs board and choose All jobs or Waiting for a provider. Overdue jobs are flagged.",
      "Open the job: see who is eligible. Press Ask providers to take it, or choose a provider and Assign with a reason.",
      "To cancel a job that has not started press Cancel the job and write why. A plan visit goes back into the customer's plan."
    ], tips: ["Cancelling a job the customer paid for does not refund anything by itself. Handle the money separately."] },
    { id: "ho_legalcase", title: "Take and work a legal case (legal provider)", where: "Legal cases", steps: [
      "First make sure your organisation offers the legal service: under your organisation, Services, tick it (operations must have switched the service on). You also need the area (pincode) as for any service.",
      "When a customer has paid, the case appears under Legal cases, My pool, and you are told in the bell. You see the service, the area and the order total, but not who the customer is.",
      "Press Accept. The first provider to accept gets it. Turn it down hides it from you only.",
      "After accepting you see the customer, their answers and their documents (each link works for five minutes and is recorded), and you can message them.",
      "Press Work has begun when you start. If you cannot do it, press Give it back (before work has begun) and write why; it returns to the pool.",
      "Once work has begun the case shows its steps. Press Tick the next step as you finish each one (the customer is told); Take back the last step fixes a slip.",
      "Under Documents for the customer type a name, choose the file and press Deliver. It goes into the customer's own vault. A wrong file can be taken back with the bin icon until you complete the case.",
      "When every step is ticked and at least one document is delivered, press Complete the case. The customer is asked to rate your work and you are told the rating."
    ], tips: ["Nobody taking a case within a day alerts operations.", "A completed case cannot be changed.", "When a case is completed the provider, the franchise and the master franchise of the area earn their shares under Earnings (government fees and stamp duty earn nothing). A case with no area pays the provider only.", "A request that was not about a property has no area: it is in nobody's pool and a franchise cannot see it. Operations are told, and give it to a provider that offers the service. Only the provider earns on such a case (no franchise or master franchise share)."] },
    { id: "ho_legalhand", title: "Hand out or cancel a legal case", where: "Legal cases", steps: [
      "Open Legal cases. A case nobody has taken shows Overdue after a day.",
      "Press Open. Nudge providers sends them a reminder. Or choose a provider under Give it to a provider, write why and press Give it. Only providers that offer the service, are active with staff and cover the area are listed (for a case with no area, any such provider).",
      "Operations only: Cancel the case with a reason if it cannot be done. The customer and the provider are told. Refunds are handled with the customer outside the app."
    ] },
    { id: "ho_legaloffer", title: "Review a legal request and send a price", where: "Legal requests", steps: [
      "Open Legal requests and press Open on a request. Read the answers and open the documents.",
      "If something is missing press Ask for more and say exactly what. The customer is told and can add it, then sends the request again.",
      "To send a price press Send an offer. Add a line for each part: your professional fee, government fees, stamp duty or other. Each line has a description and an amount in rupees. Add a discount only with a reason. Choose how many days the offer stays open.",
      "Check the total shown (the system works it out again when you send). Press Send the offer. The customer is told. You can change the offer while it is open: the new one replaces it.",
      "If the customer accepts, an order appears under Orders. Record its payment as usual; a second person approves it.",
      "If you cannot do the service press We cannot take it and write a reason the customer will read."
    ], tips: ["Show government fees and stamp duty on their own lines so the customer sees what goes to whom.", "An offer cannot be accepted after its last day: send a new one if the customer asks."] },
    { id: "ho_legalreq", title: "See the legal requests customers have sent", where: "Legal requests", steps: [
      "Open Legal requests. It lists what customers have sent (drafts are private to the customer and never shown).",
      "Press Open on a request: you see the customer's contact, every answer and each document. Press a document name to open it (the link works for five minutes and is recorded under your name).",
      "To act on it see Review a legal request and send a price."
    ] },
    { id: "ho_legalform", title: "Set up the form and documents of a legal service", where: "Legal service forms", steps: [
      "Open Legal service forms. The legal and professional services are listed by group, each showing Version n or Not set up.",
      "Press the pencil on a service. Write a few lines of introduction (optional).",
      "Add the questions the customer answers: the wording, the kind of answer (short answer, paragraph, number, date, yes or no, pick one), whether it is required, a heading to group them, and a help line.",
      "Add the documents the customer must give: the name, whether it is required, how many files, and help such as All pages, clear.",
      "Add the progress steps the customer will follow, for example Documents received, Draft prepared, Completed (two to twelve, in order).",
      "Press Save as a new version. Cases already started keep the version they began with."
    ], tips: ["The property transactions services come with a first version. Check them and improve them.", "Keep questions to what a lawyer really needs. Long forms put customers off."] },
    { id: "ho_checklist", title: "Write a checklist for a service", where: "Service catalogue", steps: [
      "Open Service catalogue and find the service. Press the list icon (Checklist).",
      "Add steps. For each: what the worker does, the answer type (tick, note, number or pick one), whether it is required, and whether it needs a photo.",
      "Tick The worker must add a before photo and an after photo if you want those every time.",
      "Press Save. This makes a new version. Visits that have already started keep the version they began with."
    ], tips: ["Keep checklists short. Every required step has to be answered before the worker can finish.", "Saving an empty list switches the checklist off for new visits."] },
    { id: "ho_override", title: "Start or finish a job without the customer's code", where: "Jobs board → Open", steps: [
      "Use this only when the customer truly cannot give a code (for example they are abroad and unreachable).",
      "Open the job and press Start without a code (or Finish without a code). Write a clear reason of at least ten characters.",
      "It is recorded with your name. For a site visit, complete it from Site visits first."
    ], tips: ["Nothing else can be done on a job that has started: it can no longer be cancelled."] },
    { id: "ho_catalogue", title: "Add or change a service and its price", where: "Service catalogue and Pricing", steps: [
      "In Service catalogue add or edit the service: name, descriptions, picture, active, show on homepage.",
      "In Pricing, pick its rate type (for example per sq ft or lump sum).",
      "Make or edit a price list (draft), set the price per pincode, then publish it. Only one list is live at a time.",
      "A service can be bought only if it is active, available in the area and priced there."
    ], tips: ["Inactive means hidden from new bookings. Existing jobs are not affected."] },
    { id: "ho_plan", title: "Make a plan", where: "Pricing → Plans", steps: [
      "Add the services in the plan and how many times each is done (the recurrence).",
      "Optionally a discount on a service and a discount on the whole plan.",
      "There is no typed-in price: it is worked out for each property from its prices and size. Use Try a price to check one."
    ] },
    { id: "ho_network", title: "Build the network", where: "Organisations, Staff, Masters", steps: [
      "In Masters switch on the pincodes you will serve.",
      "In Organisations add a Master franchise and choose the city it runs (one per city); its area is the whole city automatically.",
      "The master franchise adds franchises, who add providers. Providers choose their services.",
      "Invite people from Staff. A pincode is available to customers only when it is switched on AND an active provider with staff covers it."
    ] },
    { id: "ho_site", title: "Edit the website", where: "Website content", steps: [
      "Change homepage sections, questions and answers, testimonials and the team.",
      "Saving updates the public website."
    ] }
  ],

  /* The journey of one request, step by step */
  journey: [
    { actor: "Customer", title: "Asks on the website", screen: "Website form", text: "A person fills in the Talk to us form: name, email, country, pincode and what they need.",
      sees: { "Operations": "A new case appears in Onboarding.", "Franchise": "If the pincode is in your area, the case is yours to read.", "Customer": "A thank-you message." } },
    { actor: "Operations", title: "Contacts them", screen: "Onboarding", text: "Someone calls or emails, adds a note and marks the case Contacted.",
      sees: { "Franchise": "You can add notes and mark contacted too.", "Customer": "—" } },
    { actor: "Customer", title: "Creates an account and adds the property", screen: "Getting started → Properties", text: "They sign up with the same email, so the case links to them, then add their property.",
      sees: { "Operations": "The case moves to Registered, then Property added.", "Customer": "Getting started shows what is next." } },
    { actor: "Operations", title: "Arranges the site visit", screen: "Onboarding → Arrange site visit", text: "Every property starts with a site visit. An order for it is made for the customer.",
      sees: { "Customer": "The site-visit order appears in Orders.", "Operations": "Waiting for payment." } },
    { actor: "Two people", title: "The visit is paid", screen: "Orders, then Payments", text: "One person records the money with proof. A different person approves. Only then is it paid.",
      sees: { "Operations": "The first records, the second approves.", "Customer": "Order shows Paid." } },
    { actor: "Providers", title: "The visit job is in the pool", screen: "Jobs board → My pool", text: "Every provider that covers the pincode and offers the service sees it. The first to accept gets it.",
      sees: { "Provider": "You see the area and property type. No name or address yet.", "Franchise": "You see it too and can nudge.", "Customer": "Service requests: finding a provider." } },
    { actor: "Provider", title: "Accepts and gives it to a worker", screen: "Jobs board → Open", text: "After accepting, the customer and address are visible. The provider picks one of its workers who can do the service.",
      sees: { "Worker": "The job appears in their list.", "Customer": "Service requests: a person has been assigned." } },
    { actor: "Operations", title: "The visit is done", screen: "Site visits → Visit done", text: "Today operations record the visit and correct the details. (Soon the worker does this on the job.) The property is now verified.",
      sees: { "Customer": "They can now choose services and plans.", "Operations": "The job closes by itself." } },
    { actor: "Operations", title: "Makes an offer", screen: "Onboarding → Make an offer", text: "Services or one plan, priced by the server for that property, with an optional discount and reason.",
      sees: { "Customer": "Getting started shows the price breakdown. They accept or decline.", "Operations": "Waiting for the customer." } },
    { actor: "Two people", title: "The order is paid", screen: "Orders, then Payments", text: "Same two-person rule. A plan starts when paid. The customer becomes Active.",
      sees: { "Customer": "Orders show Paid. The plan shows visits left.", "Operations": "Case is Active." } },
    { actor: "Providers", title: "Each paid service becomes a job", screen: "Jobs board", text: "Same pool, same first-to-accept. For plan visits the customer presses Request a visit.",
      sees: { "Customer": "Service requests shows each one.", "Provider": "Accept, then assign a worker." } },
    { actor: "Worker", title: "Does the work", screen: "Jobs board → Open", text: "On the way, then the customer shows a start code. The work is done, the customer shows a finish code. For a site visit the worker also corrects the property details.",
      sees: { "Customer": "Shows their own codes, and later sees the checklist and photos.", "Provider": "Sees it finished and checks it.", "Operations": "Job history. Can start or finish without a code, with a reason." } },
    { actor: "Provider", title: "Checks the work, the customer rates it", screen: "Jobs board → To check", text: "The provider (or operations) checks it, or sends it back. Then the customer can rate it and the job closes.",
      sees: { "Customer": "Rate from 1 to 5.", "Operations": "Closed." } },
    { actor: "Customer", title: "Approves extra work", screen: "Service requests", text: "If the worker finds more work they send a request with items, a reason and photos. A large one is checked by the provider first. The customer approves and pays (an order is made), or declines. Only then does the work continue.",
      sees: { "Customer": "The request, with photos and the total, and an Approve and pay button.", "Provider": "Signs off a large request. Can cancel one.", "Operations": "The extra work, its order and its payment." } }
  ],

  /* The organisation tree for the explorer. `role` links to a role in `roles`. */
  org: [
    { id: "head", name: "Head office", role: "super_admin", also: "ops", level: 0, invites: "Nobody above. A super admin invites operations staff and master franchises.",
      sees: "Everything.", does: "Sets up services, prices, pincodes and the network. Approves money." },
    { id: "mf", name: "Master franchise: Sample City", role: "master_franchise", level: 1, parent: "head", invites: "Invited by head office.",
      sees: "Every franchise, provider, inquiry and job in its city.", does: "Adds franchises and providers, sets areas, invites people, nudges jobs." },
    { id: "fn", name: "Franchise: North area", role: "franchise", level: 2, parent: "mf", invites: "Invited by the master franchise.",
      sees: "Its providers, and inquiries and jobs in its pincodes.", does: "Adds providers, accepts providers from elsewhere, switches a provider's service off." },
    { id: "fs", name: "Franchise: South area", role: "franchise", level: 2, parent: "mf", invites: "Invited by the master franchise.",
      sees: "Its providers, and inquiries and jobs in its pincodes. Never North's.", does: "Same as North, in its own pincodes." },
    { id: "p1", name: "Provider: FixIt Services", role: "provider_admin", level: 3, parent: "fn", invites: "Invited by its franchise.",
      sees: "Its own pool, jobs and workers.", does: "Chooses services, accepts jobs, gives them to workers." },
    { id: "p2", name: "Provider: HomeCare Co", role: "provider_admin", level: 3, parent: "fn", invites: "Invited by its franchise.",
      sees: "Its own pool, jobs and workers. It may share pincodes with FixIt.", does: "The same, in competition for the same jobs." },
    { id: "w1", name: "Worker: Asha", role: "field_worker", level: 4, parent: "p1", invites: "Invited by the provider admin.",
      sees: "Only jobs given to her.", does: "Does the visit." }
  ],

  glossary: [
    { term: "Pincode", def: "A six-digit postal code. In MPD an area is a pincode." },
    { term: "Territory", def: "A named group of pincodes that an organisation looks after. The name is only a label." },
    { term: "Master franchise", def: "Runs one city. There is one per city." },
    { term: "Franchise", def: "Runs an area of a city. Never shares a pincode with another franchise." },
    { term: "Service provider", def: "A contractor with workers. Can share pincodes with other providers." },
    { term: "Service worker", def: "A person who goes to the property for a provider." },
    { term: "Upline", def: "The levels above you: franchise, master franchise, head office." },
    { term: "Site visit", def: "The first service for every property: a person visits, checks it and corrects the details." },
    { term: "Verified property", def: "A property whose site visit is done. Its checked facts are locked for the owner." },
    { term: "Job", def: "One piece of work at a property." },
    { term: "Pool", def: "Jobs waiting for a provider. Every eligible provider sees them. The first to accept gets the job." },
    { term: "Eligible", def: "A provider that is active with staff, covers the pincode, and offers the service." },
    { term: "Nudge", def: "Ask providers to take a job nobody has accepted." },
    { term: "Checklist", def: "The steps a worker follows for a service. An admin writes it; the job keeps a copy when the work starts." },
    { term: "Extra work", def: "More work the worker finds on site. They send it with photos and a reason; the customer approves and pays before the work continues." },
    { term: "Legal request", def: "A customer's request for a legal service: the answers to its form and the documents given. It is a private draft until the customer sends it to our team." },
    { term: "Intake form", def: "The questions a customer answers and the documents they give when they ask for a legal service. Each service has its own, set up by operations." },
    { term: "Earning", def: "The share of a job's price an organisation earns when the job is closed: the provider that did it, and the franchise and master franchise of its area. MPD keeps the rest." },
    { term: "Payout", def: "Money sent to an organisation for what it has earned. One admin records it with the bank reference and a different admin approves it." },
    { term: "Report", def: "A page of numbers about jobs and money for a period, showing only what your role is allowed to see: operations see everything, a franchise its area, a provider its own organisation, a worker their own jobs." },
    { term: "Chat", def: "Messages on one job between the customer, the worker, the provider and our team. It opens when a provider has taken the job and closes when the job is finished." },
    { term: "Reminder", def: "A notification sent automatically at the right time, for example a day before a visit, or when an order has not been paid. Each is sent once." },
    { term: "SLA", def: "The time a job is allowed to wait for a provider (2 hours, 30 minutes if urgent). If nobody accepts in time, operations and the area's franchise are alerted." },
    { term: "Notification", def: "A short message in the bell at the top about something that happened to your job, order or payment. A copy can also be sent by email." },
    { term: "Evidence", def: "Before and after photos taken on a job, with time and place. Kept in the customer's vault." },
    { term: "Code (start and finish)", def: "A 6-digit code the customer shows the worker on site. It works for 10 minutes. It proves the worker was there." },
    { term: "Override", def: "Operations starting or finishing a job without a code, with a written reason. Always recorded." },
    { term: "Overdue", def: "A job still waiting after two hours (thirty minutes if urgent)." },
    { term: "Plan", def: "A bundle of services with a number of visits, priced for each property." },
    { term: "Batch", def: "Orders for many properties bought together and paid with one payment." },
    { term: "Maker and checker", def: "Two people handle money: one records it, a different one approves it." },
    { term: "Offer (quotation)", def: "A priced proposal to a prospect. They accept it and an order is created." },
    { term: "Case", def: "One prospect's journey from first inquiry to paying customer." },
    { term: "Vault", def: "A customer's private place for documents." },
    { term: "KYC", def: "An identity check. Only a masked number is kept." },
    { term: "Price list", def: "Prices per pincode. Only one list is live at a time." },
    { term: "Rate type", def: "How a service is charged: a fixed amount, per sq ft, per hour, per visit and so on." }
  ]
};
