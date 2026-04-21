# Appendix E: 버전 변화 기록 (Version Evolution Log)

이 책의 핵심 분석은 Claude Code v2.1.88(전체 source map 포함, 4,756개 소스 파일 복원 가능)을 기반으로 한다. 이 부록은 이후 버전의 주요 변경 사항과 각 Chapter에 미치는 영향을 기록한다.

> **Navigation tip**: 각 변경 사항은 해당 Chapter의 version evolution 섹션으로 연결된다. Chapter 번호를 클릭하면 해당 위치로 이동한다.

> Anthropic이 v2.1.89부터 source map 배포를 중단했으므로, 이하 분석은 bundle 문자열 신호 비교 + v2.1.88 소스 코드 보조 추론에 기반하며, 분석 깊이에 한계가 있다.

## v2.1.88 -> v2.1.91

**개요**: cli.js +115KB | Tengu events +39/-6 | Environment variables +8/-3 | Source Map 제거

### 고영향 변경 사항 (High-Impact Changes)

| 변경 사항 | 영향받는 Chapter | 세부 내용 |
|--------|-------------------|---------|
| Tree-sitter WASM 제거 | [ch16 Permission System](../part5/ch16.md#version-evolutionv2191-changes) | Bash 보안이 AST 분석에서 regex/shell-quote로 회귀; CC-643 성능 문제로 인한 변경 |
| `"auto"` permission mode 공식화 | [ch16](../part5/ch16.md#version-evolutionv2191-changes)-[ch17](../part5/ch17.md#version-evolutionv2191-changes) Permissions/YOLO | SDK 공개 API에 auto mode 추가 |
| Cold compaction + dialog + quick backfill circuit breaker | [ch11 Micro-compaction](../part3/ch11.md#version-evolutionv2191-changes) | 지연 compaction 전략 및 사용자 확인 UI 추가 |

### 중영향 변경 사항 (Medium-Impact Changes)

| 변경 사항 | 영향받는 Chapter | 세부 내용 |
|--------|-------------------|---------|
| `staleReadFileStateHint` | [ch09](../part3/ch09.md#version-evolutionv2191-changes)-[ch10](../part3/ch10.md#version-evolutionv2191-changes) Context Management | Tool 실행 중 파일 mtime 변경 감지 |
| Ultraplan remote multi-agent planning | [ch20 Agent Clusters](../part6/ch20.md) | CCR remote session + Opus 4.6 + 30분 timeout |
| Sub-agent 강화 | [ch20](../part6/ch20.md)-[ch21](../part6/ch21.md#version-evolutionv2191-changes) Multi-agent/Effort | Turn 제한, lean schema, cost steering |

### 저영향 변경 사항 (Low-Impact Changes)

| 변경 사항 | 영향받는 Chapter |
|--------|-------------------|
| `hook_output_persisted` + `pre_tool_hook_deferred` | ch19 Hooks |
| `memory_toggled` + `extract_memories_skipped_no_prose` | ch12 Token Budget |
| `rate_limit_lever_hint` | ch06 Prompt Behavior Steering |
| `bridge_client_presence_enabled` | ch22 Skills System |
| +8/-3 environment variables | Appendix B |

### v2.1.91 신규 기능 상세 (v2.1.91 New Features in Detail)

다음 세 가지 기능은 v2.1.88 소스 코드에 **전혀 존재하지 않았으며** v2.1.91에서 새로 추가되었다. 분석은 v2.1.91 bundle 리버스 엔지니어링에 기반한다.

#### 1. Powerup Lessons — 인터랙티브 기능 튜토리얼 시스템 (Interactive Feature Tutorial System)

**Events**: `tengu_powerup_lesson_opened`, `tengu_powerup_lesson_completed`

**v2.1.88 상태**: 존재하지 않았다. `restored-src/src/`에 powerup 또는 lesson 관련 코드가 없었다.

**v2.1.91 리버스 엔지니어링 결과**:

Powerup Lessons는 사용자에게 Claude Code의 핵심 기능 사용법을 가르치는 10개 과정 모듈을 포함한 내장 인터랙티브 튜토리얼 시스템이다. bundle에서 추출한 전체 과정 레지스트리:

| Course ID | 제목 | 관련 기능 |
|-----------|-------|-----------------|
| `at-mentions` | Talk to your codebase | @ file references, line number references |
| `modes` | Steer with modes | Shift+Tab mode 전환, plan, auto |
| `undo` | Undo anything | `/rewind`, Esc-Esc |
| `background` | Run in the background | Background tasks, `/tasks` |
| `memory` | Teach Claude your rules | CLAUDE.md, `/memory`, `/init` |
| `mcp` | Extend with tools | MCP servers, `/mcp` |
| `automate` | Automate your workflow | Skills, Hooks, `/hooks` |
| `subagents` | Multiply yourself | Sub-agents, `/agents`, `--worktree` |
| `cross-device` | Code from anywhere | `/remote-control`, `/teleport` |
| `model-dial` | Dial the model | `/model`, `/effort`, `/fast` |

**기술 구현** (bundle 리버스 엔지니어링):

```javascript
// Course opened event
logEvent("tengu_powerup_lesson_opened", {
  lesson_id: lesson.id,           // Course ID
  was_already_unlocked: unlocked.has(lesson.id),  // Already unlocked?
  unlocked_count: unlocked.size   // Total unlocked count
})

// Course completed event
logEvent("tengu_powerup_lesson_completed", {
  lesson_id: id,
  unlocked_count: newUnlocked.size,
  all_unlocked: newUnlocked.size === lessons.length  // All completed?
})
```

잠금 해제 상태는 `powerupsUnlocked`를 통해 사용자 설정에 영구 저장된다. 각 과정은 제목, tagline, 리치 텍스트 콘텐츠(터미널 애니메이션 데모 포함)를 포함하며, UI는 완료 상태를 check/circle 마커로 표시하고, 모든 과정을 완료하면 "easter egg" 애니메이션을 트리거한다.

**이 책과의 관련성**: Powerup Lessons의 10개 과정 모듈은 이 책의 Part 2부터 Part 6까지의 거의 모든 핵심 주제를 다룬다 — permission mode(ch16-17)에서 sub-agent(ch20), MCP(ch22)까지. 이는 Anthropic이 공식적으로 "사용자가 어떤 기능을 숙달해야 하는지"의 우선순위를 보여주며, 이 책의 "What You Can Do" 섹션의 참고 자료로 활용할 수 있다.

---

#### 2. Write Append Mode — 파일 추가 쓰기 (File Append Writing)

**Event**: `tengu_write_append_used`

**v2.1.88 상태**: 존재하지 않았다. v2.1.88의 Write tool은 overwrite(전체 교체) mode만 지원했다.

**v2.1.91 리버스 엔지니어링 결과**:

Write tool의 inputSchema에 새로운 `mode` parameter가 추가되었다:

```typescript
// v2.1.91 bundle reverse engineering
inputSchema: {
  file_path: string,
  content: string,
  mode: "overwrite" | "append"  // New in v2.1.91
}
```

`mode` parameter 설명 (bundle에서 추출):

> Write mode. 'overwrite' (default) replaces the file. Use 'append' to add content to the end of an existing file instead of rewriting the full content — e.g. for logs, accumulating output, or adding entries to a list.

**Feature Gate**: Append mode는 GrowthBook flag `tengu_maple_forge_w8k`로 제어된다. flag가 꺼져 있으면 `mode` 필드가 schema에서 `.omit()`되어 모델에게 보이지 않는다.

```javascript
// v2.1.91 bundle reverse engineering
function getWriteSchema() {
  return getFeatureValue("tengu_maple_forge_w8k", false)
    ? fullSchema()           // Includes mode parameter
    : fullSchema().omit({ mode: true })  // Hides mode parameter
}
```

**이 책과의 관련성**: ch02(tool 시스템 개요)와 ch08(tool prompt)에 영향을 미친다. v2.1.88에서 Write tool의 prompt는 명시적으로 "This tool will overwrite the existing file"이라고 기술했으나 — v2.1.91의 append mode가 이 제약을 변경하여, 모델이 이제 overwrite 대신 append를 선택할 수 있게 되었다.

---

#### 3. Message Rating — 메시지 평가 피드백 (Message Rating Feedback)

**Event**: `tengu_message_rated`

**v2.1.88 상태**: 존재하지 않았다. v2.1.88에는 `tengu_feedback_survey_*` 시리즈 event(세션 수준 피드백)가 있었으나 메시지 수준 평가는 없었다.

**v2.1.91 리버스 엔지니어링 결과**:

Message Rating은 사용자가 개별 Claude 응답을 평가할 수 있는 메시지 수준 피드백 메커니즘이다. bundle 리버스 엔지니어링에서 추출한 구현:

```javascript
// v2.1.91 bundle reverse engineering
function rateMessage(messageUuid, sentiment) {
  const wasAlreadyRated = ratings.get(messageUuid) === sentiment
  // Clicking the same rating again → clear (toggle behavior)
  if (wasAlreadyRated) {
    ratings.delete(messageUuid)
  } else {
    ratings.set(messageUuid, sentiment)
  }

  logEvent("tengu_message_rated", {
    message_uuid: messageUuid,  // Message unique ID
    sentiment: sentiment,       // Rating direction (e.g., thumbs_up/thumbs_down)
    cleared: wasAlreadyRated    // Was the rating cleared?
  })

  // Show thank-you notification after rating
  if (!wasAlreadyRated) {
    addNotification({
      key: "message-rated",
      text: "thanks for improving claude!",
      color: "success",
      priority: "immediate"
    })
  }
}
```

**UI 동작 방식**:
- 평가 기능은 React Context(`MessageRatingProvider`)를 통해 메시지 목록에 주입된다
- 평가 상태는 메모리에 `Map<messageUuid, sentiment>`로 저장된다
- toggle 지원 — 동일한 평가를 다시 클릭하면 해제된다
- 평가 후 녹색 알림 "thanks for improving claude!"가 표시된다

**이 책과의 관련성**: ch29(Observability Engineering)와 관련된다. v2.1.88의 피드백 시스템은 세션 수준(`tengu_feedback_survey_*`)이었으나, v2.1.91은 메시지 수준 평가를 추가하여, 피드백 세분화 수준을 "전체 세션이 좋았는가"에서 "이 특정 응답이 좋았는가"로 세밀화했다. 이는 Anthropic에게 RLHF(Reinforcement Learning from Human Feedback)를 위한 더 정밀한 학습 신호를 제공한다.

---

### 실험용 코드명 Event (Experimental Codename Events)

다음은 무작위 코드명을 가진 event로, 목적이 비공개인 A/B 테스트이다:

| Event | 비고 |
|-------|-------|
| `tengu_garnet_plover` | 알 수 없는 실험 |
| `tengu_gleaming_fair` | 알 수 없는 실험 |
| `tengu_gypsum_kite` | 알 수 없는 실험 |
| `tengu_slate_finch` | 알 수 없는 실험 |
| `tengu_slate_reef` | 알 수 없는 실험 |
| `tengu_willow_prism` | 알 수 없는 실험 |
| `tengu_maple_forge_w` | Write Append mode의 Feature Gate `tengu_maple_forge_w8k`와 관련 |
| `tengu_lean_sub_pf` | sub-agent lean schema와 관련 가능성 |
| `tengu_sub_nomdrep_q` | sub-agent 동작과 관련 가능성 |
| `tengu_noreread_q` | `tengu_file_read_reread` 파일 재읽기 건너뛰기와 관련 가능성 |

---

## v2.1.91 -> v2.1.92 (점진적 변경 사항) (Incremental Changes)

> v2.1.91과 v2.1.92 bundle 간 추출한 신호 차이에 기반한다. 전체 비교 보고서는 `docs/version-diffs/v2.1.88-vs-v2.1.92.md`에서 확인할 수 있다.

### 개요 (Overview)

| 지표 | v2.1.91 | v2.1.92 | 변화량 |
|--------|---------|---------|-------|
| cli.js 크기 | 12.5MB | 12.6MB | +59KB |
| Tengu events | 860 | 857 | +19 / -21 (순 -3) |
| Environment variables | 183 | 186 | +3 |
| seccomp binaries | 없음 | arm64 + x64 | **신규** |

### 주요 추가 사항 (Key Additions)

| 서브시스템 | 새로운 신호 | 영향받는 Chapter | 분석 |
|-----------|------------|-------------------|----------|
| **Tools** | `advisor_command`, `advisor_dialog_shown` + 10개 advisor_* 식별자 | ch04 | 완전히 새로운 AdvisorTool — 자체 model 호출 체인을 가진 최초의 비실행 tool |
| **Tools** | `tool_result_dedup` | ch04 | Tool 결과 중복 제거, v2.1.91의 `file_read_reread`와 함께 입출력 양방향 dedup 형성 |
| **Security** | `vendor/seccomp/{arm64,x64}/apply-seccomp` | ch16 | 시스템 수준 seccomp sandbox, v2.1.91에서 제거된 tree-sitter 애플리케이션 수준 분석을 대체 |
| **Hook** | `stop_hook_added`, `stop_hook_command`, `stop_hook_removed` | ch18 | Stop Hook 런타임 동적 추가/제거 — Hook 시스템이 런타임 관리를 지원하는 최초 사례 |
| **Auth** | `bedrock_setup_started/complete/cancelled`, `oauth_bedrock_wizard_launched` | ch05 | AWS Bedrock 가이드 설정 wizard |
| **Auth** | `oauth_platform_docs_opened` | ch05 | OAuth flow 중 플랫폼 문서 열기 |
| **Tools** | `bash_rerun_used` | ch04 | Bash 명령어 재실행 기능 |
| **Model** | `rate_limit_options_menu_select_team` | — | rate limiting 시 Team 옵션 |

### 주요 제거 사항 (Key Removals)

| 제거된 신호 | 분석 |
|---------------|----------|
| `session_tagged`, `tag_command_*` (총 5개) | 세션 태깅 시스템 완전 제거 |
| `sm_compact` | 레거시 compaction event 정리 (v2.1.91에서 이미 cold_compact를 대체제로 도입) |
| `skill_improvement_survey` | Skill 개선 설문 종료 |
| `pid_based_version_locking` | PID 기반 버전 잠금 메커니즘 제거 |
| `compact_streaming_retry` | Compaction streaming retry 정리 |
| `ultraplan_model` | Ultraplan model event 리팩토링 |
| 6개 무작위 코드명 실험 event | 이전 A/B 테스트 종료 (cobalt_frost, copper_bridge 등) |

### 새로운 Environment Variables

| 변수 | 용도 |
|----------|---------|
| `CLAUDE_CODE_EXECPATH` | 실행 파일 경로 |
| `CLAUDE_CODE_SIMULATE_PROXY_USAGE` | Proxy 사용 시뮬레이션 (테스트용) |
| `CLAUDE_CODE_SKIP_FAST_MODE_ORG_CHECK` | Fast Mode 조직 수준 검사 건너뛰기 |

### 설계 동향 (Design Trends)

v2.1.91 -> v2.1.92 증분은 작지만 방향성이 명확하다:

1. **보안 전략이 애플리케이션 계층에서 시스템 계층으로 하강** (tree-sitter -> seccomp)
2. **Tool 시스템이 순수 실행에서 자문(advisory)으로 확장** (AdvisorTool)
3. **설정 관리가 순수 정적에서 런타임 변경 가능으로 이동** (Stop Hook 동적 관리)
4. **Enterprise 온보딩 장벽 지속 하락** (Bedrock wizard)

---

*`scripts/cc-version-diff.sh`를 사용하여 diff 데이터를 생성하고, `docs/anchor-points.md`에서 서브시스템 anchor point 위치를 확인할 수 있다*

---

## v2.1.92 -> v2.1.100

**개요**: cli.js +870KB (+6.9%) | Tengu events +45/-21 (순 +24) | Env vars +8/-2 | 새로운 audio-capture vendor

### 고영향 변경 사항 (High Impact Changes)

| 변경 사항 | 영향받는 Chapter | 세부 내용 |
|--------|-------------------|---------|
| Dream 시스템 성숙화 | ch24 Memory System | kairos_dream cron 스케줄링 + auto_dream_skipped observability + dream_invoked 수동 트리거 추적 |
| Bedrock/Vertex 전체 wizard | ch06b API Communication | 설정, probing, 업그레이드 전체 lifecycle을 다루는 18개 event |
| Tool Result Dedup | ch10 File State Preservation | 짧은 ID 참조를 사용한 Tool 결과 중복 제거로 context 절약 |
| Bridge REPL 대규모 정리 | ch06b API Communication | 16개 bridge_repl_* event 제거 (잔여 참조 소량 존재), 통신 메커니즘 재구조화 |
| toolStats 통계 필드 | ch24 Memory System | sdk-tools.d.ts에 7차원 tool 사용 통계 추가 |

### 중영향 변경 사항 (Medium Impact Changes)

| 변경 사항 | 영향받는 Chapter | 세부 내용 |
|--------|-------------------|---------|
| Advisor tool | ch21 Effort/Thinking | 서버 측 strong model 리뷰 tool, Feature Gate `advisor-tool-2026-03-01` |
| Autofix PR | ch20c Ultraplan | Remote session 자동 수정 PR, ultraplan/ultrareview와 병렬 |
| Team Onboarding | ch20b Teams | 사용 보고서 생성 + 온보딩 발견 |
| Mantle auth backend | ch06b, Appendix G | 다섯 번째 API 인증 채널 |
| Cold compact 강화 | ch09 Auto-Compaction | Feature Flag 구동 + MAX_CONTEXT_TOKENS override |

### 저영향 변경 사항 (Low Impact Changes)

| 변경 사항 | 영향받는 Chapter |
|--------|-------------------|
| `hook_prompt_transcript_truncated` + stop_hook lifecycle | ch18 Hooks |
| Perforce VCS 지원 (`CLAUDE_CODE_PERFORCE_MODE`) | ch04 Tools |
| audio-capture vendor binaries (6개 플랫폼) | 잠재적 신규 기능 |
| `image_resize` — 자동 이미지 스케일링 | ch04 Tools |
| `bash_allowlist_strip_all` — bash allowlist 동작 | ch16 Permissions |
| +8/-2 environment variables | Appendix B |
| 12개 이상의 새로운 실험 코드명 event | ch23 Feature Flags |

### v2.1.100 신규 기능 상세 (v2.1.100 New Features in Detail)

다음 기능은 v2.1.92에 **존재하지 않았거나** 초보적 형태만 있었으며, v2.1.92→v2.1.100에서 점진적으로 추가된 것이다.

#### 1. Kairos Dream — 백그라운드 예약 메모리 통합 (Background Scheduled Memory Consolidation)

**Event**: `tengu_kairos_dream`

**v2.1.92 상태**: v2.1.92에 이미 `auto_dream`과 수동 `/dream` 트리거가 있었으나, 백그라운드 cron 스케줄링은 없었다.

**v2.1.100 추가 사항**:

Kairos Dream은 Dream 시스템의 세 번째 트리거 모드로 — 사용자가 새 세션을 시작하기를 기다리지 않고, 백그라운드에서 cron 스케줄링을 통해 자동으로 메모리 통합을 실행한다. bundle에서 추출한 cron 표현식 생성:

```javascript
// v2.1.100 bundle reverse engineering
function P_A() {
  let q = Math.floor(Math.random() * 360);
  return `${q % 60} ${Math.floor(q / 60)} * * *`;
  // Random minute+hour offset, avoids multi-user simultaneous triggers
}
```

`auto_dream_skipped` event의 `reason` 필드("sessions"/"lock")와 결합하여, Kairos Dream은 완전한 백그라운드 메모리 통합 lifecycle을 구현한다.

**이 책과의 관련성**: ch24에 Dream 시스템 분석(3단계 트리거 매트릭스)이 업데이트되었으며, ch29 observability chapter에서 `auto_dream_skipped` 건너뛰기 사유 분포를 observability 설계 사례 연구로 참조할 수 있다.

---

#### 2. Bedrock/Vertex Model Upgrade Wizard

**Events**: 18개 event (Bedrock 9개 + Vertex 9개), 대칭 구조

**v2.1.92 상태**: v2.1.92에는 Bedrock의 `setup_started/complete/cancelled`(3개 event)만 있었다.

**v2.1.100 추가 사항**:

완전한 model 업그레이드 감지 및 자동 전환 메커니즘. 설계 하이라이트:

1. **Unpinned model 감지**: 사용자 설정을 스캔하여 environment variable로 명시적으로 고정되지 않은 model tier를 찾는다
2. **접근성 probing**: `probeBedrockModel` / `probeVertexModel`로 사용자 계정에서 새 model이 사용 가능한지 검증한다
3. **사용자 확인**: 업그레이드가 자동 실행되지 않으며, 사용자의 수락/거절이 필요하다
4. **거절 영구 기록**: 거절된 업그레이드가 사용자 설정에 기록되어, 반복 안내를 방지한다
5. **기본값 fallback**: 기본 model에 접근 불가 시, 동일 tier의 대안으로 자동 fallback한다

Vertex wizard(`vertex_setup_started` 등)는 v2.1.100에서 신규 추가되었으며, v2.1.92에는 인터랙티브 Vertex 설정이 없었다.

---

#### 3. Autofix PR — 원격 자동 수정 (Remote Auto-Fix)

**Events**: `tengu_autofix_pr_started`, `tengu_autofix_pr_result`

**v2.1.92 상태**: 존재하지 않았다. v2.1.92에는 ultraplan과 ultrareview가 있었으나, autofix-pr은 없었다.

**v2.1.100 추가 사항**:

Autofix PR은 네 번째 remote agent 작업 유형으로, `XAY` remote task type 레지스트리에서 `remote-agent`, `ultraplan`, `ultrareview`와 함께 나열된다. bundle에서 추출한 워크플로:

```javascript
// v2.1.100 bundle reverse engineering
// Remote task type registry
XAY = ["remote-agent", "ultraplan", "ultrareview", "autofix-pr", "background-pr"];

// Autofix PR launch
d("tengu_autofix_pr_started", {});
let b = await kt({
  initialMessage: h,
  source: "autofix_pr",
  branchName: P,
  reuseOutcomeBranch: P,
  title: `Autofix PR: ${k}/${R}#${v} (${P})`
});
```

Autofix PR은 지정된 Pull Request를 모니터링하고 문제(CI 실패, 코드 리뷰 피드백)를 자동으로 수정하는 원격 Claude Code 세션을 생성한다. Ultraplan(기획)과 Ultrareview(검토)와 달리, Autofix PR은 **수정 실행**에 초점을 맞춘다.

task type 목록에 `background-pr`도 나타나는데, 이는 또 다른 백그라운드 PR 처리 모드가 있음을 시사한다.

---

#### 4. Team Onboarding — 팀 사용 보고서 (Team Usage Report)

**Events**: `tengu_team_onboarding_invoked`, `tengu_team_onboarding_generated`, `tengu_team_onboarding_discovery_shown`

**v2.1.92 상태**: 존재하지 않았다.

**v2.1.100 추가 사항**:

사용자 사용 데이터(세션 수, slash command 수, MCP server 수)를 수집하고 템플릿에서 가이드 문서를 생성하는 팀 온보딩 보고서 생성기이다. bundle에서 추출한 주요 parameter:

- `windowDays`: 분석 기간 (1-365일)
- `sessionCount`, `slashCommandCount`, `mcpServerCount`: 사용 통계 차원
- `GUIDE_TEMPLATE`, `USAGE_DATA`: 보고서 템플릿 변수

`cedar_inlet` 실험 event가 team onboarding discovery 표시(`discovery_shown`)를 제어하며, 이는 A/B 테스트 중인 기능임을 시사한다.

---

### 실험용 코드명 Event (Experiment Codename Events)

다음은 무작위 코드명을 가진 event로, 목적이 비공개인 A/B 테스트이다:

| Event | 상태 | 비고 |
|-------|--------|-------|
| `tengu_amber_sentinel` | v2.1.100에서 신규 | — |
| `tengu_basalt_kite` | v2.1.100에서 신규 | — |
| `tengu_billiard_aviary` | v2.1.100에서 신규 | — |
| `tengu_cedar_inlet` | v2.1.100에서 신규 | Team Onboarding discovery와 관련 |
| `tengu_coral_beacon` | v2.1.100에서 신규 | — |
| `tengu_flint_harbor` / `_prompt` / `_heron` | v2.1.100에서 신규 | 3개 관련 event |
| `tengu_garnet_loom` | v2.1.100에서 신규 | — |
| `tengu_pyrite_wren` | v2.1.100에서 신규 | — |
| `tengu_shale_finch` | v2.1.100에서 신규 | — |

v2.1.92에 존재했으나 v2.1.100에서 제거된 실험: `amber_lantern`, `editafterwrite_qpl`, `lean_sub_pf`, `maple_forge_w`, `relpath_gh`.

---

### 설계 동향 (Design Trends)

v2.1.92→v2.1.100의 발전 방향:

1. **메모리 시스템이 수동에서 능동으로** (auto_dream → kairos_dream 예약 실행 + 관측 가능한 건너뛰기 사유)
2. **클라우드 플랫폼이 설정에서 wizard로** (수동 env var → 인터랙티브 설정 wizard + 자동 model 업그레이드 감지)
3. **IDE bridge 아키텍처 재구조화** (bridge_repl 대부분 제거, 16개 event 정리 — 새로운 통신 메커니즘으로 전환)
4. **Remote agent 제품군 확장** (ultraplan/ultrareview → + autofix-pr + background-pr)
5. **Context 최적화 정밀화** (tool_result_dedup으로 중복 감소 + MAX_CONTEXT_TOKENS 사용자 제어 가능)

---

*`scripts/cc-version-diff.sh`를 사용하여 diff 데이터를 생성하고, `docs/anchor-points.md`에서 서브시스템 anchor point 위치를 확인할 수 있다*
