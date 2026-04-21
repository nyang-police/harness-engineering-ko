# Appendix G: 인증 및 구독 시스템 (Authentication & Subscription System) — OAuth에서 Compliance 경계까지

> 이 부록은 Claude Code v2.1.88의 소스 코드를 기반으로 인증 아키텍처와 구독 시스템을 분석하고, Anthropic의 2026년 4월 third-party 도구 금지 조치 맥락에서 Agent를 구축하는 개발자들의 compliance 경계를 검토한다.

## G.1 이중 트랙 OAuth 인증 아키텍처 (Dual-Track OAuth Authentication Architecture)

Claude Code는 두 가지 사용자 그룹을 위해 명확히 다른 두 가지 인증 경로를 지원한다.

### G.1.1 Claude.ai 구독 사용자 (Claude.ai Subscription Users)

구독 사용자(Pro/Max/Team/Enterprise)는 Claude.ai의 OAuth endpoint를 통해 인증한다:

```
User → claude login → claude.com/cai/oauth/authorize
  → Authorization page (PKCE flow)
  → Callback → exchangeCodeForTokens()
  → OAuth access_token + refresh_token
  → Use token directly to call Anthropic API (no API key needed)
```

```typescript
// restored-src/src/constants/oauth.ts:18-20
const CLAUDE_AI_INFERENCE_SCOPE = 'user:inference'
const CLAUDE_AI_PROFILE_SCOPE = 'user:profile'
```

주요 scope:
- `user:inference` — 모델 호출 권한
- `user:profile` — 계정 정보 읽기
- `user:sessions` — 세션 관리
- `user:mcp` — MCP server 접근
- `user:file_upload` — 파일 업로드

OAuth 구성 (`restored-src/src/constants/oauth.ts:60-234`):

| 구성 항목 | Production 값 |
|-----------|--------------|
| Authorization URL | `https://claude.com/cai/oauth/authorize` |
| Token URL | `https://platform.claude.com/v1/oauth/token` |
| Client ID | `9d1c250a-e61b-44d9-88ed-5944d1962f5e` |
| PKCE | Required (S256) |

### G.1.2 Console API 사용자 (Console API Users)

Console 사용자(종량제)는 Anthropic 개발자 플랫폼을 통해 인증한다:

```
User → claude login → platform.claude.com/oauth/authorize
  → Authorization (scope: org:create_api_key)
  → Callback → exchangeCodeForTokens()
  → OAuth token → createAndStoreApiKey()
  → Generate temporary API key → Use key to call API
```

차이점: Console 사용자는 추가 단계가 있다 — OAuth 이후 API key가 생성되며, 실제 API 호출은 token 기반 인증이 아닌 key 기반 인증을 사용한다.

### G.1.3 Third-Party Provider

Anthropic 자체 인증 외에도 Claude Code는 다음을 지원한다:

| Provider | 환경 변수 | 인증 방식 |
|----------|----------|----------|
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` | AWS credential chain |
| GCP Vertex AI | `CLAUDE_CODE_USE_VERTEX=1` | GCP credentials |
| Azure Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` | Azure credentials |
| Direct API key | `ANTHROPIC_API_KEY=sk-...` | Direct passthrough |
| API Key Helper | `apiKeyHelper` config | Custom command |

```typescript
// restored-src/src/utils/auth.ts:208-212
type ApiKeySource =
  | 'ANTHROPIC_API_KEY'     // Environment variable
  | 'apiKeyHelper'          // Custom command
  | '/login managed key'    // OAuth-generated key
  | 'none'                  // No authentication
```

## G.2 구독 등급 및 Rate Limit (Subscription Tiers and Rate Limits)

### G.2.1 4단계 구독 (Four-Tier Subscriptions)

소스 코드의 구독 감지 함수(`restored-src/src/utils/auth.ts:1662-1711`)는 완전한 등급 계층을 드러낸다:

