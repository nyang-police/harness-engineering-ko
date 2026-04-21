# Appendix D: 89개 Feature Flag 전체 목록 (Full List of 89 Feature Flags)

이 부록은 Claude Code v2.1.88 소스 코드에서 `feature()` 함수를 통해 제어되는 모든 Feature Flag를 기능 도메인별로 분류하여 나열한다. Reference 횟수는 소스 코드에서 각 flag가 얼마나 자주 등장하는지를 반영하며, 구현 깊이에 대한 대략적인 지표를 제공한다(maturity 추론 방법은 Chapter 23을 참고하라).

## 자율 Agent 및 백그라운드 실행 (Autonomous Agent and Background Execution) (19)

| Flag | References | Description |
|------|-----------|-------------|
| `AGENT_MEMORY_SNAPSHOT` | 2 | Agent memory snapshot |
| `AGENT_TRIGGERS` | 11 | 예약 trigger (로컬 cron) |
| `AGENT_TRIGGERS_REMOTE` | 2 | 원격 예약 trigger (클라우드 cron) |
| `BG_SESSIONS` | 11 | 백그라운드 session 관리 (ps/logs/attach/kill) |
| `BUDDY` | 15 | Buddy 모드: 플로팅 UI 버블 |
| `BUILTIN_EXPLORE_PLAN_AGENTS` | 1 | 내장 explore/plan agent 유형 |
| `COORDINATOR_MODE` | 32 | Coordinator 모드: 교차 agent 작업 조율 |
| `FORK_SUBAGENT` | 4 | Sub-agent fork 실행 모드 |
| `KAIROS` | 84 | Assistant 모드 핵심: 백그라운드 자율 agent, tick wake-up |
| `KAIROS_BRIEF` | 17 | Brief 모드: 사용자에게 진행 메시지 전송 |
| `KAIROS_CHANNELS` | 13 | Channel 시스템: 다중 채널 통신 |
| `KAIROS_DREAM` | 1 | autoDream memory 통합 trigger |
| `KAIROS_GITHUB_WEBHOOKS` | 2 | GitHub Webhook 구독: PR 이벤트 trigger |
| `KAIROS_PUSH_NOTIFICATION` | 2 | Push 알림: 사용자에게 상태 업데이트 전송 |
| `MONITOR_TOOL` | 5 | Monitor tool: 백그라운드 프로세스 모니터링 |
| `PROACTIVE` | 21 | Proactive 작업 모드: 터미널 포커스 인식, 능동적 행동 |
| `TORCH` | 1 | Torch 명령어 |
| `ULTRAPLAN` | 2 | Ultraplan: 구조화된 작업 분해 UI |
| `VERIFICATION_AGENT` | 4 | Verification agent: 작업 완료 상태 자동 검증 |

## 원격 제어 및 분산 실행 (Remote Control and Distributed Execution) (10)

