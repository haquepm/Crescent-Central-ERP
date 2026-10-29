# Crescent Digital Engineer Daybook — clarified operating model

This document refines the Site Execution module around the user's clarified purpose. The product is a daily engineer's daybook connecting site-wide face attendance, engineer-wise crew allocation, drawing-marked work fronts, measured output, QS verification and billing handoff.

## Non-negotiable business model

Attendance, labour allocation, work assignment and measurement are separate linked records. A present labourer is not automatically assigned to an engineer; an allocated labourer is not proof that work was completed; a quantity entered by an engineer is not billable until QS verification (and any configured downstream approval) is complete.

## Daily operating sequence

1. **Site-wide face attendance:** Labourers record attendance at the site's existing face-recognition attendance device/system. The Site Execution PWA consumes the verified attendance result for the relevant project and date. It must not implement a second facial-recognition engine or store face templates/biometric images. The existing PagarBook ID8 / attendance workflow has previously used exported Excel punch reports; first integration should accept a validated daily attendance feed/import mapped by the existing labour/employee ID. Do not alter the current Regular Muster or payroll process.
2. **Present labour pool:** The PWA displays workers marked present for the selected project and date. Show punch-in/out and attendance exceptions where the source provides them. Missing, unmatched, duplicate or conflicting attendance records are flagged for authorized HR/site-admin resolution; engineers cannot manufacture attendance by allocating a worker.
3. **Engineer crew allocation:** Each engineer selects available present workers and creates a dated crew allocation. A worker should not be simultaneously allocated to two active crews for overlapping time unless an authorized split/transfer is recorded. Track crew changes, transfers, partial-day allocations and release back to the available pool.
4. **Drawing-marked work front:** The engineer opens the approved drawing revision, chooses building/structure, floor, grid/zone and marks the exact work area or drawing element. The work front stores drawing revision, element/zone reference and a geometry/annotation overlay. Engineer selects activity and the crew (or a subset of the crew) doing that activity. Multiple work fronts/activities can be recorded for one crew in a day.
5. **Daily work and quantity entry:** Engineer enters the work completed for that activity and marked area. Capture dimensions, count, deductions, unit, calculation-rule version, remarks and photos as applicable. Support manual measurement and drawing-assisted measurement. For a single crew doing different activities or moving areas, create distinct work records so labour and output can be attributed accurately.
6. **Engineer daybook submission:** The daybook is a date-wise immutable/traceable summary of attendance imported, engineer's crew allocations, drawing-marked work fronts, activity-wise measured output, downtime/remarks, evidence and pending items. Drafts can be edited; submitted entries are corrected through a linked revision, not silently overwritten.
7. **QS verification:** QS sees a queue grouped by project/date/engineer/activity/work-front. QS opens the same drawing revision and markup, validates dimensions, quantities, unit, BOQ mapping, crew allocation and evidence. QS can verify full quantity, partially verify with a reason and accepted quantity, or reject/return with remarks. Every decision is auditable.
8. **Billing handoff:** Only QS-verified quantities enter the billing-eligible register. Expose approved quantities, BOQ item, unit, drawing/work-front reference, date range, engineer, QS verifier, source daybook and adjustment history to the Central ERP billing interface. Do not create or post subcontractor RA bills automatically in the first release. Use a controlled export/API handoff and reconciliation acknowledgement. Prevent the same verified quantity from being transferred twice.

## Role responsibilities

- **Attendance source / HR:** Maintain worker identity mapping and attendance exceptions in the existing attendance process; no new biometric capture in this app.
- **Site Engineer:** View present labour pool; create/maintain crew assignments; mark work area on approved drawing; record activity, quantity and evidence; submit daily daybook.
- **Project Manager:** Monitor allocations and daybook completeness; resolve operational exceptions; approve only if configured as a project gate.
- **Quantity Surveyor:** Independently verify or partially verify/reject submitted quantities and BOQ mappings; release verified quantities to billing.
- **Billing / Accounts:** Consume only the verified quantity register, map to billing period/subcontractor/BOQ as applicable, and acknowledge import.
- **Administrator:** Manage users, project access, masters and configuration; does not gain implicit measurement approval rights.
- **Management:** Consolidated view of attendance, labour deployment, output, verification and billing eligibility.

## Required data model additions

- attendance_sources: source system/device, integration type, active state and project/site mapping.
- attendance_batches: source batch, project, work date, file/source reference, checksum, import status, imported by and reconciliation counts.
- attendance_records: worker ID, project, work date, first-in/last-out, source status, raw source reference, exception state and source batch. Unique source attendance key prevents duplicate import.
- labour_engineer_allocations: project/date/engineer, start/end, allocation status, created/closed audit fields.
- labour_allocation_members: allocation/worker, allocated time range, role/trade, release/transfer details. Enforce no overlapping active allocations for the same worker unless an explicit approved split is represented.
- work_fronts: project/date/engineer, drawing revision, structure/floor/grid, activity, element or zone, drawing geometry/markup, work description and status.
- work_front_labour: work front, allocation/member/worker, contribution time or worker-days and allocation snapshot.
- daybook_entries: engineer, project, work date, sequence, weather/site condition/remarks, submission state and submitted timestamp.
- work_measurements: daybook entry, work front, activity, BOQ item, manual/drawing method, input dimensions/deductions, rule snapshot, measured quantity/unit and correction linkage.
- qs_verifications: measurement, QS user, verified quantity, rejected quantity, decision, reason, drawing/measurement check result and timestamp.
- billing_handoff_batches: period/project, export/API batch ID, idempotency key, status, acknowledged timestamp and reconciliation totals.
- billing_handoff_items: one record per QS-verified measurement or approved adjustment; store external ERP billing reference and transfer status.