| 등급 | Organization Type | Rate Multiplier | 월 가격 |
|-----|------------------|-----------------|---------|
| **Pro** | `claude_pro` | 1x | $20 |
| **Max** | `claude_max` | 5x or 20x | $100 / $200 |
| **Team** | `claude_team` | 5x (Premium) | Per seat |
| **Enterprise** | `claude_enterprise` | Custom | By contract |

```typescript
// restored-src/src/utils/auth.ts:1662-1711
function getSubscriptionType(): 'max' | 'pro' | 'team' | 'enterprise' | null
function isMaxSubscriber(): boolean
function isTeamPremiumSubscriber(): boolean  // Team with 5x rate limit
function getRateLimitTier(): string  // e.g., 'default_claude_max_20x'
```

### G.2.2 Rate Limit 등급 (Rate Limit Tiers)

`getRateLimitTier()`가 반환하는 값은 API 호출 빈도 상한에 직접 영향을 준다:

- `default_claude_max_20x` — Max 최상위 등급, 기본 rate의 20배
- `default_claude_max_5x` — Max 표준 등급 / Team Premium
- Default — Pro 및 일반 Team

### G.2.3 Extra Usage

특정 작업은 추가 과금을 발생시킨다 (`restored-src/src/utils/extraUsage.ts:4-24`):

```typescript
function isBilledAsExtraUsage(): boolean {
  // The following cases trigger Extra Usage billing:
  // 1. Claude.ai subscription users using Fast Mode
  // 2. Using 1M context window models (Opus 4.6, Sonnet 4.6)
}
```

지원되는 과금 유형:
- `stripe_subscription` — 표준 Stripe 구독
- `stripe_subscription_contracted` — 계약 기반
- `apple_subscription` — Apple IAP
- `google_play_subscription` — Google Play

## G.3 Token 관리 및 보안 저장 (Token Management and Secure Storage)

### G.3.1 Token 생명주기 (Token Lifecycle)

```
Obtain token → Store in macOS Keychain → Read from Keychain when needed
  → Auto-refresh 5 minutes before expiry → Retry on refresh failure (up to 3 times)
  → All retries fail → Prompt user to re-login
```

핵심 구현 (`restored-src/src/utils/auth.ts`):

```typescript
// Expiry check: 5-minute buffer
function isOAuthTokenExpired(token): boolean {
  return token.expires_at < Date.now() + 5 * 60 * 1000
}

// Auto-refresh
async function checkAndRefreshOAuthTokenIfNeeded() {
  // Token refresh with retry logic
  // Clears cache on failure, re-fetches on next call
}
```

### G.3.2 보안 저장 (Secure Storage)

- **macOS**: Keychain Services (암호화 저장)
- **Linux**: libsecret / filesystem fallback
- **Subprocess 전달**: File Descriptor(`CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR`)를 통해 전달하여 환경 변수 유출을 방지
- **API Key Helper**: key 획득을 위한 custom command를 지원하며, 기본 5분 cache TTL을 갖는다

### G.3.3 로그아웃 정리 (Logout Cleanup)

`performLogout()` (`restored-src/src/commands/logout/logout.tsx:16-48`)는 완전한 정리를 수행한다:

1. telemetry 데이터 flush (손실 방지)
2. API key 제거
3. Keychain에서 모든 credential 삭제
4. 설정에서 OAuth 계정 정보 제거
5. 선택적: onboarding 상태 초기화
6. 모든 cache 무효화: OAuth token, 사용자 데이터, beta feature, GrowthBook, policy limit

## G.4 권한 및 역할 (Permissions and Roles)

OAuth profile이 반환하는 조직 역할이 사용자의 기능 경계를 결정한다:

```typescript
// restored-src/src/utils/billing.ts
// Console billing access
function hasConsoleBillingAccess(): boolean {
  // Requires: non-subscription user + admin or billing role
}

// Claude.ai billing access
function hasClaudeAiBillingAccess(): boolean {
  // Max/Pro automatically have access
  // Team/Enterprise require admin, billing, owner, or primary_owner
}
```

| 기능 | 필요 역할 |
|-----|----------|
| Console billing 접근 | admin 또는 billing (비구독 사용자) |
| Claude.ai billing 접근 | Max/Pro 자동 허용; Team/Enterprise는 admin/billing/owner 필요 |
| Extra usage 토글 | Claude.ai 구독 + 지원되는 billingType |
| `/upgrade` 명령 | Max 20x가 아닌 사용자 |

