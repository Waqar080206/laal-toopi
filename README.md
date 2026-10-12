# Sakshi: Stop the Deepfake Before the Money Moves

*RAKSHAM Round 1 · Track 03: Deepfake Detection for Financial Communications · Team RED HAT (Waqar Akhtar, Ojus Mathur, Ujjwal Sharma) · Product working title: Sakshi (“the witness”)*

**How to use this document.** It holds everything a reader needs to understand the project and everything the Round 1 brief demands, in the order a reviewer will ask for it. It opens with the pitch, then covers the problem, the product, the proof, the safeguards and the build plan, and ends with a map from every rubric criterion to a slide. Bracketed items \[like this\] are facts the team must supply. We never invent statistics.

## The Pitch in 30 Seconds

Every day, people at Indian banks, lenders and companies release money because a voice note or video looked and sounded real. AI can now fake both. Detection tools exist, but the ones we reviewed stop at a score, and research shows detectors lose accuracy on Indian languages.

Sakshi is the missing piece: a gate in front of payment release. It combines the audio check with language, pressure cues and payment context, and it forces a callback through a trusted channel whenever the risk is real. It helps when the detector is right, and it still protects the institution when the detector is wrong.

Our finale demo shows it end to end: a suspicious voice note and video, a held payment, a callback, and a report pack for the fraud team.

## The One-Sentence Solution

Sakshi is a verification gate in front of payment release: it weighs audio and video forensic, provenance, language, pressure-language and payment-context signals, never acts on one weak signal, and routes every doubtful instruction through an out-of-band callback and a human reviewer, leaving an evidence record for the fraud team.

## Who Is Involved

| Role | Who they are | What they need |
| --- | --- | --- |
| The Approver | Payments or treasury officer at a bank, NBFC or company. The primary user | A fast, explainable answer and a safe next step |
| The Impostor | A fraudster using a cloned executive voice or deepfaked video | Urgency, and a skipped callback |
| The Executive | The real person being impersonated | To be reachable by callback and never made the face of a fraud |
| The Reviewer | Fraud or risk analyst | A case file with reasons, not a bare score |
| The Gate | Our system | To be useful when right and harmless when wrong |

## 1. The Problem

**The scene (illustrative, not a real case).** It is 6:42 pm on a Friday. Meera, a payments approver at a mid-sized lender in Delhi, receives a voice note on WhatsApp. It is the managing director, in the familiar Hindi-English cadence, asking her to release a transfer of ₹\[amount\] to a vendor’s new account before the bank’s cut-off. He adds that he is about to board a flight and cannot take a call. The voice was cloned from public interview clips, and a short deepfake video of him nodding approval follows to seal the request. Meera’s institution has maker-checker controls, but the pressure is social, not technical, and the person being pressured is the one holding the key. If she pays, the money moves on fast rails and recovery is uncertain.

**Primary user:** the payments or treasury approver. **Harmful moment:** the minute between hearing a trusted voice and releasing funds. **Exact threat pattern:** a cloned executive voice or deepfaked video asking for an urgent transfer or a beneficiary change while discouraging verification.

**Why India.** The brief states it plainly: India runs on UPI, digital banking and wallets, and fraudsters now run on AI, with cloned voices of bank officials and deepfaked executives approving transfers. Indian speech adds a second difficulty: many languages, heavy code-switching, and accents that detectors trained mostly on English handle poorly (see Section 4).

**The bounded problem.** In scope: voice notes and video clips that instruct or approve a payment or a beneficiary change, handled by an institution’s approvers. Out of scope for Round 1: forged documents and screenshots, consumer-facing apps, live call interception, and automatic blocking. Each is a named extension, and the architecture leaves a slot for it.

## 2. Before and After

| Step | Today | With Sakshi |
| --- | --- | --- |
| 1 | Approver hears a familiar voice | Approver flags the instruction in Sakshi, or the approval workflow sends it automatically |
| 2 | Voice feels genuine, so trust is assumed | Sakshi returns a verdict with reasons in seconds \[to be measured\] |
| 3 | Urgency discourages a callback | Elevated risk requires a callback to the number in the institution’s own directory |
| 4 | Funds are released | High risk is held and routed to a human reviewer |
| 5 | Fraud found later, if at all | Every case leaves an evidence record and a one-click report pack |

**Differentiation, in four points.**

1. **Decision, not detection.** The detector is one signal among several. The product is the decision and the verification path.
2. **Honest about language.** For languages where detectors are known to be weaker, Sakshi says so and never issues a “verified real” label.
3. **Verification that does not depend on the detector.** An out-of-band callback works even when the detector is wrong, which covers cases pure detection cannot, such as a live human social engineer. Industry write-ups on contact-centre deepfake defence describe risk-based routing and admit this same limit of detection.
4. **A response path.** The material we reviewed from detection vendors centres on scoring. Review, escalation and reporting are where this project adds value.

