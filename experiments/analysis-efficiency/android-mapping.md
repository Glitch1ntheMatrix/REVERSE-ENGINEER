# Caller-selected Android mapping investigation — 2026-10-27

## Question, revisions and oracle

Apply a caller-selected local R8 mapping while preserving observed DEX identities,
original mapping-derived names/types, overloads, uncertainty, both artifact
identities and complete source Evidence. Inspect the requested inventory and
method bodies, then export complete Evidence. APKs and native code are never
executed, installed or modified.

Both controls use main `4e67bc399951768737eeaf539f7bc9fa8373b244`:

- Before: `3a588662d916f801a8c444dd86f1c65c81c76bf9`, the integrated
  #7137 mapping implementation, without parsed-index reuse or retained symbol
  summaries. This is a feature-equivalent optimization control, not a claim
  that unmodified main already supported mappings.
- After: `6b65d3a4a1a8307417365b9a1e9060e607538aa3`, bounded/cached mapping
  and explicit retained summary delivery. Later documentation changes do not
  alter the measured implementation.
- The original #7137 author is 555aaditya; integration retains their co-author
  credit and preserves #7379's shared manifest contracts/default-package tests.

The [source fixture](fixtures/android-mapping/README.md) has four classes,
eight fields and fifteen methods, including constructors, overloads, Unicode
names, nested/default-package classes, arrays and renamed types in prototypes.
The same actual R8 invocation emits DEX and mapping. Handwritten source
expectations are checked against pre-minification `javap -s -p`; an independently
compiled dexlib2 reader inventories raw DEX identities without REA's parser,
bridge or JADX aliases. All four classes and fifteen selected bodies are checked
on each investigation. Seventeen valid method mapping records include three
line ranges for one constructor; they are not seventeen distinct DEX methods.

The public-library task transforms the shipped `classes.jar` from Conscrypt
Android 2.8.0 with actual R8. Its 949,641-byte mapping has 530 class, 1,263 field
and 10,342 method records. A separate D8 conversion of the original class files
provides the unminified descriptor oracle. Every selected `NativeCrypto` field
(28) and method (390), plus inner-class identity, is verified; bodies are selected
for `EVP_PKEY_new_RSA`, `EVP_DigestSignInit`, `SSL_new`, `SSL_free` and
`SSL_get_error`. These are static DEX-only ZIP containers, not runnable APKs.
D8 warned that a platform adapter's `com.android.org.conscrypt.OpenSSLSocketImpl`
was missing; complete dependency/runtime linkage is unverified. R8 additionally
used `-dontwarn **`, with shrinking/optimization disabled and name minification
allowed. Stable R8 did not consume an existing APK's DEX.

## Pinned artifacts

| Artifact                      | Observed SHA-256                                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| R8 8.0.40 Maven JAR           | `ab1379835c7d3e5f21f80347c3c81e2f762e0b9b02748ae5232c3afa14adf702` |
| JADX MCP 0.7.1 JAR            | `6e5eacf500b64292bfb73c49797c1958f6ee44646e43e868039ae7feb573ff75` |
| Android 36 platform JAR       | `d9eb9da824d9e247a352f570f01e1169e725b2954bca9e283a71786c59b59f9a` |
| Source fixture input JAR      | `88f3d46018ac2effb166ceed79fdd6e8b58b6bb08d2649cd0aa4f90dc260260c` |
| Source fixture DEX            | `0b4c49cf3d706f5c2c4c15a10ff27dfbabb9b07f463d508f6f348eafb3245909` |
| Source fixture static APK     | `f8c0849978ed7eceeeb293223cf2139c1749f672148dce1e16d018fa727445c9` |
| Source fixture mapping        | `5ca162587794af1bd1da00f79ee64fd4ecde6f7c91048ea5596260104df6e483` |
| Conscrypt 2.8.0 AAR           | `752044c289bc98e2dcabc00a1f88ca158b3aa3f505b38f124552bf4b2a0902b1` |
| Conscrypt shipped classes JAR | `2cd9b6bc444cfca69048e8327383b7f5a13fc7978465e6e0fd5111a2000822f6` |
| Conscrypt R8 DEX              | `cd4d7eb9b05e1a84d064f7f9e4b33d68a8f92a9f58a6a62e4041972964ef6d27` |
| Conscrypt static APK          | `9a0224400b91b030213e0f6ba63d899a4ad6333f930414c768ce88bbef423e91` |
| Conscrypt mapping             | `67cd69e706afee50a1cc4e13bd9fd26056932c569d0ea7706dfe6fe8215a2e3c` |

