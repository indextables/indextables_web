---
slug: data-layer-problem
title: "The Data Layer Problem No One Is Talking About"
authors: [scott]
tags: [security, architecture, data-infrastructure, ai]
date: 2026-04-04
---

If you've spent any time in security leadership lately, you've probably heard some version of the same warning: AI-driven attacks are coming, and they'll move faster than humans can respond.

Anthropic has been saying it. Others are echoing it. And in most rooms, people nod, then go back to their roadmap.

That reaction isn't cynicism—it's rational. The threat still feels a bit abstract.

But there's a more immediate, concrete problem hiding underneath the AI hype, and it will hit you long before fully autonomous attackers do:

**Your data layer isn't built for what you're about to ask of it.**

<!-- truncate -->

## The workflow problem

Security operations today run on a familiar loop:

**detect → investigate → filter → act**

That loop isn't going away. Even as AI agents take over more of the heavy lifting—triage, log correlation, threat scoring—humans will stay in the decision loop for the foreseeable future. The risk of an automated action taking down production is still too high.

So the workflow survives.

What changes is the speed of each step, and who is doing the work.

Agentic systems will increasingly handle investigation and filtering. They'll query logs, correlate events, and surface decisions. That's real progress.

But they inherit the same dependency human analysts have always had: they need data, and they need it fast.

And that's where the problem becomes concrete.

## The cost / speed wall

Modern security stacks tend to sit on one of two foundations—and both are mismatched for agentic workloads.

Search platforms like Splunk or Elasticsearch give you speed: sub-second queries, high concurrency, real-time investigation. But the cost scales brutally with data volume. Once AI agents start running hundreds or thousands of queries per incident, the economics break quickly.

Data lake systems built on Apache Iceberg or Delta Lake (queried via Spark or Snowflake) flip the equation. Storage is cheap, and scale is elegant. But latency isn't. These systems were never designed for high-concurrency, low-latency query patterns.

So you end up with a familiar tradeoff:

- Fast is too expensive.
- Cheap is too slow.

In practice, teams bridge the gap with throttling, sampling, and routing "important" queries to expensive systems while others wait.

That works in human-speed workflows.

In machine-speed attacks, those delays aren't just inefficiencies—they're misses.

## Why this matters now

The threat environment isn't waiting for the infrastructure to catch up.

Attackers using agentic AI will probe, pivot, and adapt at speeds that make today's "detect and investigate" cycle look slow by default.

Defenders will respond with their own agents—and immediately hit the same wall.

Not because the detection logic is wrong. Not because the agents aren't capable.

But because the data layer can't keep up.

Fast enough to matter is too expensive to sustain.
Cheap enough to sustain is too slow to matter.

That's the bottleneck. And it's still under-discussed in most security architecture conversations.

## A different approach

This is the problem IndexTables was built to address.

The core idea is simple: bring search-engine performance to data lake scale—without inheriting the cost curve that makes traditional search platforms economically fragile at volume.

High-concurrency, low-latency reads over large datasets, at lake-level economics for both storage and compute.

For security workflows, that changes the constraint space. Agentic systems can actually query what they need, when they need it, without forcing teams to choose between coverage and cost.

It also fits naturally into modern architectures. Paired with systems like Spark Connect, IndexTables becomes a backend layer that MCP services, APIs, and internal tooling can sit on—supporting the next generation of agentic defense systems.

## The honest version

We're still early. The vision of AI-vs-AI security operations—autonomous agents defending in real time against adaptive, machine-speed attackers—isn't here yet.

But the infrastructure decisions made in the next 12–18 months will determine who can operate at that speed when it arrives.

Some teams will invest in scalable, high-performance data access and be ready.

Others will discover their AI investments quietly run into an infrastructure ceiling.

The bottleneck isn't detection.

It's data.

And unlike many security problems, this one is actually solvable—if you start before the pressure fully arrives.
