/* Scenarios, part 3: buying and paying (orders, plans, batches, offline payments with two people). */
chapter('orders', 'Buying and paying', '<p>Customers buy services or plans for a verified property. Payments are recorded by one admin and approved by another (maker and checker). Online payment does not exist yet: everything is offline.</p>', [
  T('PAY-01', 'Buy a service and see the price before you pay', ['C1'], [
    'Open the property\'s shop. Choose <b>Tap repair</b>. Press the button that shows the price.',
  ], ['A price preview shows the rate, the pincode, the total (Rs 1,000) and the order is only made when you confirm. The browser never decides the price.'], { tags: ['smoke', 'core'], pre: ['The property\'s site visit is done (SV-02).'] }),
  T('PAY-02', 'Place the order', ['C1'], [
    'Confirm the order for Tap repair.', 'Open Orders.',
  ], ['The order is listed as <b>Waiting for payment</b> with a short reference (O-XXXXXXXX) and the price from the preview.'], { tags: ['smoke', 'core'] }),
  T('PAY-03', 'A duplicate is warned about', ['C1'], [
    'Try to buy the same service for the same property again while the first order is open.',
  ], ['A warning says you already have it; you can go on anyway ("Order anyway") or stop.'], { tags: ['edge'] }),
  T('PAY-04', 'Cancel your own unpaid order', ['C1'], [
    'Open an unpaid order and cancel it.',
  ], ['It shows as cancelled. A paid order cannot be cancelled here.'], { tags: ['core'] }),
  T('PAY-05', 'Per-area service price follows the property', ['C1'], [
    'Buy Water tank cleaning for the 1,000 sq ft property.',
  ], ['The total is Rs 5,000 (or the minimum if larger): the area comes from the property, not from what you type.'], { tags: ['core'] }),
  T('PAY-06', 'OPS1 records a payment', ['OPS1'], [
    'Open <b>Orders</b>, tab <b>Waiting for payment</b>. Find the order by its reference. Press <b>Record payment</b>.',
    'Check the amount equals the total. Choose how it was paid (bank transfer), enter an invented reference (for example UTR100001), choose the date, and attach a proof file (a sample image or PDF).',
    'Save.',
  ], ['The payment is recorded with status "waiting for approval". The order is <b>still unpaid</b>. The customer is not told yet.'], { tags: ['smoke', 'core'] }),
  T('PAY-07', 'The recorder cannot approve', ['OPS1'], [
    'As OPS1 open <b>Payments</b> and look at the payment you just recorded.',
  ], ['There is no Approve or Reject button for you; you can only Withdraw it. (The server refuses too.)'], { tags: ['security', 'smoke'] }),
  T('PAY-08', 'OPS2 approves', ['OPS2', 'C1'], [
    'As OPS2 open Payments, open the proof, press <b>Approve</b>.', 'As C1 look at Orders and the bell.',
  ], ['The order becomes <b>Paid</b>. C1 gets "Payment received" in the bell. The paid service becomes a job (see JOB-01).'], { tags: ['smoke', 'core'] }),
  T('PAY-09', 'Reject a payment', ['OPS1', 'OPS2', 'C1'], [
    'OPS1 records another payment (new order). OPS2 presses <b>Reject</b> and writes a reason.',
  ], ['The order stays unpaid. C1 gets a notification with the reason. OPS1 can record it again properly.'], { tags: ['core'] }),
  T('PAY-10', 'Withdraw your own mistake', ['OPS1'], [
    'Record a payment with a wrong amount (you may need a wrong reference); then press Withdraw on it.',
  ], ['It is withdrawn; the order stays unpaid and can be recorded again.'], { tags: ['edge'] }),
  T('PAY-11', 'The amount must match; references and proofs cannot repeat', ['OPS1'], [
    'Record a payment with an amount different from the total.', 'Record one with a reference already used.', 'Attach the same proof file that was used before.',
  ], ['Each is refused with a clear message (amount must equal what is owed; the reference and the slip cannot be used twice).'], { tags: ['security', 'edge'] }),
  T('PAY-12', 'Only operations handle payments', ['FR1', 'PA1', 'C1'], [
    'Open <code>/admin/payments</code> and <code>/admin/orders</code> in each session.',
  ], ['Refused or missing for all but operations and the super admin.'], { tags: ['security'] }),
  T('PAY-13', 'Buy a plan', ['C1', 'OPS1', 'OPS2'], [
    'As C1 open the property\'s plans page and buy "Yearly home care". Check the price breakdown before confirming.', 'Pay it as in PAY-06 to PAY-08.',
  ], ['The breakdown shows each service, visits, discounts and the total. After approval the plan is <b>Active</b> with an end date 12 months away and the visits listed (Tap repair 2, Water tank cleaning 1).'], { tags: ['core'] }),
  T('PAY-14', 'A plan before payment has no visits', ['C1'], [
    'Buy a plan but do not pay. Look at Service requests.',
  ], ['The plan says it starts when the order is paid; visits cannot be requested yet.'], { tags: ['edge'] }),
  T('PAY-15', 'Request a visit from a plan', ['C1', 'PA1'], [
    'Open Service requests. Under "Request a visit from your plan" press <b>Request a visit</b> for Tap repair; do it again (the second visit).', 'Try a third time.',
  ], ['Each request uses one visit ("1 of 2 left"); the job appears in the pool. A third request says no visits are left. Cancelling a visit before work starts gives it back.'], { tags: ['core'] }),
  T('PAY-16', 'Urgent visit', ['C1', 'PA1'], [
    'Request an urgent visit.',
  ], ['The job is marked Urgent and its acceptance limit is 30 minutes instead of 2 hours (see JOB-08).'], { tags: ['edge'] }),
  T('PAY-17', 'Buy for several properties and pay once', ['PO1', 'OPS1', 'OPS2'], [
    'As PO1 (with units whose site visits are done) open Orders, <b>Buy for several properties</b>. Tick the units, choose Tap repair for all, press <b>Show me the price</b>, then <b>Place the orders</b>.', 'OPS1 opens Orders: the orders show as a batch. Press <b>Record batch payment</b>; OPS2 approves.',
  ], ['One batch payment covers every order in the batch; all turn paid together or none do. A unit without a verified property is refused with a reason.'], { tags: ['core'] }),
  T('PAY-18', 'An order in a batch cannot be paid alone', ['OPS1'], [
    'Try Record payment on a single order of a batch.',
  ], ['The message says it is part of a batch and to record one payment for the whole batch.'], { tags: ['edge'] }),
  T('PAY-19', 'Paying an order that is already paid or cancelled', ['OPS1'], [
    'Try to record a payment on a paid order and on a cancelled order.',
  ], ['Refused: "already paid" or "cancelled".'], { tags: ['edge'] }),
  T('PAY-20', 'Order history and references', ['C1', 'OPS1'], [
    'Compare the order list of C1 with what OPS1 sees under Orders for C1.',
  ], ['Same orders, references and totals. C1 sees only their own; OPS1 can search all.'], { tags: ['core'] }),
]);