R8 publisher and independent official Bazel checksum pin are linked from the
fixture README. Conscrypt was downloaded from
[Maven Central](https://repo.maven.apache.org/maven2/org/conscrypt/conscrypt-android/2.8.0/conscrypt-android-2.8.0.aar)
and verified against its publisher SHA-256 sidecar. No generated binary or
mapping file is committed. JAR/ZIP timestamps can change a source rebuild's
artifact hash; the table identifies these measured bytes.

## Owning changes and safe bounds

The provider keeps one successful parsed index. Each call still performs a
stable regular-file read and SHA-256 check. Only identical digest/length with
fixed parser options reuses parsed facts; current path provenance comes from
the new read. Changed content, including same-size/same-mtime rewrites, is
reparsed; missing or cancelled input never falls back to stale facts. Idle
retirement and close release the index. During replacement, old and new parsed
indices can briefly coexist. APK/query results are not cached by this mechanism.

The domain parser scans lines without a whole-file split, accounts retained
strings/containers before admitting records, and admits parameter/metadata
expansion before split/JSON parsing. The fixed 64 MiB input, estimated 128 MiB
index and 8 MiB per-residual-class claim allowances are resource constraints,
not format claims or measured V8 heap caps. Replaced metadata, deduplicated
range splits and overwritten inline frames are not cumulatively billed.
Ambiguity scans count all alternatives but retain only eight stable candidates;
conflicting residual metadata stays ambiguous. A separate combined 8 MiB claim
budget covers actual queries including all inner classes; omitted claims become
explicit `unknown`, preserving every raw identity and source SHA. It is not a
whole-report/wire-byte cap.

Existing shared retained-Evidence projection now supports class/method summaries
through both CLI and MCP. They preserve complete normalized facts and selected
bodies, omitting duplicate raw RPC metadata from the inline response. Complete
parent Evidence remains exportable. Default/complete delivery is compatible;
summary is explicit, and CLI requires a non-overwriting portable output bundle.
Whole summary views admit 1 MiB including context: an admitted one-MiB body may
therefore require complete detail. Refusal preserves the MCP parent ID and is
nonretryable for the same selection; no facts are silently truncated.

## Completed-task measurements

Linux x86-64, Node 24.22.1/npm 11.16.0, Temurin JDK 21.0.12.1, actual JADX
0.7.1, one analysis worker, 1 GiB JVM heap and two active processors. Harness,
server and children were restricted to CPUs 0/1; Node heap was 3 GiB. Expensive
checks ran serially under an 8 GiB sampled family-RSS stop and a 4 GiB host-free
memory guard. No guard stopped a completed task and no OOM occurred.

The [public stdio MCP harness](android-mapping.mjs) uses named live tool
contracts and Ajv 2020 validation of SDK-converted advertised outputs. All
correctness comparisons, hash reads, discovery and cleanup are included in the
whole-harness cost. First-provider calls use fresh processes/JVMs; OS file caches
were warm, and the host was shared. Conscrypt order was before/after/after/before.
Each small task makes 19 inspections and one proof export; each library task
makes six inspections and one proof export. Every exported parent is checked
against the exact inline normalized facts, source parameters and APK SHA, and
must retain raw calls. The complete/summary lanes use the same requested facts,
provider, options, source bytes, discovery families (`android,session`) and proof.

Peak memory is summed process-family RSS sampled every 100 ms, including client,
server, JVM and children. Shared pages can be counted twice and short peaks can
be missed; this is not PSS, kernel peak accounting or an enforced production
heap measurement. CPU is completed-family user+system time.

| Cohort            | First task s |  Warm task s | Whole harness s |  CPU s | Peak family MiB |
| ----------------- | -----------: | -----------: | --------------: | -----: | --------------: |
| small-before      |        7.342 |        1.611 |          12.060 | 16.680 |           781.7 |
| small-after       |        7.960 |        1.842 |          12.945 | 17.413 |           791.5 |
| conscrypt-before  |        8.057 | 1.015, 0.893 |          13.264 | 17.774 |           920.0 |
| conscrypt-after   |        6.975 | 0.833, 0.817 |          11.743 | 17.242 |           855.0 |
| conscrypt-after2  |        6.987 | 0.725, 0.748 |          11.561 | 16.553 |           872.6 |
| conscrypt-before2 |        7.046 | 0.917, 0.886 |          11.855 | 17.093 |           949.7 |

Warm Conscrypt task medians were 0.905 s before and 0.783 s after (about 14%
lower across four warm samples per implementation). Cold/whole-task and memory
samples vary; no universal startup or memory improvement is established. The
small fixture pays extra summary/retention overhead: 12.060 to 12.945 seconds
for the whole harness, with CPU 16.680 to 17.413 seconds. Explicit complete
delivery remains available.

An earlier separate **cache-only** cohort used complete responses without proof
export, on the same base. Conscrypt warm six-call medians fell from about
0.981 to 0.765 s; before ranges were 0.950–0.996 s and after 0.743–0.850 s.
Whole harness samples were 12.861–13.876 to 11.641–11.647 s, CPU
16.916–18.297 to 16.454–16.893 s, and peak family 910.1–938.1 to
853.1–876.8 MiB. Small before/after whole costs were 18.493/16.110 s,
17.495/16.589 CPU s and 763.4/776.3 MiB. These samples motivated reuse but
are not substituted for the completed proof-export task above.

## Whole-task token estimates

[android-mapping-costs.py](android-mapping-costs.py) executed with tiktoken
0.14.0/o200k_base. Text projection counts a fixed task question, all discovered
name/description/input schemas once per investigation, every RPC argument and
all text replies, including proof export. SDK transport additionally counts
output schemas and structured-content duplicates. Exported file contents are
checked offline rather than injected into model context; export IO/CPU/memory
is included above. Prompt replay, host pruning/rendering, hidden prompts,
protocol handshake/framing and actual model billing are unmeasured. Estimates
are not billed usage. Each table row is one warm completed investigation.

| Cohort            | Estimated text tokens | Estimated SDK transport tokens |
| ----------------- | --------------------: | -----------------------------: |
| small-before      |                43,526 |                        167,094 |
| small-after       |                41,755 |                        159,507 |
| conscrypt-before  |               180,213 |                        510,351 |
| conscrypt-after   |                69,836 |                        217,646 |
| conscrypt-after2  |                69,908 |                        217,789 |
| conscrypt-before2 |               177,902 |                        505,723 |

Conscrypt text estimates fall about 61%, from approximately 178–180k to 70k,
while preserving all requested facts and complete proof. Small tasks improve
only about 4%; summary context has its own cost. The cache-only cohort kept
similar token counts (~172–174k library text tokens without proof export),
revealing that parse caching alone did not address repeated raw class metadata.
Full inventories still cost more context than a direct known-method summary.

Normalized investigation digests match exactly across all before/after lanes:

- Source fixture: `ec76d1e086c8561370fc1ed5dfef67bb88b185e8fb57c7e30afe9f1f153634eb`.
- Conscrypt: `7ebf70795dfc23bf2b0d0e813837325fa221f15560ca2384fdb06f26d69d78a5`.

## Executed verification and limits

- Parser/reader/protocol/provider mapping regressions cover raw names, exact
  descriptors/types, overloads, inline outermost frames, malformed/partial
  records, stable candidate samples, preallocation refusal, repeated metadata,
  cache freshness/path aliases/deletion, cancellation and descriptor ownership.
- Real R8 source and public-library stdio MCP tasks verify all selected symbols
  and advertised schemas. Actual CLI complete and summary inspections verify
  raw/mapped identity, exact normalized parity and complete portable parents.
- Actual Java metadata regression and downstream CLI/MCP body/direct-invoke
  parity pass, including reserved raw names, frozen aliases, default packages,
  encoded constants, native absence and classes.dex/classes2.dex identity.
- Summary regressions preserve partial/unknown facts and optional historical
  omissions, validate SDK output contracts, read retained data after APK/mapping
  deletion, reject missing portable CLI output and exercise the one-MiB boundary.
- Type/lint/build, named schema/profile checks and relevant source/boundary checks
  are executed separately. Final PR validation records the current command set.

The final combined 12-file Android run passed 219 of 220 cases, including all
52 session/idle/cleanup integration cases. One existing package-summary SDK
case hit its 30-second limit under combined load. The unchanged four-case file
then passed with one worker: its SDK case took 11.479 seconds; whole isolated
harness 31.867 seconds, CPU 35.064 seconds and peak family 1,551,081,472 bytes.
No assertion or timeout was relaxed. The combined timeout remains a recorded
resource/concurrency limitation rather than being reported as an all-green run.

Earlier failed attempts are retained rather than counted as passes: a resolver
refactor used `only.mapped` after `only` already held the mapped fact; its
regressions failed and were fixed. Tagged-error migration exposed one stale
string-only test. New SDK schema test typing and a redundant JSON preadmission
were corrected at their owning boundaries. A first summary MCP case timed out
while enumerating unrelated full catalog contracts; selecting the actual
Android/application/session families preserves every assertion and passes
without raising timeouts. An initial library harness requested absent
`SSL_shutdown` and skipped it; the harness now rejects absent requests, and
reported final cohorts explicitly verify all five requested methods.

The mapping cancellation regression distinguishes caller-first from deadline-
first finalization; the original implementation relabelled caller cancellation
as timeout (one failing caller-first case and one passing deadline-first case
on the unchanged optimization control). An initial test's public deadline code was corrected to the actual
`provider_timeout` contract. Fixed code preserves the first cause and cleanup.

Only Linux x86-64/JDK21/JADX0.7.1 and R8 8.0.40 mapping-format 2.1 were qualified.
Residual-signature conflicts use derived negative mappings, not a real mapping-
format 2.2 producer. No Windows/macOS, emulator/device, app execution, full APK
rebuild/linkage, source/line recovery, APK signature verification or model-usage
trial is claimed. Mapping/build association remains explicitly caller-selected.

## Reproduction

Generate source/DEX/oracle using the fixture README with selected existing tools.
Keep separate before/after worktrees, pin their revisions above, build both and
use identical target/mapping/oracle bytes. Then run the same harness for each:

```sh
node experiments/analysis-efficiency/android-mapping.mjs \
  --repository "$SELECTED_REPOSITORY" --target "$STATIC_APK" \
  --mapping "$MAPPING_FILE" --output "$FRESH_RESULTS" \
  --java-home "$SELECTED_JDK" --jar "$JADX_MCP_JAR" \
  --oracle "$RAW_DEX_ORACLE" --expectations "$ORIGINAL_EXPECTATIONS" \
  --proof
```

Add `--detail summary` only on the after implementation. The small fixture
selects all classes/bodies. For Conscrypt add `--class-name U0 --repeats 3` and
`--methods EVP_PKEY_new_RSA,EVP_DigestSignInit,SSL_new,SSL_free,SSL_get_error`;
`U0` is the measured artifact's raw class identity, not a universal residual name.
Use the original NativeCrypto D8 descriptor inventory for that expectation file.
Run `--variants` separately on the source fixture to exercise derived malformed,
partial, duplicate and conflicting mappings; those extra qualification calls
are not part of the timing/token table's repeated task.

```sh
python experiments/analysis-efficiency/android-mapping-costs.py \
  --output "$TOKEN_RESULTS" "$BEFORE_RESULTS" "$AFTER_RESULTS"
```

Capture elapsed/CPU/family RSS with the bounded host runner or an equivalent
process-family sampler; alternate trials and keep each label's raw receipts and
failed attempts. Complete Evidence stays in the exported per-pass bundles.
