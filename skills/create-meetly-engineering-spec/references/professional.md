# Technical design reference

There is no single industry RFC format. Use the team's own convention when
available. Otherwise organize around the problem, constraints, alternatives,
recommendation, operational behavior and decisions needed to proceed. A spec
describes an agreed design; an RFC argues for a proposed one.

For reliability claims, name the guarantee and its boundary. Delivery, processing
and externally observable effects are different. Test failure windows, retries,
duplicates, concurrency, authorization and recovery where the actual design needs
them. Do not apply distributed-systems machinery to a simple local feature.

[AWS transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
illustrates how to investigate a dual-write design, not a mandatory architecture.
Consult official documentation for the technologies actually discussed. Mark
proposed SLOs and capacity assumptions; research cannot manufacture local measurements.