## 3. The Product and How It Decides

**Signals**

| Signal | What it tells us | Weight rule |
| --- | --- | --- |
| Audio and video forensic scores | Signs of synthetic speech or manipulated video | Audio score is down-weighted when the detected language is one the detector handles poorly; video is reported with its own stated limits |
| Language identification | Which language and accent profile | Sets the detector’s confidence ceiling |
| Provenance (C2PA content credentials, where present) | Whether the media carries a verifiable origin | Presence helps; **absence is neutral**, since most forwarded media has none |
| Pressure cues in the transcript | Urgency, secrecy, “do not call back”, authority claims | Extracted as structured flags only |
| Payment context | Amount versus history, new or changed beneficiary, off-hours, unusual channel | Strongest signal, independent of audio quality |

**Risk bands and actions**

| Band | Meaning | Action |
| --- | --- | --- |
| Low | Routine request, context normal | Proceed through the usual maker-checker, log the case |
| Elevated | Context or pressure flags, or an inconclusive detector | Mandatory out-of-band callback before release |
| High | Multiple independent signals agree | Hold, route to a human reviewer, require dual approval |

**Rules the Gate obeys**

1. Never act on a single weak signal.
2. A new or changed beneficiary above a set amount, combined with any pressure cue, triggers a callback **regardless of the audio score**.
3. Verdict labels are “Consistent with genuine media”, “Inconclusive” or “Signs of synthesis”. In low-confidence languages the first label is not available.
4. Missing provenance is neutral, never incriminating.
5. Payments are held, never auto-rejected.
6. A reviewer may override with a written reason, and the override is logged.
7. Callback numbers come only from the institution’s directory, never from the message itself.

**What the approver sees (example).** “Hold recommended. This request asks for an urgent payment to a new beneficiary outside business hours, and the audio shows signs of synthetic speech. Detector confidence is reduced because the clip is in Hindi. Next step: call the managing director on the number in the company directory, not the one in the message.”

**When the Gate is wrong**

- **False positive** (a genuine executive is flagged): the cost is a short callback delay. Reviewer outcomes feed threshold tuning, and shadow-mode rollout measures this before any friction is imposed.
- **False negative** (a clone fools the detector): rule 2 still fires on payment context, so a high-risk request meets the callback gate anyway. Defence in depth is the point.

## 4. Evidence and Validation

**What the literature says**

| Source | Relevance to us |
| --- | --- |
| SEA-Spoof (arXiv 2509.19865) | Reports severe cross-lingual degradation for detectors trained on high-resource languages, largely restored by fine-tuning on regional data. Covers 300+ hours including Hindi and Tamil |
| HAV-DF (arXiv 2411.15457) | A Hindi audio-video deepfake dataset on which existing detection methods score lower than on English benchmarks |
| IndieFake (arXiv 2506.19014) | A benchmark of bonafide and deepfake audio from 50 Indian English speakers, built because existing sets lack accent diversity |
| Indic-CodecFake and SATYAM (arXiv 2604.19949) | Work on neural-codec speech deepfakes in Indic languages |
| SafeEar (open source, CCS 2024) | Detects deepfake audio without access to speech content, using acoustic cues such as prosody and timbre. The authors report an EER as low as 2.02%. Our privacy-preserving reference |
| IndicSynth (AIKosh) | Over 4,000 hours of synthetic speech across 12 Indian languages, usable as a data source |

**Our own measurement.** Before submission we run the untouched pretrained detector on a small Hindi, Tamil and English slice: EER English \[**\], Hindi \[**\], Tamil \[\_\_\]. This turns the literature’s claim into our evidence and justifies the language-aware design. If the gap is absent, we say so and rely on the context and callback layers. For video, we start from an open-source multi-modal detector and report its limits the same way.

**What we will measure at the finale**

- Per-language EER on a held-out set, and false-positive rate on genuine speech recorded on laptop microphones.
- Clean audio versus phone-compressed audio (a degradation test we plan to add).
- Decision-level results on staged scenarios: fraud cases held, legitimate cases passed with no extra friction, and time to resolution.

**Key assumptions and how each is tested**

| Assumption | Test |
| --- | --- |
| Detectors degrade on Hindi and Tamil | Baseline run above |
| Approvers accept one callback for Elevated cases | Shadow-mode pilot after the hackathon; modelled in the demo |
| Institutions can supply directory numbers | Integration assumption, stated openly |
| Public data is enough to calibrate thresholds | A limitation we report; real-world calibration needs institution data |
| WhatsApp-style compression lowers accuracy | Codec augmentation test |

