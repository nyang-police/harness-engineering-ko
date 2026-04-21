# Appendix A: 주요 파일 인덱스 (Key File Index)

이 부록은 Claude Code v2.1.88 소스 코드의 주요 파일과 그 역할을 서브시스템별로 분류하여 정리한 것이다. 파일 경로는 `restored-src/src/` 기준 상대 경로다.

## 진입점과 핵심 루프 (Entry Points and Core Loop)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `main.tsx` | CLI 진입점, 병렬 prefetch, lazy import, Feature Flag 게이팅 | Chapter 1 |
| `query.ts` | Agent Loop 메인 루프, `queryLoop` state machine | Chapter 3 |
| `query/transitions.ts` | 루프 전환 타입: `Continue`, `Terminal` | Chapter 3 |

## Tool 시스템 (Tool System)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `Tool.ts` | Tool interface 계약, `TOOL_DEFAULTS` fail-closed 기본값 | Chapters 2, 25 |
| `tools.ts` | Tool 등록, Feature Flag 조건부 로딩 | Chapter 2 |
| `services/tools/toolOrchestration.ts` | Tool 실행 오케스트레이션, `partitionToolCalls` 동시성 파티셔닝 | Chapter 4 |
| `services/tools/toolExecution.ts` | 단일 Tool 실행 생명주기 | Chapter 4 |
| `services/tools/StreamingToolExecutor.ts` | Streaming Tool executor | Chapter 4 |
| `tools/BashTool/` | Bash Tool 구현, Git 안전 프로토콜 포함 | Chapters 8, 27 |
| `tools/FileEditTool/` | File Edit Tool, "read before edit" 강제 | Chapters 8, 27 |
| `tools/FileReadTool/` | File Read Tool, 기본 2000줄 | Chapter 8 |
| `tools/GrepTool/` | ripgrep 기반 검색 Tool | Chapter 8 |
| `tools/AgentTool/` | Sub-Agent 생성 Tool | Chapters 8, 20 |
| `tools/SkillTool/` | Skill 호출 Tool | Chapters 8, 22 |
| `tools/SkillTool/prompt.ts` | Skill 목록 예산: context window의 1% | Chapters 12, 26 |

## System Prompt

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `constants/prompts.ts` | System Prompt 구성, `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` | Chapters 5, 6, 25 |
| `constants/systemPromptSections.ts` | 섹션 레지스트리와 cache control 범위 | Chapter 5 |
| `constants/toolLimits.ts` | Tool 결과 예산 상수 | Chapters 12, 26 |

## API와 캐싱 (API and Caching)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `services/api/claude.ts` | API 호출 구성, cache breakpoint 배치 | Chapter 13 |
| `services/api/promptCacheBreakDetection.ts` | Cache break 감지, `PreviousState` 추적 | Chapters 14, 25 |
| `utils/api.ts` | `splitSysPromptPrefix()` 3-way cache 분할 | Chapters 5, 13 |

## Context Compaction

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `services/compact/compact.ts` | Compaction 오케스트레이션, `POST_COMPACT_MAX_FILES_TO_RESTORE` | Chapters 9, 10 |
| `services/compact/autoCompact.ts` | Auto-Compaction 임계값과 circuit breaker | Chapters 9, 25, 26 |
| `services/compact/prompt.ts` | Compaction prompt 템플릿 | Chapters 9, 28 |
| `services/compact/microCompact.ts` | 시간 기반 micro-compaction | Chapter 11 |
| `services/compact/apiMicrocompact.ts` | API 네이티브 cached micro-compaction | Chapter 11 |

## Permission과 보안 (Permissions and Security)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `utils/permissions/yoloClassifier.ts` | YOLO auto-mode 분류기 | Chapter 17 |
| `utils/permissions/denialTracking.ts` | 거부 추적, `DENIAL_LIMITS` | Chapters 17, 27 |
| `tools/BashTool/bashPermissions.ts` | Bash 명령어 권한 검사 | Chapter 16 |

## CLAUDE.md와 Skill (CLAUDE.md and Skills)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `utils/claudemd.ts` | CLAUDE.md 로딩 및 주입, 4계층 우선순위 | Chapter 19 |
| `skills/bundled/` | 내장 Skill 디렉터리 | Chapter 22 |
| `skills/loadSkillsDir.ts` | 사용자 정의 Skill 탐색 | Chapter 22 |
| `skills/mcpSkillBuilders.ts` | MCP-to-Skill 브릿지 | Chapter 22 |