## G.5 Telemetry 및 계정 추적 (Telemetry and Account Tracking)

인증 시스템은 telemetry와 깊이 통합되어 있다 (`restored-src/src/services/analytics/metadata.ts`):

- `isClaudeAiAuth` — Claude.ai 인증 사용 여부
- `subscriptionType` — 등급별 DAU 분석에 사용
- `accountUuid` / `emailAddress` — telemetry header에 전달

주요 analytics event:
```
tengu_oauth_flow_start          → OAuth flow 시작
tengu_oauth_success             → OAuth 성공
tengu_oauth_token_refresh_success/failure → Token refresh 결과
tengu_oauth_profile_fetch_success → Profile fetch 성공
```

## G.6 Compliance 경계 분석 (Compliance Boundary Analysis)

### G.6.1 배경: 2026년 4월 OpenClaw 사건 (Background: The April 2026 OpenClaw Incident)

2026년 4월, Anthropic은 third-party 도구가 구독 quota를 OAuth를 통해 사용하는 것을 공식적으로 금지했다. 핵심 이유는 다음과 같다:

1. **지속 불가능한 비용**: OpenClaw 같은 도구가 24/7 자동화된 Agent를 실행하여 일일 $1,000-5,000의 API 비용을 소비했다 — 이는 $200/월 Max 구독이 감당할 수 있는 수준을 훨씬 초과한다
2. **Cache 최적화 우회**: Claude Code의 4계층 Prompt Cache(Chapter 13-14 참조)는 비용을 90%까지 줄일 수 있다; third-party 도구가 API를 직접 호출하면 100% cache miss가 발생한다
3. **약관 수정**: OAuth `user:inference` scope가 공식 제품 사용으로만 제한되었다

### G.6.2 행위 분류 (Behavior Classification)

| 행위 | 기술적 구현 | 위험 수준 |
|-----|-----------|----------|
| Claude Code CLI 수동 사용 | 대화형 `claude` 명령 | **안전** — 공식 제품의 의도된 사용 |
| 스크립트화된 `claude -p` 호출 | Shell script 자동화 | **안전** — 공식 지원되는 non-interactive 모드 |
| cc-sdk가 claude subprocess 실행 | `cc_sdk::query()` / `cc_sdk::llm::query()` | **낮은 위험** — 전체 CLI pipeline을 통과 (cache 포함) |
| Claude Code가 호출하는 MCP Server | rmcp / MCP protocol | **안전** — 공식 확장 메커니즘 |
| Agent SDK로 개인 도구 구축 | `@anthropic-ai/claude-code` SDK | **안전** — 공식 SDK의 의도된 사용 |
| OAuth token을 추출하여 API 직접 호출 | Claude Code CLI 우회 | **고위험** — 이것이 금지된 행위다 |
| CI/CD 자동화 | CI에서 `claude -p` | **회색 지대** — 빈도와 사용 패턴에 따라 다름 |
| claude에 의존하는 오픈소스 도구 배포 | 사용자가 직접 인증 | **회색 지대** — 사용 패턴에 따라 다름 |
| 24/7 자동화 daemon | 지속적인 구독 quota 소비 | **고위험** — OpenClaw 패턴 |

### G.6.3 핵심 구분: Claude Code 인프라를 통과하는가 (The Key Distinction: Whether You Go Through Claude Code's Infrastructure)

이것이 가장 중요한 기준이다:

```
Safe path:
  Your code → cc-sdk → claude CLI subprocess → CC infrastructure (with cache) → API
  ↑ Goes through prompt cache, Anthropic's costs stay manageable

Dangerous path:
  Your code → Extract OAuth token → Call Anthropic API directly
  ↑ Bypasses prompt cache, every request is full price
```

