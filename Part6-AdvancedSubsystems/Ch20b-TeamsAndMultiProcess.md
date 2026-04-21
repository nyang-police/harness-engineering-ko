# Chapter 20b: Teams와 다중 프로세스 협업 (Teams and Multi-Process Collaboration)

> **위치**: 이 Chapter는 Claude Code의 Swarm 팀 협업 메커니즘 — 평면 구조의 다중 Agent 협업 모델 — 을 분석한다. 사전 지식: Chapter 20. 대상 독자: CC의 Swarm 팀 협업 메커니즘 — TaskList 스케줄링, DAG 의존성, Mailbox 통신 포함 — 을 심층적으로 이해하고자 하는 독자.

## Teams를 별도로 다루는 이유 (Why Discuss Teams Separately)

Chapter 20에서는 Claude Code의 세 가지 Agent 생성 모드 — Subagent, Fork, Coordinator — 를 소개했으며, 이들은 모두 "부모가 자식을 생성하는" 계층 관계라는 공통점을 갖는다. Teams(teammate 시스템)는 다른 차원이다: 메시지 전달을 통해 협업하는 **평면 구조 팀**을 만들며, 계층적 호출이 아니다. 이 차이는 아키텍처뿐 아니라 통신 프로토콜, 권한 동기화, 라이프사이클 관리의 엔지니어링 구현에서도 나타난다.

---

## 20b.1 Teammate Agents (Agent Swarms)

teammate 시스템은 Agent 오케스트레이션의 또 다른 차원이다. subagent의 "부모가 자식을 생성하는" 모델과 달리, teammate 시스템은 메시지 전달을 통해 협업하는 **평면 구조 팀**을 만든다.

### TeamCreateTool: 팀 생성

`TeamCreateTool` (`tools/TeamCreateTool/TeamCreateTool.ts`)은 새 팀을 만드는 데 사용된다:

```typescript
// tools/TeamCreateTool/TeamCreateTool.ts:37-49
const inputSchema = lazySchema(() =>
  z.strictObject({
    team_name: z.string().describe('Name for the new team to create.'),
    description: z.string().optional(),
    agent_type: z.string().optional()
      .describe('Type/role of the team lead'),
  }),
)
```

팀 정보는 팀 이름, 멤버 목록, Leader 정보 등을 담은 `TeamFile`에 영속화된다. 팀 이름은 고유해야 하며 — 충돌 시 word slug가 자동 생성된다 (lines 64-72).

### TeammateAgentContext: Teammate Context

Teammates는 `TeammateAgentContext` 타입 (`agentContext.ts` lines 60-85)을 사용하며, 풍부한 팀 조율 정보를 담는다:

```typescript
// utils/agentContext.ts:60-85
export type TeammateAgentContext = {
  agentId: string          // Full ID, e.g., "researcher@my-team"
  agentName: string        // Display name, e.g., "researcher"
  teamName: string         // Team membership
  agentColor?: string      // UI color
  planModeRequired: boolean // Whether plan approval is needed
  parentSessionId: string  // Leader's session ID
  isTeamLead: boolean      // Whether this is the Leader
  agentType: 'teammate'
}
```

Teammate ID는 `name@team-name` 형식을 사용하여, 로그와 통신에서 Agent의 신원과 소속을 한눈에 파악할 수 있다.

### 평면 구조 제약 (Flat Structure Constraint)

teammate 시스템에는 중요한 아키텍처적 제약이 있다: **teammates는 다른 teammates를 생성할 수 없다** (lines 272-274):

```typescript
// tools/AgentTool/AgentTool.tsx:272-274
if (isTeammate() && teamName && name) {
  throw new Error('Teammates cannot spawn other teammates — the team roster is flat.');
}
```

이는 의도된 설계다 — 팀 명단은 평면 배열이며, 중첩된 teammates는 출처 정보 없이 명단에 항목을 생성하여 Leader의 조율 로직을 혼란스럽게 만든다.

마찬가지로, in-process teammates는 background Agent를 생성할 수 없다 (lines 278-280). 이들의 라이프사이클이 Leader의 프로세스에 묶여 있기 때문이다.

---