## Multi-Agent 오케스트레이션 (Multi-Agent Orchestration)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `coordinator/coordinatorMode.ts` | Coordinator 모드 구현 | Chapter 20 |
| `utils/teammate.ts` | Teammate Agent Tool | Chapter 20 |
| `utils/swarm/teammatePromptAddendum.ts` | Teammate prompt 부록 내용 | Chapter 20 |

## Tool 결과와 저장 (Tool Results and Storage)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `utils/toolResultStorage.ts` | 대용량 결과 영속화, truncation 미리보기 | Chapters 12, 28 |
| `utils/toolSchemaCache.ts` | Tool Schema 캐싱 | Chapter 15 |

## 세션 간 메모리 (Cross-Session Memory)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `memdir/memdir.ts` | MEMORY.md 인덱스 및 토픽 파일 로딩, System Prompt 주입 | Chapter 24 |
| `memdir/paths.ts` | 메모리 디렉터리 경로 해석, 3단계 우선순위 체인 | Chapter 24 |
| `services/extractMemories/extractMemories.ts` | Fork Agent 자동 메모리 추출 | Chapter 24 |
| `services/SessionMemory/sessionMemory.ts` | Compaction을 위한 롤링 세션 요약 | Chapter 24 |
| `utils/sessionStorage.ts` | JSONL 세션 기록 저장 및 복구 | Chapter 24 |
| `tools/AgentTool/agentMemory.ts` | Sub-Agent 영속화 및 VCS 스냅샷 | Chapter 24 |
| `services/autoDream/autoDream.ts` | 야간 메모리 통합 및 정리 | Chapter 24 |

## Telemetry와 관측성 (Telemetry and Observability)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `services/analytics/index.ts` | 이벤트 진입점, queue-attach 패턴, PII 태그 타입 | Chapter 29 |
| `services/analytics/sink.ts` | 이중 경로 dispatch (Datadog + 1P), 샘플링 | Chapter 29 |
| `services/analytics/firstPartyEventLogger.ts` | OTel BatchLogRecordProcessor 통합 | Chapter 29 |
| `services/analytics/firstPartyEventLoggingExporter.ts` | 커스텀 Exporter, 디스크 영속 재시도 | Chapter 29 |
| `services/analytics/metadata.ts` | 이벤트 메타데이터, Tool 이름 정제, PII 등급 분류 | Chapter 29 |
| `services/analytics/datadog.ts` | Datadog allow-list, 배치 플러싱 | Chapter 29 |
| `services/analytics/sinkKillswitch.ts` | 원격 circuit breaker (tengu_frond_boric) | Chapter 29 |
| `services/api/logging.ts` | API 3-이벤트 모델 (query/success/error) | Chapter 29 |
| `services/api/withRetry.ts` | 재시도 telemetry, gateway 핑거프린트 감지 | Chapter 29 |
| `utils/debug.ts` | 디버그 로깅, --debug 플래그 | Chapter 29 |
| `utils/diagLogs.ts` | PII 없는 컨테이너 진단 | Chapter 29 |
| `utils/errorLogSink.ts` | 에러 파일 로깅 | Chapter 29 |
| `utils/telemetry/sessionTracing.ts` | OTel span, 3단계 트레이싱 | Chapter 29 |
| `utils/telemetry/perfettoTracing.ts` | Perfetto 시각화 트레이싱 | Chapter 29 |
| `utils/gracefulShutdown.ts` | 단계적 타임아웃 graceful shutdown | Chapter 29 |
| `cost-tracker.ts` | 비용 추적, 세션 간 영속화 | Chapter 29 |

## 설정과 상태 (Configuration and State)

| File | Responsibility | Related Chapters |
|------|---------------|-----------------|
| `utils/effort.ts` | Effort level 파싱 | Chapter 21 |
| `utils/fastMode.ts` | Fast Mode 관리 | Chapter 21 |
| `utils/managedEnvConstants.ts` | Managed 환경 변수 허용 목록 | Appendix B |
| `screens/REPL.tsx` | 메인 대화형 인터페이스 (5000줄 이상의 React 컴포넌트) | Chapter 1 |