Claude Code의 `getCacheControl()` 함수(`restored-src/src/services/api/claude.ts:358-374`)는 global, organization, session의 3단계 cache breakpoint를 정교하게 설계한다. CLI를 통해 전송된 요청은 자동으로 이 cache 최적화의 혜택을 받는다. API를 직접 호출하는 third-party 도구는 이러한 cache를 재사용할 수 없다 — 이것이 비용 문제의 근본 원인이다.

**빠른 확인: `claude` subprocess를 생성하는가?**

이것이 가장 단순한 compliance 기준이다. `claude` CLI subprocess를 통해 통신하는 모든 접근 방식은 CC의 전체 인프라(Prompt Cache + telemetry + 권한 검사)를 통과하여 Anthropic의 비용을 관리 가능한 수준으로 유지한다; API를 직접 호출하면 모든 것을 우회한다.

| 접근 방식 | 프로세스 생성? | 준수 여부 |
|----------|:---:|----------|
| cc-sdk `query()` | Yes — `Command::new("claude")` | 준수 |
| cc-sdk `llm::query()` | Yes — 동일, `--tools ""` 추가 | 준수 |
| Agent SDK (`@anthropic-ai/claude-code`) | Yes — 공식 SDK가 claude를 생성 | 준수 |
| `claude -p "..."` Shell script | Yes | 준수 |
| Claude Code가 호출하는 MCP Server | Yes — CC가 시작 | 준수 |
| OAuth token 추출 -> `fetch("api.anthropic.com")` | **No** — CLI 우회 | **비준수** |
| OpenClaw 및 기타 third-party Agent | **No** — API 직접 호출 | **비준수** |

### G.6.4 이 책의 예제 코드 Compliance (Compliance of This Book's Example Code)

이 책의 Chapter 30에 나오는 Code Review Agent는 다음 접근 방식을 사용한다:

| Backend | 구현 | Compliance |
|---------|-----|-----------|
| `CcSdkBackend` | cc-sdk가 claude CLI subprocess 실행 | **준수** — 공식 CLI를 통과 |
| `CcSdkWsBackend` | CC 인스턴스에 WebSocket 연결 | **준수** — 공식 protocol을 통과 |
| `CodexBackend` | Codex 구독 (OpenAI, Anthropic 아님) | **해당 없음** — Anthropic과 무관 |
| MCP Server 모드 | Claude Code가 MCP를 통해 호출 | **준수** — 공식 확장 메커니즘 |

**권장 사항**:
1. `~/.claude/`에서 OAuth token을 추출하여 다른 용도로 사용하지 말 것
2. 24/7 자동화 daemon을 구축하지 말 것
3. Anthropic 구독에 의존하지 않는 대안으로 `CodexBackend`를 유지할 것
4. 고빈도 자동화가 필요하다면 구독 대신 API key 종량제 과금을 사용할 것

## G.7 주요 환경 변수 인덱스 (Key Environment Variable Index)

| 변수 | 용도 | 출처 |
|-----|-----|-----|
| `ANTHROPIC_API_KEY` | 직접 API key | 사용자 설정 |
| `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | 사전 인증된 refresh token | 자동화 배포 |
| `CLAUDE_CODE_OAUTH_SCOPES` | Refresh token의 scope | 위 변수와 함께 사용 |
| `CLAUDE_CODE_ACCOUNT_UUID` | 계정 UUID (SDK 호출자용) | SDK 통합 |
| `CLAUDE_CODE_USER_EMAIL` | 사용자 이메일 (SDK 호출자용) | SDK 통합 |
| `CLAUDE_CODE_ORGANIZATION_UUID` | Organization UUID | SDK 통합 |
| `CLAUDE_CODE_USE_BEDROCK` | AWS Bedrock 활성화 | Third-party 통합 |
| `CLAUDE_CODE_USE_VERTEX` | GCP Vertex AI 활성화 | Third-party 통합 |
| `CLAUDE_CODE_USE_FOUNDRY` | Azure Foundry 활성화 | Third-party 통합 |
| `CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR` | API key용 file descriptor | 보안 전달 |
| `CLAUDE_CODE_CUSTOM_OAUTH_URL` | Custom OAuth endpoint | FedStart 배포 |