## 5. Safety, Privacy and Responsible AI

| The brief asks | Our answer |
| --- | --- |
| What data do you need? | The voice note or video instruction, its metadata, and payment context. We do **not** collect customer personal data, account credentials, or voiceprints, and we build no biometric database. The prototype uses only synthetic, public or consented data |
| What happens when the system is wrong? | Outcomes above: no automatic blocking, no accusation from one weak signal, reviewer override, tuning from outcomes |
| Who can act on the result? | The approver can request a callback or hold. Only a human reviewer can clear a High-band hold, with dual approval |
| How will users understand it? | Plain-language reasons and a named next step. A score alone is never the explanation |
| How does it resist misuse? | The requester never sees the score, so they cannot tune an attack against it. Submissions are rate-limited. Evidence access is role-based and logged. Any language-model step handles transcripts as untrusted text and may only emit structured cue flags, never a decision |

**Further safeguards.** Raw audio and video are processed ephemerally and deleted after scoring unless a case is escalated, in which case it is retained encrypted, with limited access and a fixed retention period. Stored records hold hashes, scores, reasons and timestamps, in a tamper-evident log. Bias is named openly: detector accuracy varies by language and accent, so the language-aware ceiling and reviewer escalation are the mitigation.

## 6. The Architecture

**One diagram, four layers.**

1. **Input boundary:** intake from the approver’s web app or a workflow webhook; consent and authorisation are the institution’s own staff acting under institutional policy.
2. **Analysis:** audio pre-processing and chunking, language identification, the audio detector, a video detector on sampled frames, a provenance check, speech-to-text, and a cue extractor that emits structured flags.
3. **Decision:** a context engine that reads the (synthetic) payment queue and history, and a decision engine that combines signals under the seven rules into a band, followed by an explanation generator built from templates and the actual reasons.
4. **Action and evidence:** a callback task generator using the institution’s directory, a reviewer queue and case management, an evidence store (hashes, scores, reasons, log), and a report-pack generator for the fraud team and the relevant cybercrime reporting channel.

**Data flow.** Instruction arrives, then analysis produces signals, then the decision engine assigns a band, then the approver sees reasons and a next step, then a callback or reviewer step is taken, then the evidence record is written and a report pack can be produced.

**Security.** Deployment inside the institution’s own network boundary so audio never leaves it. Encryption in transit and at rest, role-based access, a tamper-evident audit log, and rate limiting. Adversarial adaptation is handled by keeping the decision partly independent of the detector.

**Performance assumptions.** Scoring is chunked and expected to be seconds-scale \[to be measured on finale hardware\]. We make no latency claim until measured. Friction target: zero extra steps for Low, one callback for Elevated.

## 7. Adoption and Scale

- **Integration point:** a pre-release gate in the existing approval workflow, between maker and checker.
- **Operating owner:** fraud and risk operations, with payments operations as the daily users.
- **Rollout:** Stage 1, shadow mode (observe, no friction, measure false positives and negatives). Stage 2, advisory (approvers see verdicts). Stage 3, required hold for the High band with reviewer sign-off.
- **Scale:** stateless scoring workers behind a queue. New languages arrive by fine-tuning or swapping the detector. New modalities (video, documents) arrive as adapters feeding the same decision engine.

## 8. The 48-Hour Plan

The finale is on 24 and 25 October 2026 at IIT Delhi. We confirm compute, internet and rules on pretrained weights with the organisers before submitting.

| Hours | Goal | Proof at the checkpoint |
| --- | --- | --- |
| 0–6 | Environment, data slices, detector scoring a clip end to end | A clip in, a score out |
| 6–16 | Pipeline skeleton, language ID, speech-to-text, cue flags, video frame scoring | Signals for a staged call |
| 16–28 | Context engine on synthetic payments, decision engine, explanations | Bands and reasons on three scenarios |
| 28–38 | Evaluation tables, language-aware calibration | Per-language results |
| 38–45 | Reviewer queue, callback task, report pack, demo flow | The full flow, start to finish |
| 45–48 | Fallbacks, limitations slide, rehearsal | A clean run-through |

**Demo script.** (1) A genuine executive’s routine request passes with no friction. (2) A cloned-voice note and a deepfaked CEO video approving an urgent transfer to a new beneficiary are held, a callback is generated, and a report pack is produced. (3) A Hindi or Tamil clip is marked low confidence, and a callback is required even if the detector says “real”. Each live step has a pre-recorded fallback.

**Fallback.** If the detector underperforms, we ship the context and callback layers, present the detector as advisory, and report the measured language gap as a finding.

**Dependencies.** GPU or compute access, dataset licences, venue internet, rules on pretrained weights and pre-written code, and the choice of open-source speech-to-text and language-ID models.