## Key constraints and controls

- Attendance imports are idempotent and keyed to source attendance identity; preserve original source file/batch and never overwrite manual corrections in the existing muster.
- An engineer can allocate only workers whose attendance is present/eligible for that project/date. Exceptions require authorized resolution.
- Crew allocation is date/time-aware. Reassignment closes the previous allocation and records the new engineer; history remains visible.
- Every work front points to one immutable drawing revision. A new drawing revision never silently moves historical markup or quantity.
- A crew can perform multiple activities and work fronts in one day. Each output record has an explicit worker/crew contribution snapshot to avoid attributing the entire day's crew to every activity.
- Prevent duplicate active quantities for the same project/activity/drawing element/occurrence; manual work fronts use duplicate warnings and QS resolution.
- Engineer-entered quantity, QS-verified quantity and billing-transferred quantity are separate values/states. Never equate them.
- QS may accept less than the engineer's submitted quantity. The difference remains rejected/returned with reasons; billing uses only accepted quantity.
- A billing handoff is immutable and idempotent. Reconciliation/acknowledgement is required before marking it transferred.
- All status changes, corrections, allocations, attendance import resolutions and QS decisions are audit logged.
- No face image, face template or biometric identifier is stored in the Site Execution database.

## Core screens (revised)

1. Today's site attendance: date/site selector, present/absent/exception counts, worker search and source sync/import status.
2. Available labour pool: present workers grouped by trade, punch times and current allocation state.
3. My crew: engineer's allocated workers, add/remove/transfer/release actions and allocation timeline.
4. Drawing work-front planner: approved drawing revision, building/floor/grid/zone, drawing markup and activity selection.
5. Record work: select crew members, activity, BOQ item, work-front, dimensions/quantity, remarks and evidence.
6. My daybook: date-wise timeline of crews, work fronts, activity outputs, photos, drafts, submitted and returned records.
7. QS verification desk: compare engineer markup and measurements, edit accepted quantity as a decision (not overwrite), partial verify/reject with reasons.
8. Verified quantity register: filter by project/date/BOQ/activity/engineer and status.
9. Billing handoff: select eligible verified quantities, preview totals, export/send, acknowledge and reconcile.
10. Management dashboard: attendance vs deployed labour, engineer-wise deployment, activity-wise output, productivity, QS pending/verified, billing eligible/transferred.

## KPIs and definitions

- Present labour = unique workers with valid present attendance from the attendance source for the site/date.
- Allocated labour = workers with active engineer allocation for the period.
- Unallocated present labour = present workers not assigned to a crew.
- Labour deployment % = allocated worker-hours / available present worker-hours.
- Engineer daybook completion = required work/crew records submitted / expected records for the engineer/date.
- Engineer measured quantity = sum of submitted work measurements.
- QS verified quantity = sum of accepted quantities, including partial approvals and approved corrections.
- Billing eligible quantity = QS verified quantity not already transferred, grouped by BOQ/unit and billing mapping.
- Productivity = accepted activity output / worker-days contributed to that same activity/work front; compare only like units and activity types.

## Updated delivery order

1. Confirm the existing attendance source and obtain a sample daily export/API contract. Initially implement safe Excel import using worker ID mapping, preserving the source file and showing a preview/reconciliation report. Existing Regular Muster and payroll remain untouched.
2. Build labour master mapping, present pool and attendance exceptions.
3. Build engineer crew allocation with transfer/release and overlap controls.
4. Build drawing revision viewer/markup and work-front selection.
5. Build the date-wise engineer daybook and activity quantity entry.
6. Build QS full/partial verification and audit trail.
7. Build billing-eligible register and controlled Central ERP handoff.
8. Add offline PWA queue, sync conflicts, dashboards, reports and phased project activation.

## Revised acceptance tests

- A worker with no valid present attendance cannot be allocated without an authorized exception.
- A worker cannot be double-allocated to two engineers for overlapping time without an explicit split/transfer.
- A crew can be assigned to multiple work fronts and activities; each work record retains its own crew contribution.
- Engineer's drawing markup and measurement always point to the exact drawing revision.
- QS can partially verify; only accepted quantity is billing eligible.
- Reimporting the same attendance file/source batch does not duplicate attendance.
- Replaying an offline submission or billing handoff does not duplicate records.
- Billing handoff includes source daybook, measurement, drawing reference, BOQ, verified quantity and reconciliation status.
- Existing Regular Muster, payroll, Subcontractor Billing and other ERP modules remain unchanged.
