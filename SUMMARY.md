# Summary

[Preface](preface.md)

---

# Part I: Architecture — How Claude Code Works

- [Ch01. The Full Tech Stack of an AI Coding Agent](Part1-Architecture/Ch01-TechStack.md)
- [Ch02. Tool System — 40+ Tools as the Model's Hands](Part1-Architecture/Ch02-ToolSystem.md)
- [Ch03. Agent Loop — The Full Lifecycle](Part1-Architecture/Ch03-AgentLoop.md)
- [Ch04. Tool Execution Orchestration](Part1-Architecture/Ch04-ToolExecutionOrchestration.md)
- [Ch04b. Plan Mode](Part1-Architecture/Ch04b-PlanMode.md)

# Part II: Prompt Engineering — System Prompts as the Control Plane

- [Ch05. System Prompt Architecture](Part2-PromptEngineering/Ch05-SystemPromptArchitecture.md)
- [Ch06. Steering Behavior Through Prompts](Part2-PromptEngineering/Ch06-SteeringBehaviorThroughPrompts.md)
- [Ch06b. API Communication Layer](Part2-PromptEngineering/Ch06b-APICommunicationLayer.md)
- [Ch07. Model-Specific Tuning and A/B Testing](Part2-PromptEngineering/Ch07-ModelSpecificTuning.md)
- [Ch08. Tool Prompts as Micro-Harnesses](Part2-PromptEngineering/Ch08-ToolPromptsAsMicroHarnesses.md)

# Part III: Context Management — The 200K Token Arena

- [Ch09. Auto-Compaction](Part3-ContextManagement/Ch09-AutomaticCompaction.md)
- [Ch10. File State Preservation After Compaction](Part3-ContextManagement/Ch10-FileStatePreservation.md)
- [Ch11. Micro-Compaction](Part3-ContextManagement/Ch11-MicroCompaction.md)
- [Ch12. Token Budgeting Strategies](Part3-ContextManagement/Ch12-TokenBudgeting.md)

# Part IV: Prompt Caching — The Hidden Cost Optimizer

- [Ch13. Cache Architecture and Breakpoint Design](Part4-PromptCaching/Ch13-CacheArchitecture.md)
- [Ch14. Cache Break Detection System](Part4-PromptCaching/Ch14-CacheBreakDetection.md)
- [Ch15. Cache Optimization Patterns](Part4-PromptCaching/Ch15-CacheOptimizationPatterns.md)

# Part V: Safety and Permissions — Defense in Depth

- [Ch16. Permission System](Part5-SafetyAndPermissions/Ch16-PermissionSystem.md)
- [Ch17. YOLO Classifier](Part5-SafetyAndPermissions/Ch17-YOLOClassifier.md)
- [Ch17b. Prompt Injection Defense](Part5-SafetyAndPermissions/Ch17b-PromptInjectionDefense.md)
- [Ch18. Hooks](Part5-SafetyAndPermissions/Ch18-Hooks.md)
- [Ch18b. Sandbox System](Part5-SafetyAndPermissions/Ch18b-SandboxSystem.md)
- [Ch19. CLAUDE.md](Part5-SafetyAndPermissions/Ch19-ClaudeMd.md)

# Part VI: Advanced Subsystems

- [Ch20. Agent Spawning and Orchestration](Part6-AdvancedSubsystems/Ch20-AgentSpawning.md)
- [Ch20b. Teams and Multi-Process Collaboration](Part6-AdvancedSubsystems/Ch20b-TeamsAndMultiProcess.md)
- [Ch20c. Ultraplan](Part6-AdvancedSubsystems/Ch20c-Ultraplan.md)
- [Ch21. Effort, Fast Mode, and Thinking](Part6-AdvancedSubsystems/Ch21-EffortFastModeThinking.md)
- [Ch22. Skills System](Part6-AdvancedSubsystems/Ch22-SkillsSystem.md)
- [Ch22b. Plugin System](Part6-AdvancedSubsystems/Ch22b-PluginSystem.md)
- [Ch23. The Unreleased Feature Pipeline](Part6-AdvancedSubsystems/Ch23-UnreleasedFeaturePipeline.md)
- [Ch24. Cross-Session Memory](Part6-AdvancedSubsystems/Ch24-CrossSessionMemory.md)

# Part VII: Lessons for AI Agent Builders

- [Ch25. Harness Engineering Principles](Part7-Lessons/Ch25-HarnessEngineeringPrinciples.md)
- [Ch26. Context Management as a Core Capability](Part7-Lessons/Ch26-ContextManagement.md)
- [Ch27. Production-Grade AI Coding Patterns](Part7-Lessons/Ch27-ProductionGradePatterns.md)
- [Ch28. Where Claude Code Falls Short](Part7-Lessons/Ch28-WhereClaudeCodeFallsShort.md)
- [Ch29. Observability Engineering](Part7-Lessons/Ch29-ObservabilityEngineering.md)
- [Ch30. Build Your Own AI Agent](Part7-Lessons/Ch30-BuildYourOwnAgent.md)

---

# Appendix

- [App A. Key File Index](Appendix/AppA-KeyFileIndex.md)
- [App B. Environment Variables](Appendix/AppB-EnvironmentVariables.md)
- [App C. Glossary](Appendix/AppC-Glossary.md)
- [App D. Feature Flags](Appendix/AppD-FeatureFlags.md)
- [App E. Version Evolution](Appendix/AppE-VersionEvolution.md)
- [App F. E2E Traces](Appendix/AppF-E2ETraces.md)
- [App G. Auth & Subscription](Appendix/AppG-AuthSubscription.md)