## 20b.2 Agent 간 통신 (Inter-Agent Communication)

### SendMessageTool: 메시지 라우팅

`SendMessageTool` (`tools/SendMessageTool/SendMessageTool.ts`)은 Agent 간 통신의 핵심이다. `to` 필드는 여러 주소 지정 모드를 지원한다:

```typescript
// tools/SendMessageTool/SendMessageTool.ts:69-76
to: z.string().describe(
  feature('UDS_INBOX')
    ? 'Recipient: teammate name, "*" for broadcast, "uds:<socket-path>" for a local peer, or "bridge:<session-id>" for a Remote Control peer'
    : 'Recipient: teammate name, or "*" for broadcast to all teammates',
),
```

메시지 타입은 discriminated union을 구성하며 (lines 47-65), 다음을 지원한다:
- 일반 텍스트 메시지
- Shutdown 요청 (`shutdown_request`)
- Shutdown 응답 (`shutdown_response`)
- Plan 승인 응답 (`plan_approval_response`)

### Broadcast 메커니즘

`to`가 `"*"`일 때 broadcast가 트리거된다 (`handleBroadcast`, lines 191-266): team file의 모든 멤버(발신자 제외)를 순회하며 각 mailbox에 쓴다. Broadcast 결과에는 coordinator 추적을 위한 수신자 목록이 포함된다.

### Mailbox 시스템

메시지는 `writeToMailbox()` 함수를 통해 파일시스템 mailbox에 물리적으로 기록된다. 각 메시지에는 발신자 이름, 텍스트 내용, 요약, 타임스탬프, 발신자 색상이 포함된다. 이 파일시스템 기반 mailbox 설계는 cross-process teammates (tmux 모드)가 공유 파일시스템을 통해 통신할 수 있게 한다.

### UDS_INBOX: Unix Domain Socket 확장

`UDS_INBOX` Feature Flag가 활성화되면 `SendMessageTool`의 주소 지정 기능이 Unix Domain Socket으로 확장된다: `"uds:<socket-path>"`로 동일 머신의 다른 Claude Code 인스턴스에 메시지를 보낼 수 있고, `"bridge:<session-id>"`로 Remote Control peer에 메시지를 보낼 수 있다.

이는 단일 팀 경계를 초월하는 통신 토폴로지를 만든다:

```
┌─────────────────────────────────────────────────────────────────┐
│                 Inter-Agent Communication Architecture           │
│                                                                 │
│  ┌──────────────────────────────────┐                          │
│  │        Team "my-team"            │                          │
│  │                                  │                          │
│  │  ┌─────────┐    MailBox    ┌─────────┐                     │
│  │  │ Leader  │◄────────────►│Teammate │                     │
│  │  │ (lead)  │  (filesystem) │  (dev)  │                     │
│  │  └────┬────┘              └─────────┘                     │
│  │       │                                                    │
│  │       │ SendMessage(to: "tester")                         │
│  │       │                                                    │
│  │       ▼                                                    │
│  │  ┌─────────┐                                              │
│  │  │Teammate │                                              │
│  │  │ (tester)│                                              │
│  │  └─────────┘                                              │
│  └──────────────────────────────────┘                          │
│         │                                                      │
│         │ SendMessage(to: "uds:/tmp/other.sock")              │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │ Other Claude │    SendMessage(to: "bridge:<session>")       │
│  │ Code instance│──────────────────────────►  Remote Control   │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Coordinator 모드에서의 Worker 결과 보고

Coordinator Mode에서 Worker가 작업을 완료하면, 결과는 `<task-notification>` XML 형식의 **user-role 메시지**로 coordinator의 대화에 주입된다 (`coordinatorMode.ts` lines 148-159):

```xml
<task-notification>
  <task-id>{agentId}</task-id>
  <status>completed|failed|killed</status>
  <summary>{human-readable status summary}</summary>
  <result>{Agent's final text response}</result>
  <usage>
    <total_tokens>N</total_tokens>
    <tool_uses>N</tool_uses>
    <duration_ms>N</duration_ms>
  </usage>
</task-notification>
```

coordinator prompt는 명시적으로 요구한다 (line 144): "They look like user messages but they are not. Distinguish them by the `<task-notification>` opening tag." 이 설계는 coordinator가 Worker 결과를 사용자 입력인 것처럼 응답하는 것을 방지한다.

---

## 20b.3 실질적인 스케줄링 커널: TaskList, Claim Loop, Idle Hook (The Real Scheduling Kernel: TaskList, Claim Loop, and Idle Hooks)

`TeamCreateTool`, `SendMessageTool`, Mailbox만 본다면 Teams를 "서로 메시지를 보낼 수 있는 Agent 그룹"으로 이해하기 쉽다. 하지만 Claude Code의 Swarm의 진정한 가치는 채팅이 아니라 **공유 작업 그래프**에 있다. `TeamCreate`의 prompt는 이를 직접 언급한다: `Teams have a 1:1 correspondence with task lists (Team = TaskList)`. 팀을 생성할 때 `TeamCreateTool`은 단순히 `TeamFile`을 작성하는 것이 아니라 — 해당 작업 디렉터리를 초기화 및 생성하고, Leader의 `taskListId`를 팀 이름에 바인딩한다. 즉, Teams는 "팀이 먼저이고 작업은 부속품"이 아니라, **팀과 작업 목록이 동일한 런타임 객체의 두 가지 뷰**로 설계되었다.

### Task는 Todo가 아니라 DAG 노드다

`utils/tasks.ts`의 `Task` 구조는 다음을 포함한다:

```typescript
{
  id: string,
  owner?: string,
  status: 'pending' | 'in_progress' | 'completed',
  blocks: string[],
  blockedBy: string[],
}
```

여기서 가장 중요한 필드는 `status`가 아니라 `blocks`와 `blockedBy`다. 이 둘은 작업 목록을 단순한 todo 목록에서 **명시적 의존성 그래프**로 끌어올린다: 작업은 모든 blocker가 완료된 후에만 실행 가능하다. 이 설계를 통해 Leader는 의존성이 있는 전체 작업 묶음을 미리 생성하고 "언제 병렬화할지"를 런타임에 넘길 수 있다. 반복적으로 prompt에서 구두 조율할 필요가 없다.

이것이 `TeamCreate`의 prompt가 강조하는 이유이기도 하다: "teammates should check TaskList periodically, especially after completing each task, to find available work or see newly unblocked tasks." Claude Code는 각 teammate가 완전한 전역 계획 추론 능력을 갖출 것을 요구하지 않는다. **공유 작업 그래프로 돌아가 상태를 읽을 것**을 요구한다.

### Auto-Claim: Swarm의 최소 스케줄러

이 작업 그래프를 실제로 구동하는 것은 `useTaskListWatcher.ts`다. 이 watcher는 작업 디렉터리가 변경되거나 Agent가 다시 idle 상태가 될 때마다 검사를 트리거하여, 사용 가능한 작업을 자동으로 선택한다:

- `status === 'pending'`
- `owner`가 비어 있음
- `blockedBy`의 모든 작업이 완료됨

소스 코드의 `findAvailableTask()`는 정확히 이 조건으로 필터링한다. 작업을 찾은 후 런타임은 먼저 `claimTask()`로 소유권을 선점하고, 작업을 prompt로 포맷하여 Agent가 실행한다. 제출에 실패하면 claim이 해제된다. 두 가지 중요한 엔지니어링적 의미:

1. **스케줄링과 추론이 분리된다.** 모델은 자연어로 "누군가 하고 있지 않으면서 의존성이 해소된 작업이 어떤 것인지"를 판단할 필요가 없다. 런타임이 먼저 후보를 단 하나의 명시적 작업으로 좁힌다.
2. **병렬성은 메시지 협상이 아닌 공유 상태에서 나온다.** 여러 Agent가 동시에 진행할 수 있는 것은 서로 조율할 만큼 충분히 똑똑해서가 아니라, claim + blocker 검사가 충돌을 상태 기계에 명시적으로 인코딩하기 때문이다.

이 관점에서 Claude Code의 Swarm은 이미 작고 완전한 스케줄러를 갖추고 있다: **작업 그래프 + 원자적 claim + 상태 전환**. Mailbox는 협업 보조 수단일 뿐, 주요 스케줄링 표면이 아니다.

### Post-Turn 이벤트 표면: TaskCompleted와 TeammateIdle

Swarm의 또 다른 핵심 측면은 teammate가 실행 턴을 마칠 때 단순히 "멈추는" 것이 아니라 — 이벤트 기반 마무리 단계에 진입한다는 것이다. `query/stopHooks.ts`에서, 현재 실행자가 teammate일 때 Claude Code는 일반 Stop hook 이후 두 가지 유형의 특수 이벤트를 실행한다:

- `TaskCompleted`: 현재 teammate가 소유한 `in_progress` 작업에 대한 완료 hook을 발동
- `TeammateIdle`: teammate가 idle 상태에 진입할 때 hook을 발동

이로 인해 Teams는 순수 pull 기반도, 순수 push 기반도 아닌 둘의 조합이 된다:

- **pull**: idle teammates가 TaskList로 돌아가 새 작업을 계속 claim
- **push**: 작업 완료와 teammate idle이 이벤트를 트리거하여, Leader에게 알리거나 후속 자동화를 구동

즉, Claude Code의 Swarm은 "메시지를 보내는 agent 그룹"이 아니라, **공유 작업 그래프 + 내구성 mailbox + post-turn 이벤트**로 구성된 협업 커널이다.

### 공유 메모리가 아닌 공유 상태

여기서 표현이 매우 정확해야 한다. Teams는 "여러 Agent가 작업공간을 공유하는 것"처럼 보일 수 있지만, 소스 코드에 따르면 더 정확한 설명은 "공유 메모리"가 아니라 세 가지 공유 상태 레이어다:

- **공유 작업 상태**: `~/.claude/tasks/{team-name}/`
- **공유 통신 상태**: `~/.claude/teams/{team}/inboxes/*.json`
- **공유 팀 설정**: `~/.claude/teams/{team}/config.json`

In-Process teammates는 물리적으로 동일한 프로세스에서 실행되고 `AsyncLocalStorage`를 통해 자체 신원 context를 보존할 뿐이다. 이것이 전체 시스템을 범용 blackboard 공유 메모리 런타임으로 끌어올리지는 않는다. 이 구분은 중요하다. Claude Code의 Swarm의 진정으로 이식 가능한 패턴을 결정하기 때문이다: **먼저 협업 상태를 외부화하고, 서로 다른 실행 단위가 그 주위에서 협업하게 한다**.

---

## 20b.4 비동기 Agent 라이프사이클 (Async Agent Lifecycle)

`shouldRunAsync`가 `true`일 때 (line 567에서 `run_in_background`, `background: true`, Coordinator Mode, Fork 모드, assistant 모드 등 중 하나라도 트리거되면), Agent는 비동기 라이프사이클에 진입한다:

1. **등록**: `registerAsyncAgent()`가 background 작업 레코드를 생성하고 `agentId`를 할당
2. **실행**: `runWithAgentContext()`로 래핑된 `runAgent()`를 실행
3. **진행 보고**: `updateAsyncAgentProgress()`와 `onProgress` 콜백으로 상태 업데이트
4. **완료/실패**: `completeAsyncAgent()` 또는 `failAsyncAgent()` 호출
5. **알림**: `enqueueAgentNotification()`이 결과를 호출자의 메시지 스트림에 주입

핵심 설계 선택: background Agent는 부모 Agent의 `abortController`에 연결되지 않는다 (line 694-696 주석) — 사용자가 ESC를 눌러 메인 스레드를 취소해도, background Agent는 계속 실행된다. `chat:killAgents`를 통해서만 명시적으로 종료할 수 있다.

### Worktree 격리 (Worktree Isolation)

`isolation: 'worktree'`일 때, Agent는 임시 git worktree에서 실행된다 (lines 590-593):

```typescript
const slug = `agent-${earlyAgentId.slice(0, 8)}`;
worktreeInfo = await createAgentWorktree(slug);
```

Agent 완료 후, worktree에 변경 사항이 없으면 (생성 시점의 HEAD 커밋과 비교) 자동으로 정리된다 (lines 666-679). 변경 사항이 있는 worktree는 유지되며, 해당 경로와 브랜치 이름이 호출자에게 반환된다.

---

## 20b.5 Teams 구현 세부 사항: 백엔드, 통신, 권한, 메모리 (Teams Implementation Details: Backends, Communication, Permissions, and Memory)

> 이 섹션은 20b.1 (teammate 개요)의 구현 레벨 심층 분석이다. Section 20b.1이 "Teams란 무엇인가"를 답했다면 — 평면 구조 팀, TeamCreateTool, TeammateAgentContext 타입 — 이 섹션은 "Teams가 실제로 어떻게 실행되는가"를 답한다 — 프로세스 관리, 통신 프로토콜, 권한 동기화, 공유 메모리 엔지니어링 구현.
>
> 소스 코드에서 "Swarm"과 "Team"은 동의어다: 디렉터리는 `utils/swarm/`, 도구는 `TeamCreateTool`, Feature Flag는 `ENABLE_AGENT_SWARMS`, 상수는 `SWARM_SESSION_NAME = 'claude-swarm'`.

### 세 가지 백엔드, 하나의 인터페이스 (Three Backends, One Interface)

Teams는 세 가지 물리적 백엔드를 지원하며, `PaneBackend` + `TeammateExecutor` 인터페이스 (`utils/swarm/backends/types.ts`) 뒤로 통합된다:

| 백엔드 | 프로세스 모델 | 통신 | 사용 사례 |
|--------|-------------|------|----------|
| **Tmux** | 독립 CLI 프로세스, tmux split pane | Filesystem Mailbox | 기본 백엔드, Linux/macOS용 |
| **iTerm2** | 독립 CLI 프로세스, iTerm2 split pane | Filesystem Mailbox | macOS 네이티브 터미널 사용자 |
| **In-Process** | 동일 프로세스 `AsyncLocalStorage` 격리 | AppState 메모리 큐 | tmux/iTerm2 환경 없음 |

백엔드 감지 우선순위 체인 (`backends/registry.ts`):

```
1. Running inside tmux?           → Tmux (native)
2. Inside iTerm2 with it2 available? → iTerm2 (native)
3. Inside iTerm2 but no it2?      → Prompt to install it2
4. System has tmux?               → Tmux (external session)
5. None of the above?             → In-Process fallback
```

이 전략 패턴의 장점: Leader의 `TeamCreateTool`과 `SendMessageTool`은 teammates가 어떤 백엔드에서 실행되는지 알 필요가 없다 — `spawnTeammate()`가 자동으로 최선의 옵션을 선택한다.

### 팀 라이프사이클 (Team Lifecycle)

```typescript
// utils/swarm/teamHelpers.ts — TeamFile structure
{
  name: string,                    // Unique team name
  description?: string,
  createdAt: number,
  leadAgentId: string,             // Format: team-lead@{teamName}
  members: [{
    agentId: string,               // Format: {name}@{teamName}
    name: string,
    agentType?: string,
    model?: string,
    prompt: string,
    color: string,                 // Auto-assigned terminal color
    planModeRequired: boolean,
    tmuxPaneId?: string,
    sessionId?: string,
    backendType: BackendType,
    isActive: boolean,
    mode: PermissionMode,
  }]
}
```

저장 위치: `~/.claude/teams/{teamName}/config.json`

**Teammate 생성 흐름** (`spawnMultiAgent.ts:305-539`):

1. 백엔드 감지 -> 고유 이름 생성 -> agent ID 포맷 (`{name}@{teamName}`)
2. 터미널 색상 할당 -> tmux/iTerm2 split pane 생성
3. 상속 CLI 인수 빌드: `--agent-id`, `--agent-name`, `--team-name`, `--agent-color`, `--parent-session-id`, `--permission-mode`
4. 상속 환경 변수 빌드 -> split pane에 시작 명령 전송
5. TeamFile 업데이트 -> Mailbox를 통해 초기 지시 전송
6. out-of-process 작업 추적 등록

**평면 구조 제약**: Teammates는 sub-teammate를 생성할 수 없다 (`AgentTool.tsx:266-300`). 이는 기술적 한계가 아니라 — 의도적인 조직 원칙이다: 조율은 Leader에 집중되며, 무한히 깊은 위임 체인을 방지한다.

### Mailbox 통신 프로토콜 (Mailbox Communication Protocol)

Teammates는 파일시스템 mailbox를 통해 비동기적으로 통신한다 (`teammateMailbox.ts`):

```
~/.claude/teams/{teamName}/inboxes/{agentName}.json
```

**동시성 제어**: async lockfile + exponential backoff (10회 재시도, 5-100ms 지연 범위)

**메시지 구조**:

```typescript
type TeammateMessage = {
  from: string,      // Sender name
  text: string,      // Message content or JSON control message
  timestamp: string,
  read: boolean,      // Read marker
  color?: string,     // Sender's terminal color
  summary?: string,   // 5-10 word summary
}
```

**제어 메시지 타입** (`text` 필드에 중첩된 구조화 JSON):

| 타입 | 방향 | 목적 |
|------|------|-----|
| `idle` 알림 | Teammate -> Leader | Teammate 작업 완료, 이유 보고 (available/error/shutdown/completed) |
| `shutdown_request` | Leader -> Teammate | 정상적인 종료 요청 |
| `shutdown_response` | Teammate -> Leader | 종료 요청 승인 또는 거부 |
| `plan_approval_response` | Leader -> Teammate | Teammate가 제출한 plan 승인 또는 거부 |

**Idle 알림 구조** (`teammateMailbox.ts`):

```typescript
type IdleNotificationMessage = {
  type: 'idle',
  teamName: string,
  agentName: string,
  agentId: string,
  idleReason: 'available' | 'error' | 'shutdown' | 'completed',
  summary?: string,           // Work summary
  peerDmSummary?: string,     // Recent DM summary
  errorDetails?: string,
}
```

### 권한 동기화: Leader 프록시 승인 (Permission Synchronization: Leader Proxy Approval)

Teammates는 위험한 tool 호출을 자체 승인할 수 없다 — Leader 프록시를 통해야 한다 (`utils/swarm/permissionSync.ts`):

```
~/.claude/teams/{teamName}/permissions/
  ├── pending/     # Requests awaiting approval
  └── resolved/    # Processed requests
```

**요청 흐름**:

```
Worker encounters permission check
  ↓
Creates SwarmPermissionRequest (with toolName, input, suggestions)
  ↓
Writes to pending/{requestId}.json + sends to Leader Mailbox
  ↓
Leader polls Mailbox → detects permission request → presents to user
  ↓
User approves/rejects in Leader terminal
  ↓
Writes to resolved/{requestId}.json
  ↓
Worker polls resolved/ → gets result → continues execution
```

이 설계는 teammates가 독립 프로세스에서 실행되더라도 모든 위험한 작업이 인간의 승인을 거치도록 보장한다.

### 팀 메모리 (Team Memory)

Feature gate `TENGU_HERRING_CLOCK`이 이를 제어한다. 위치:

```
~/.claude/projects/{project}/memory/team/MEMORY.md
```

개인 메모리 (`~/.claude/projects/{project}/memory/`)와 독립적이며, 모든 팀 멤버가 공유한다. 개인 메모리와 동일한 두 단계 쓰기 흐름을 사용한다: 먼저 `.md` 파일을 작성한 후 `MEMORY.md` 인덱스를 업데이트한다.

**Path 보안 검증** (`memdir/teamMemPaths.ts`, PSR M22186 보안 패치):

| 공격 유형 | 보호 |
|----------|-----|
| Null byte 삽입 | `\0`을 포함하는 path 거부 |
| URL 인코딩 순회 | `%2e%2e%2f` 및 유사 패턴 거부 |
| Unicode 정규화 공격 | 전각 `．．／` 및 유사 변형 거부 |
| 백슬래시 순회 | `\`를 포함하는 path 거부 |
| Symlink 루프 | ELOOP + dangling link 감지 |
| Path 탈출 | realpath를 resolve하여 가장 깊이 존재하는 ancestor의 containment 검증 |

### In-Process Teammates: tmux 없는 팀 협업 (In-Process Teammates: Team Collaboration Without tmux)

tmux/iTerm2 환경이 없을 때, teammates는 `AsyncLocalStorage`로 격리된 동일 프로세스 내에서 실행된다 (`utils/swarm/spawnInProcess.ts`):

```typescript
// AsyncLocalStorage context isolation
type TeammateContext = {
  agentId: string,
  agentName: string,
  teamName: string,
  parentSessionId: string,
  isInProcess: true,
  abortController: AbortController,  // Independent cancellation control
}

runWithTeammateContext<T>(context, fn: () => T): T  // Isolated execution
```

In-Process teammate 작업 상태 (`InProcessTeammateTaskState`)는 다음을 포함한다:

- `pendingUserMessages: string[]` — 메시지 큐 (파일시스템 Mailbox 대체)
- `awaitingPlanApproval: boolean` — Plan 모드에서 Leader 승인 대기 중
- `isIdle: boolean` — idle 상태
- `onIdleCallbacks: Array<() => void>` — idle 시 콜백 (Leader에게 알림)
- `messages: Message[]` — UI 표시 버퍼 (상한 `TEAMMATE_MESSAGES_UI_CAP = 50`)

tmux teammates와의 핵심 차이: 통신은 파일시스템 Mailbox가 아닌 메모리 큐를 통하지만, API는 완전히 일관적이다.

### 패턴 정제: 파일시스템 기반 프로세스 간 협업 (Pattern Distillation: Filesystem-Based Inter-Process Collaboration)

Teams의 통신 설계는 반직관적이지만 실용적인 선택을 한다: **IPC/RPC 대신 파일시스템을 cross-process 통신에 사용**.

| 차원 | Filesystem Mailbox | 전통적 IPC/RPC |
|------|-------------------|--------------------|
| 영속성 | 프로세스 충돌 후에도 메시지 생존 | 연결 끊기면 소실 |
| 디버그 가능성 | 직접 `cat`으로 검사 | 전용 디버그 도구 필요 |
| 동시성 제어 | lockfile | 프로토콜에 내장 |
| Latency | Poll 간격 (밀리초 단위) | 즉시 |
| 크로스 머신 | 공유 파일시스템 필요 | 네이티브 지원 |

Agent Teams 시나리오(초 단위 상호작용, 프로세스 충돌 가능, 인간 디버깅 필요)에서 파일시스템 Mailbox 트레이드오프는 합리적이다 — UDS는 low-latency 시나리오를 커버하는 보완 솔루션으로 활용된다.

---

## 사용자가 할 수 있는 것 (What Users Can Do)

**Teams 시스템을 활용하여 다중 Agent 협업 효율성을 높이기:**

1. **Agent 간 통신의 주소 지정 모드를 파악하라.** `SendMessageTool`은 이름 주소 지정 (`"tester"`), broadcast (`"*"`), UDS 주소 지정 (`"uds:<path>"`)을 지원한다. 이 주소 지정 모드를 이해하면 더 효율적인 다중 Agent 워크플로를 설계하는 데 도움이 된다.

2. **Teams의 백엔드 선택을 이해하라.** tmux나 iTerm2를 사용하면, teammates는 파일시스템 Mailbox를 통해 통신하는 독립적인 터미널 split pane으로 실행된다. 터미널 멀티플렉서가 없으면 in-process 모드로 폴백된다. 이를 알면 teammate 간 통신 문제 디버깅에 도움이 된다.

3. **idle 감지를 활용하여 teammate 상태를 파악하라.** Leader는 Mailbox의 idle 알림을 polling하여 teammate 상태를 감지한다. teammate가 "멈춘" 것처럼 보인다면, `~/.claude/teams/{teamName}/inboxes/` 아래의 mailbox 파일을 확인하면 문제를 찾는 데 도움이 된다.

4. **권한 승인은 Leader에 집중된다.** 모든 teammates의 위험한 작업은 Leader 터미널을 통한 승인이 필요하다. Leader 터미널이 활성 상태를 유지하도록 해야 한다. 그렇지 않으면 teammates가 승인 대기 중에 블로킹된다.
