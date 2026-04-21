# Harness Engineering: From Claude Code Internals to AI Coding Best Practices (한국어 번역)

> Claude Code의 내부 구조에서 AI 코딩 모범 사례까지

이 저장소는 [**Harness Engineering: From Claude Code Internals to AI Coding Best Practices**](https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/en/preface.html)의 한국어 번역본이다.

원본 저장소: [ZhangHanDong/harness-engineering-from-cc-to-ai-coding](https://github.com/ZhangHanDong/harness-engineering-from-cc-to-ai-coding) (MIT License)

---

## 이 책에 대하여

이 책은 Anthropic의 AI 코딩 에이전트 **Claude Code**의 소스 코드를 체계적으로 분석하여, AI Agent 시스템의 핵심 엔지니어링 패턴을 추출한 기술서다. Agent Loop, Tool Orchestration, Prompt Engineering, Context Management, Prompt Caching, Safety System 등 Claude Code를 구성하는 핵심 서브시스템을 소스 코드 수준에서 해부하고, 이로부터 자신만의 AI Agent를 구축하기 위한 실용적 교훈을 도출한다.

---

## 목차

### [Preface](preface.md)

### Part I: Architecture — How Claude Code Works
| Chapter | 제목 |
|---------|------|
| [Ch01](Part1-Architecture/Ch01-TechStack.md) | The Full Tech Stack of an AI Coding Agent |
| [Ch02](Part1-Architecture/Ch02-ToolSystem.md) | Tool System — 40+ Tools as the Model's Hands |
| [Ch03](Part1-Architecture/Ch03-AgentLoop.md) | Agent Loop — The Full Lifecycle from User Input to Model Response |
| [Ch04](Part1-Architecture/Ch04-ToolExecutionOrchestration.md) | Tool Execution Orchestration — Permissions, Concurrency, Streaming, and Interrupts |
| [Ch04b](Part1-Architecture/Ch04b-PlanMode.md) | Plan Mode — From "Act First, Ask Later" to "Look Before You Leap" |

### Part II: Prompt Engineering — System Prompts as the Control Plane
| Chapter | 제목 |
|---------|------|
| [Ch05](Part2-PromptEngineering/Ch05-SystemPromptArchitecture.md) | System Prompt Architecture |
| [Ch06](Part2-PromptEngineering/Ch06-SteeringBehaviorThroughPrompts.md) | Steering Behavior Through Prompts |
| [Ch06b](Part2-PromptEngineering/Ch06b-APICommunicationLayer.md) | API Communication Layer — Retry, Streaming, and Degradation Engineering |
| [Ch07](Part2-PromptEngineering/Ch07-ModelSpecificTuning.md) | Model-Specific Tuning and A/B Testing |
| [Ch08](Part2-PromptEngineering/Ch08-ToolPromptsAsMicroHarnesses.md) | Tool Prompts as Micro-Harnesses |

### Part III: Context Management — The 200K Token Arena
| Chapter | 제목 |
|---------|------|
| [Ch09](Part3-ContextManagement/Ch09-AutomaticCompaction.md) | Auto-Compaction — When and How Context Gets Compressed |
| [Ch10](Part3-ContextManagement/Ch10-FileStatePreservation.md) | File State Preservation After Compaction |
| [Ch11](Part3-ContextManagement/Ch11-MicroCompaction.md) | Micro-Compaction — Precise Context Pruning |
| [Ch12](Part3-ContextManagement/Ch12-TokenBudgeting.md) | Token Budgeting Strategies |

### Part IV: Prompt Caching — The Hidden Cost Optimizer
| Chapter | 제목 |
|---------|------|
| [Ch13](Part4-PromptCaching/Ch13-CacheArchitecture.md) | Cache Architecture and Breakpoint Design |
| [Ch14](Part4-PromptCaching/Ch14-CacheBreakDetection.md) | Cache Break Detection System |
| [Ch15](Part4-PromptCaching/Ch15-CacheOptimizationPatterns.md) | Cache Optimization Patterns |

### Part V: Safety and Permissions — Defense in Depth
| Chapter | 제목 |
|---------|------|
| [Ch16](Part5-SafetyAndPermissions/Ch16-PermissionSystem.md) | Permission System |
| [Ch17](Part5-SafetyAndPermissions/Ch17-YOLOClassifier.md) | YOLO Classifier |
| [Ch17b](Part5-SafetyAndPermissions/Ch17b-PromptInjectionDefense.md) | Prompt Injection Defense — From Unicode Sanitization to Defense in Depth |
| [Ch18](Part5-SafetyAndPermissions/Ch18-Hooks.md) | Hooks — User-Defined Interception Points |
| [Ch18b](Part5-SafetyAndPermissions/Ch18b-SandboxSystem.md) | Sandbox System — Multi-Platform Isolation from Seatbelt to Bubblewrap |
| [Ch19](Part5-SafetyAndPermissions/Ch19-ClaudeMd.md) | CLAUDE.md — User Instructions as an Override Layer |

### Part VI: Advanced Subsystems
| Chapter | 제목 |
|---------|------|
| [Ch20](Part6-AdvancedSubsystems/Ch20-AgentSpawning.md) | Agent Spawning and Orchestration |
| [Ch20b](Part6-AdvancedSubsystems/Ch20b-TeamsAndMultiProcess.md) | Teams and Multi-Process Collaboration |
| [Ch20c](Part6-AdvancedSubsystems/Ch20c-Ultraplan.md) | Ultraplan — Remote Multi-Agent Planning |
| [Ch21](Part6-AdvancedSubsystems/Ch21-EffortFastModeThinking.md) | Effort, Fast Mode, and Thinking |
| [Ch22](Part6-AdvancedSubsystems/Ch22-SkillsSystem.md) | Skills System — From Built-In to User-Defined |
| [Ch22b](Part6-AdvancedSubsystems/Ch22b-PluginSystem.md) | Plugin System — From Packaging to Marketplace Extension Engineering |
| [Ch23](Part6-AdvancedSubsystems/Ch23-UnreleasedFeaturePipeline.md) | The Unreleased Feature Pipeline — The Roadmap Behind 89 Feature Flags |
| [Ch24](Part6-AdvancedSubsystems/Ch24-CrossSessionMemory.md) | Cross-Session Memory — From Forgetfulness to Persistent Learning |

### Part VII: Lessons for AI Agent Builders
| Chapter | 제목 |
|---------|------|
| [Ch25](Part7-Lessons/Ch25-HarnessEngineeringPrinciples.md) | Harness Engineering Principles |
| [Ch26](Part7-Lessons/Ch26-ContextManagement.md) | Context Management as a Core Capability |
| [Ch27](Part7-Lessons/Ch27-ProductionGradePatterns.md) | Production-Grade AI Coding Patterns |
| [Ch28](Part7-Lessons/Ch28-WhereClaudeCodeFallsShort.md) | Where Claude Code Falls Short |
| [Ch29](Part7-Lessons/Ch29-ObservabilityEngineering.md) | Observability Engineering — From logEvent to Production-Grade Telemetry |
| [Ch30](Part7-Lessons/Ch30-BuildYourOwnAgent.md) | Build Your Own AI Agent — From Claude Code Patterns to Practice |

### Appendix
| Appendix | 제목 |
|----------|------|
| [App A](Appendix/AppA-KeyFileIndex.md) | Key File Index |
| [App B](Appendix/AppB-EnvironmentVariables.md) | Environment Variables |
| [App C](Appendix/AppC-Glossary.md) | Glossary |
| [App D](Appendix/AppD-FeatureFlags.md) | Feature Flags |
| [App E](Appendix/AppE-VersionEvolution.md) | Version Evolution |
| [App F](Appendix/AppF-E2ETraces.md) | E2E Traces |
| [App G](Appendix/AppG-AuthSubscription.md) | Auth & Subscription |

---

## 번역 원칙

- **문체**: 평어체(해라체) 통일 — 기술서 톤 유지
- **IT 전문 용어**: 원문 그대로 유지 (Agent Loop, Prompt Cache, Tool Orchestration 등)
- **코드/경로/URL**: 절대 번역하지 않음
- **섹션 제목**: "한글 (영문)" 병기
- **Chapter/Part 번호**: 영문 그대로 유지 (Chapter 3, Part 1)

---

## 원본 정보

- **원본**: [Harness Engineering: From Claude Code Internals to AI Coding Best Practices](https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/en/preface.html)
- **원본 저장소**: [ZhangHanDong/harness-engineering-from-cc-to-ai-coding](https://github.com/ZhangHanDong/harness-engineering-from-cc-to-ai-coding)
- **원저자**: Alex (ZhangHanDong)
- **라이선스**: MIT License

---

## License

이 번역본은 원본과 동일한 [MIT License](LICENSE)를 따른다.