## 9. The Rubric, Answered

| Criterion (points) | Where it is answered | Slides |
| --- | --- | --- |
| Problem fit and user understanding (20) | Sections 1 and 2, who is involved, bounded scope | 2, 3 |
| Technical architecture and detection logic (20) | Sections 3, 4 and 6 | 4, 5, A1, A2 |
| Solution value and differentiation (15) | Section 2 differentiation, before and after | 3, 10 |
| Feasibility and finale plan (15) | Section 8, assumptions table | 9 |
| Safety, privacy, responsible AI (15) | Section 5 and architecture page 3 | 7, A3 |
| Adoption, integration, scale (10) | Section 7 | 8 |
| Communication quality (5) | One narrative, labelled diagram | All |

**Slide blueprint.** 1 Team, track, one-sentence solution. 2 The problem (Section 1). 3 Before and after (Section 2). 4 Product flow (Sections 2 and 3). 5 Decision logic (Section 3). 6 Evidence and validation (Section 4). 7 Safeguards (Section 5). 8 Deployment (Section 7). 9 The 48-hour plan (Section 8). 10 Impact, why Sakshi wins, and extensions. Architecture 1: the system diagram. Architecture 2: data flow, decision logic, escalation. Architecture 3: security, privacy, adversarial risk, performance. Appendix: disclosures and references.

## 10. Tough Questions, Straight Answers

**Your detector is weak on Indian languages. Why trust it?** We do not. It is one signal, its confidence is capped by language, and the callback gate works independently of it.

**Isn’t this a wrapper around someone else’s model?** The detector is swappable by design. The product is the decision logic, the verification path and the evidence trail.

**What about false positives hurting business?** Shadow-mode rollout measures them first. There is no automatic blocking, and an Elevated case costs one callback.

**How will fraudsters adapt?** Context rules and out-of-band verification do not rely on audio quality, and the requester never sees the score.

**Why voice and video, but not forged documents?** The rubric rewards a sharply bounded problem. Voice and video are the two threats the brief names, and provenance and callback verification are modality-independent, so forged documents can plug in later.

**What can you really build in 48 hours?** The three-scenario demo above, with checkpoints at hours 6, 16, 28, 38 and 45, and a stated fallback.

**Is this safe for privacy?** Ephemeral audio, no voiceprints, no customer data, hashes and scores only, role-based access.

## Why Sakshi Wins

Four reasons to back this team:

1. **It still works when the detector fails.** Payment context and a callback do not depend on audio quality.
2. **It is honest about Indian languages.** It shows low confidence instead of false certainty, and we test the language gap ourselves rather than assuming it.
3. **It ends in action.** Every verdict leads to a callback, a review or a report pack, never just a score.
4. **It is buildable.** Narrow scope, a three-scenario demo, hourly checkpoints and a fallback if anything breaks.

## Appendix A: Disclosures

- **Datasets (public):** SEA-Spoof, IndicSynth, HAV-DF, IndieFake \[licence checks pending\]. Synthetic payment scenarios created by the team.
- **Models:** a pretrained audio deepfake detector and a video deepfake detector \[names and versions to be confirmed\], a language-identification model \[to be confirmed\], an open-source speech-to-text model \[to be confirmed\].
- **Libraries and assets:** C2PA tooling such as Google’s Credentio, and defakepy scaffolding, if used \[confirm\].
- **AI-generated content:** this document and the deck text were drafted with AI assistance (Claude, by Anthropic) and edited by the team. Diagrams \[state if AI-generated\].

## Appendix B: References

1. SEA-Spoof: Bridging the Gap in Multilingual Audio Deepfake Detection for South-East Asian Languages, arXiv 2509.19865.
2. HAV-DF: Hindi Audio-Video Deepfake Dataset, arXiv 2411.15457.
3. IndieFake Dataset: A Benchmark Dataset for Audio Deepfake Detection, arXiv 2506.19014.
4. Indic-CodecFake meets SATYAM, arXiv 2604.19949.
5. SafeEar, github.com/LetterLiGo/SafeEar.
6. IndicSynth, AIKosh (aikosh.indiaai.gov.in).
7. Credentio, open-source C2PA library, Google Developers Blog.
8. RAKSHAM Round 1 Participant Brief (Amazon AI Cyber Security Hackathon, IIT Delhi).
9. Industry write-ups on contact-centre deepfake defence and verification through established channels (vendor and trade sources, used for context only).

## Appendix C: Facts to Fill In

Member affiliations. Our measured baseline EER (English, Hindi, Tamil). The ₹ amount and threshold values in the scenario and Rule 2. Confirmed model names and licences. Organiser answers on compute and rules. Anything else we cannot source: leave it blank, never invent it.
