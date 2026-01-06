# CoTe-Coach (Coding Test Coach)

<div align="center">
  <img src="/public/assets/logo.png" alt="CoTe-Coach Logo" width="200" />
  <br />
  <h3>내 손안의 코딩테스트 코치</h3>
  <a href="https://cote.timeqlife.com/">Live Demo</a>
  <span> | </span>
  <a href="#features">Key Features</a>
</div>

---

## 📝 Introduction (Project Background)

코딩테스트를 준비하면서 **"나에게 딱 맞는 문제는 없을까?", "복습해야 하는데 언제 했는지 기억이 안 나네..."** 라는 고민, 한 번쯤 해보셨나요?

기존의 코딩테스트 학습 환경은 여러 사이트(백준, 프로그래머스, SWEA 등)를 오가며 문제를 찾아야 했고, 자신의 실력에 맞는 문제를 선별하기도 어려웠습니다. 또한, **"풀었던 문제 또 풀기"**가 실력 향상의 지름길임에도 불구하고, 체계적인 복습 일정을 스스로 관리하기란 쉽지 않았습니다.

**CoTe-Coach**는 이러한 문제를 해결하기 위해 탄생했습니다.
흩어진 코딩테스트 학습을 **하나의 플랫폼**으로 통합하여, **사용자 맞춤형 문제 추천**부터 **에빙하우스 망각 곡선 기반의 복습 알림**, 그리고 **학습 동기 부여를 위한 랭킹 및 상점 시스템**까지 제공합니다.

Solved.ac의 티어 시스템을 연동하여 기존의 학습 데이터를 그대로 이어받고, 나만의 캐릭터를 꾸미며 즐겁게 코딩할 수 있는 **Gamified PS(Problem Solving) Platform**입니다.

## 🚀 Demo

|                               **Landing Page**                               |                                **Dashboard**                                |
| :--------------------------------------------------------------------------: | :-------------------------------------------------------------------------: |
| <img src="/public/assets/demo_landing.png" alt="Landing Page" width="400" /> | <img src="/public/assets/demo_dashboard.png" alt="Dashboard" width="400" /> |