| Flag | References | Description |
|------|-----------|-------------|
| `BRIDGE_MODE` | 14 | Bridge 모드 핵심: 원격 제어 프로토콜 |
| `CCR_AUTO_CONNECT` | 3 | Claude Code Remote 자동 연결 |
| `CCR_MIRROR` | 3 | CCR mirror 모드: 읽기 전용 원격 미러 |
| `CCR_REMOTE_SETUP` | 1 | CCR 원격 설정 명령어 |
| `CONNECTOR_TEXT` | 7 | Connector 텍스트 블록 처리 |
| `DAEMON` | 1 | Daemon 모드: 백그라운드 daemon worker |
| `DOWNLOAD_USER_SETTINGS` | 5 | 클라우드에서 사용자 설정 다운로드 |
| `LODESTONE` | 3 | Protocol 등록 (lodestone:// handler) |
| `UDS_INBOX` | 14 | Unix Domain Socket inbox |
| `UPLOAD_USER_SETTINGS` | 1 | 클라우드로 사용자 설정 업로드 |

## 멀티미디어 및 상호작용 (Multimedia and Interaction) (17)

| Flag | References | Description |
|------|-----------|-------------|
| `ALLOW_TEST_VERSIONS` | 2 | 테스트 버전 허용 |
| `ANTI_DISTILLATION_CC` | 1 | Anti-distillation 보호 |
| `AUTO_THEME` | 1 | 자동 테마 전환 |
| `BUILDING_CLAUDE_APPS` | 1 | Building Claude Apps skill |
| `CHICAGO_MCP` | 12 | Computer Use MCP 통합 |
| `HISTORY_PICKER` | 1 | History picker UI |
| `MESSAGE_ACTIONS` | 2 | Message action (복사/편집 단축키) |
| `NATIVE_CLIENT_ATTESTATION` | 1 | 네이티브 클라이언트 인증 |
| `NATIVE_CLIPBOARD_IMAGE` | 2 | 네이티브 클립보드 이미지 지원 |
| `NEW_INIT` | 2 | 새로운 초기화 플로우 |
| `POWERSHELL_AUTO_MODE` | 2 | PowerShell 자동 모드 |
| `QUICK_SEARCH` | 1 | Quick search UI |
| `REVIEW_ARTIFACT` | 1 | Review artifact |
| `TEMPLATES` | 5 | 작업 template/분류 |
| `TERMINAL_PANEL` | 3 | Terminal panel |
| `VOICE_MODE` | 11 | Voice 모드: 스트리밍 음성-텍스트 변환 |
| `WEB_BROWSER_TOOL` | 1 | Web browser tool (Bun WebView) |

## Context 및 성능 최적화 (Context and Performance Optimization) (16)

| Flag | References | Description |
|------|-----------|-------------|
| `ABLATION_BASELINE` | 1 | Ablation 테스트 baseline |
| `BASH_CLASSIFIER` | 33 | Bash 명령어 classifier |
| `BREAK_CACHE_COMMAND` | 2 | 강제 cache break 명령어 |
| `CACHED_MICROCOMPACT` | 12 | 캐시된 micro-compaction 전략 |
| `COMPACTION_REMINDERS` | 1 | Compaction 리마인더 메커니즘 |
| `CONTEXT_COLLAPSE` | 16 | Context collapse: 세밀한 context 관리 |
| `FILE_PERSISTENCE` | 3 | File persistence 타이밍 |
| `HISTORY_SNIP` | 15 | History snip 명령어 |
| `OVERFLOW_TEST_TOOL` | 2 | Overflow 테스트 tool |
| `PROMPT_CACHE_BREAK_DETECTION` | 9 | Prompt Cache break 감지 |
| `REACTIVE_COMPACT` | 4 | Reactive compaction: 온디맨드 trigger |
| `STREAMLINED_OUTPUT` | 1 | 간소화된 출력 모드 |
| `TOKEN_BUDGET` | 4 | Token budget 추적 UI |
| `TREE_SITTER_BASH` | 3 | Tree-sitter Bash parser |
| `TREE_SITTER_BASH_SHADOW` | 5 | Tree-sitter Bash shadow 모드 (A/B) |
| `ULTRATHINK` | 1 | Ultra-think 모드 |

## Memory 및 지식 관리 (Memory and Knowledge Management) (13)

| Flag | References | Description |
|------|-----------|-------------|
| `AWAY_SUMMARY` | 2 | Away summary: 부재 시 진행 상황 생성 |
| `COWORKER_TYPE_TELEMETRY` | 2 | 동료 유형 telemetry |
| `ENHANCED_TELEMETRY_BETA` | 2 | 향상된 telemetry beta |
| `EXPERIMENTAL_SKILL_SEARCH` | 19 | 실험적 원격 skill 검색 |
| `EXTRACT_MEMORIES` | 7 | 자동 memory 추출 |
| `MCP_RICH_OUTPUT` | 3 | MCP rich text 출력 |
| `MCP_SKILLS` | 9 | MCP 서버 skill 탐색 |
| `MEMORY_SHAPE_TELEMETRY` | 3 | Memory 구조 telemetry |
| `RUN_SKILL_GENERATOR` | 1 | Skill generator |
| `SKILL_IMPROVEMENT` | 1 | 자동 skill 개선 |
| `TEAMMEM` | 44 | Team memory 동기화 |
| `WORKFLOW_SCRIPTS` | 6 | Workflow script |
| `TRANSCRIPT_CLASSIFIER` | 69 | Transcript classifier (자동 모드) |

## 인프라 및 Telemetry (Infrastructure and Telemetry) (14)

| Flag | References | Description |
|------|-----------|-------------|
| `COMMIT_ATTRIBUTION` | 11 | Git commit attribution 추적 |
| `HARD_FAIL` | 2 | Hard failure 모드 |
| `IS_LIBC_GLIBC` | 1 | glibc 런타임 감지 |
| `IS_LIBC_MUSL` | 1 | musl 런타임 감지 |
| `PERFETTO_TRACING` | 1 | Perfetto 성능 tracing |
| `SHOT_STATS` | 8 | Tool call 분포 통계 |
| `SLOW_OPERATION_LOGGING` | 1 | 느린 작업 로깅 |
| `UNATTENDED_RETRY` | 1 | 무인 재시도 |

---

## 통계 요약 (Statistical Summary)

| 카테고리 | 개수 | 최다 Reference Flag |
|----------|------|----------------------|
| 자율 Agent 및 백그라운드 실행 | 19 | KAIROS (84) |
| 원격 제어 및 분산 실행 | 10 | BRIDGE_MODE (14), UDS_INBOX (14) |
| 멀티미디어 및 상호작용 | 17 | CHICAGO_MCP (12) |
| Context 및 성능 최적화 | 16 | TRANSCRIPT_CLASSIFIER (69) |
| Memory 및 지식 관리 | 13 | TEAMMEM (44) |
| 인프라 및 Telemetry | 14 | COMMIT_ATTRIBUTION (11) |
| **합계** | **89** | |

**Reference 횟수 상위 5개**: KAIROS (84) > TRANSCRIPT_CLASSIFIER (69) > TEAMMEM (44) > BASH_CLASSIFIER (33) > COORDINATOR_MODE (32)
