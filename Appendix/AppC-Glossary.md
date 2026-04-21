# Appendix C: 용어집 (Glossary)

이 부록은 책 전반에 걸쳐 등장하는 기술 용어를 영문 알파벳순으로 정리한 것이다.

| Term | Definition | First Seen |
|------|-----------|-----------|
| Agent Loop | AI Agent의 핵심 실행 루프: 입력 수신 -> 모델 호출 -> Tool 실행 -> 계속 여부 결정 | Chapter 3 |
| AST (Abstract Syntax Tree) | 소스 코드의 의미적 관계를 보존하는 트리 구조 표현 (단순 텍스트가 아닌) | Chapter 28 |
| Cache Break | 콘텐츠 변경으로 인해 Prompt Cache prefix가 무효화되는 이벤트 | Chapter 14 |
| Circuit Breaker | 자동화된 프로세스가 N회 연속 실패 후 강제로 중단되어 안전한 상태로 전환되는 패턴 | Chapters 9, 26 |
| Compaction | Context window 공간을 확보하기 위해 대화 이력을 요약하는 것 | Chapter 9 |
| DCE (Dead Code Elimination) | Bun의 `feature()` 함수가 게이트된 코드의 컴파일 타임 제거를 가능하게 하는 것 | Chapter 1 |
| Defensive Git | 명시적 안전 규칙을 통해 AI가 실행하는 Git 작업 중 데이터 손실을 방지하는 패턴 | Chapter 27 |
| Dynamic Boundary | System prompt에서 정적 캐시 가능 콘텐츠와 동적 세션 콘텐츠를 구분하는 마커 | Chapter 5 |
| Fail-Closed | 시스템이 기본적으로 가장 안전한 옵션을 취하며, 위험한 작업을 허용하려면 명시적 선언이 필요한 방식 | Chapters 2, 25 |
| Feature Flag (tengu_*) | GrowthBook을 통해 런타임에 설정되는 실험 게이트로, 기능의 활성화/비활성화를 제어한다 | Chapters 1, 23 |
| Graduated Autonomy | 수동 확인부터 완전 자동화까지 다단계 Permission 모드를 제공하며, 각 단계마다 안전한 fallback을 갖추는 것 | Chapter 27 |
| Harness Engineering | Prompt, Tool, 설정을 통해 AI 모델의 행동을 가이드하는 실천 방법 (코드 로직이 아닌) | Chapter 1 |
| Hooks | 특정 이벤트(예: Tool 호출 전/후)에서 실행되는 사용자 정의 셸 명령 | Chapter 18 |
| Latch | 한번 진입하면 안정적으로 유지되는 세션 수준 상태로, Cache 진동이나 동작 떨림을 방지한다 | Chapters 13, 25 |
| MCP (Model Context Protocol) | AI 모델과 외부 Tool/데이터 소스 간의 상호작용을 표준화하는 프로토콜 | Chapter 22 |
| Microcompact | 전체 대화를 Compaction하는 대신, 특정 Tool 결과만 정밀하게 제거하여 Cache prefix를 안정적으로 유지하는 것 | Chapter 11 |
| Outline | 책의 목차 구조와 Chapter 주제를 개괄하는 문서 | Preface |
| Partition | `isConcurrencySafe` 속성을 기반으로 Tool 호출을 병렬 처리 가능 배치와 직렬 처리 필수 배치로 분할하는 것 | Chapter 4 |
| Pattern Extraction | 소스 코드 분석에서 재사용 가능한 설계 패턴(이름, 문제, 해결책 포함)을 추출하는 것 | Throughout |
| Post-Compact Restore | Compaction 완료 후 가장 중요한 파일 내용과 Skill 정보를 선택적으로 복원하는 것 | Chapter 10 |
| Prompt Cache | 메시지 prefix를 캐싱하여 중복 Token 처리를 줄이는 Anthropic API 기능 | Chapter 13 |
| Skill | SkillTool을 통해 대화 context에 주입되는 호출 가능한 Prompt 템플릿 | Chapter 22 |
| Token Budget | Context window 내 다양한 유형의 콘텐츠에 할당되는 Token 사용 한도 | Chapters 12, 26 |
| Tool Schema | Tool의 JSON Schema 정의로, 이름, 설명, 입력 파라미터 형식을 포함한다 | Chapter 2 |
| YOLO Classifier | auto 모드에서 Permission 승인/거부 결정을 내리기 위해 사용되는 보조 Claude API 호출 | Chapter 17 |