> **Experience it live**: [https://cote.timeqlife.com/](https://cote.timeqlife.com/)

## 🛠 Tech Stack

### Frontend

| Tech               | Description & Reason                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**       | 최신 React 기능을 활용하여 컴포넌트 기반의 선언적 UI를 구축했습니다.                                                                                                                                                      |
| **TypeScript**     | 정적 타입 시스템을 도입하여 런타임 에러를 방지하고 개발 생산성을 높였습니다.                                                                                                                                              |
| **Zustand**        | **Why Zustand?** Redux의 복잡한 보일러플레이트 없이, 가볍고 직관적인 Hook 기반의 상태 관리가 가능하여 선택했습니다. 특히 React 19와의 호환성이 뛰어나고, 스토어 분리가 간편하여 유지보수에 유리했습니다.                  |
| **TanStack Query** | **Why TanStack Query?** 단순 `useEffect` 사용 시 발생하는 캐싱, 중복 요청, 리페칭 로직의 복잡성을 해결했습니다. 서버 상태(Server State)와 클라이언트 상태(Client State)를 명확히 분리하여 데이터 동기화를 최적화했습니다. |
| **Recharts**       | **Why Recharts?** React 컴포넌트 기반으로 설계되어 커스터마이징이 용이하고, D3.js 기반의 강력한 데이터 시각화 기능을 제공하여 학습 통계 그래프 구현에 최적이라 판단했습니다.                                              |
| **TailwindCSS**    | 유틸리티 퍼스트 CSS 프레임워크로, 빠른 스타일링과 일관된 디자인 시스템 구축을 위해 사용했습니다.                                                                                                                          |

### Backend & Database

| Tech         | Description & Reason                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase** | **Why Supabase?** 1인 개발자로서 백엔드 인프라 구축 시간을 단축하고 핵심 비즈니스 로직에 집중하기 위해 선택했습니다. Firebase(NoSQL)와 달리 **PostgreSQL(RDBMS)** 기반이라 문제, 사용자, 학습 로그 등 정형화된 데이터의 관계(Relation)를 정의하기 훨씬 수월했습니다. 또한 강력한 Row Level Security(RLS)로 보안을 강화했습니다. |

## 🏗 Architecture

```mermaid
graph TD
    subgraph Client [Client Side (React + Vite)]
        UI[UI Components] --> Store[Zustand Store]
        Store --> Hooks[Custom Hooks]
        Hooks --> RQ[TanStack Query]
    end

    subgraph Server [Supabase (Backend as a Service)]
        Auth[Authentication]
        DB[(PostgreSQL)]
        Edge[Edge Functions]
    end

    subgraph External [External Services]
        SolvedAC[Solved.ac API]
        LeetCode[LeetCode API]
    end

    UI -- User Action --> Store
    RQ -- REST/Realtime --> Server
    Server -- Sync --> DB
    Store -- "Proxy Request" --> SolvedAC
```

## ✨ Key Features

### 1. 🔄 Smart Recommendation Algorithm (Warm-up to Challenge)

- 사용자의 현재 티어(Solved.ac 연동)를 기반으로 **Warm-up(몸풀기) -> Main(적정 난이도) -> Challenge(도전)** 3단계 구성을 제공합니다.
- `seed-based random` 알고리즘을 적용하여 매일 자정이 지나면 새로운 문제 세트가 생성되지만, 하루 동안은 동일한 추천 목록을 유지하여 학습 혼선을 방지했습니다.

### 2. 🧠 Ebbinghaus Review Cycle

- **망각 곡선 이론**을 적용하여 `1일 -> 3일 -> 7일 -> 15일 -> 30일` 주기로 복습 타이밍을 자동으로 계산합니다.
- 복습 결과(성공/실패)에 따라 다음 복습 날짜가 동적으로 조정되거나(Smart Stage Logic), 실패 시 초기화되는 로직을 구현했습니다.

### 3. ⏱️ Integrated Study Environment

- **타이머 기능**: 문제 풀이 시간을 정밀하게 측정하고 기록합니다.
- **학습 기록(Study Log)**: 사용 언어, 체감 난이도, 풀이 방법, 후기 등을 상세히 기록하여 오답 노트로 활용할 수 있습니다.

### 4. 🎮 Gamification & Shop

- 문제를 풀 때마다 **XP(경험치)와 Gold(포인트)**를 획득합니다.
- 획득한 포인트로 상점에서 아바타 아이템을 구매하고 장착할 수 있어 지속적인 학습 동기를 부여합니다.

### 5. 📊 Analytics & Visualizations

- 다양한 그래프(Recharts)를 통해 학습 현황을 한눈에 파악할 수 있습니다.
  - 시간대별 학습 히트맵
  - 언어별 사용 비율 파이 차트
  - 난이도별 해결 문제 막대 그래프

### 6. 📱 Mobile Responsiveness

- 반응형 레이아웃을 적용하여 PC뿐만 아니라 모바일 환경에서도 모든 기능을 쾌적하게 이용할 수 있도록 최적화했습니다.

## 📈 Lessons Learned & Technical Challenges

### 1. 성능 최적화: 초기 로딩 속도 40% 개선 (Optimization)

초기 개발 단계에서 랜딩 페이지 진입 시 로딩이 지연되는 문제를 발견하고, Chrome Lighthouse와 Performance 탭을 통해 원인을 분석했습니다. 불필요한 리렌더링과 무거운 에셋 로딩이 주원인이었습니다.

- **최적화 전**: Total Time 5.4s / LCP 1.89s
- **최적화 후**: Total Time **3.2s (40% 단축)** / LCP **1.11s**

특히, 브라우저의 **Rendering 시간을 775ms → 417ms (약 46% 감소)**, **Painting 시간을 182ms → 120ms (약 34% 감소)** 시키는 성과를 거두었습니다. 단순 수치 개선을 넘어, 저사양 기기나 불안정한 네트워크 환경에서도 일관된 사용자 경험을 제공할 수 있는 **'안정성'**을 확보했습니다.

### 2. 타이머 상태 동기화 및 워터폴 현상 해결 (Troubleshooting)

**문제 상황 Description**:
사용자가 문제 풀이 도중 실수로 브라우저를 새로고침하면 타이머가 초기화되어버리는 UX 문제가 있었습니다. 또한, 사용자 정보를 불러올 때 프로필, 학습 로그, 아이템 목록 등을 순차적으로 호출(Waterfall)하여 로딩 시간이 길어졌습니다.

**해결 과정 Solution**:

1.  **State Rehydration**: `useUserStore`에서 `fetchUserData` 실행 시, DB의 `timer_logs` 중 종료되지 않은(active) 로그를 찾아 클라이언트 상태로 복구(Hydrate)하는 로직을 구현했습니다. 이를 통해 사용자가 재접속해도 타이머가 끊기지 않고 이어지도록 했습니다.
2.  **Promise.all 병렬 처리**: 서로 의존성이 없는 데이터(프로필, 로그, 에셋, 타이머) 호출을 `Promise.all`로 묶어 병렬 처리했습니다. 이를 통해 데이터 페칭에 소요되는 시간을 가장 오래 걸리는 요청 1개의 시간으로 단축시켰습니다.

### 3. 멀티 플랫폼 난이도 정규화 (Engineering)

백준, 프로그래머스, SWEA, LeetCode 등 각기 다른 난이도 체계를 가진 플랫폼들을 하나의 기준으로 통합해야 했습니다. 이를 위해 내부적으로 **'Universal Level'** 매핑 테이블을 설계하여, 추천 엔진이 플랫폼에 구애받지 않고 일관된 난이도의 문제를 선별할 수 있도록 알고리즘을 구현했습니다.

## 💻 Setup (Local Execution)

```bash
# 1. Clone the repository
git clone https://github.com/Yoonyesol/CoTe-Coach.git

# 2. Install dependencies
npm install

# 3. Set Environment Variables
# Create a .env file and add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Run the development server
npm run dev
```
