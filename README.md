# 💬 Fask: AI 회의록 및 태스크 관리 채팅 툴
> **AI 대화 내용 분석을 통한 요약본 및 칸반 보드 자동 생성을 목표로 하는 실시간 협업 워크스페이스**

![Generic badge](https://img.shields.io/badge/Project-Team-blue.svg) ![Generic badge](https://img.shields.io/badge/Status-In%20Progress-yellow.svg)

## 📅 프로젝트 개요
* **개발 기간:** 2026.03.14 ~ 2026.MM.DD (N주)
* **참여 인원:** 4인 (Backend 2, Frontend 2)
* **비고:** 개발 진행 중인 프로젝트로, 아래 내용은 초안이며 진행 상황에 따라 업데이트됩니다.

---

## 📝 한 줄 요약
**"회의는 짧게, 실행은 확실하게"**<br>
팀 대화(회의) 내용을 AI가 분석해 자동으로 요약본과 칸반 보드를 생성해주는 **실시간 협업 채팅 & 태스크 관리 툴**입니다.

---

## 📸 주요 화면 미리보기 (Preview)
**실시간 채팅, AI 회의록 요약, 칸반 보드 화면입니다.**

| **실시간 채팅** |
| :---: |
| <img src="https://github.com/user-attachments/assets/45ee2e8e-d10d-47e6-9dcc-1769d9b15d6e" width="700" alt="실시간 채팅" /> |

| **AI 회의록 요약** |
| :---: |
| <img src="https://github.com/user-attachments/assets/c85bf5b5-b9b7-4b9c-94f1-0316a37eaae4" width="700" alt="AI 회의록 요약" /> |

| **칸반 보드** |
| :---: |
| <img src="https://github.com/user-attachments/assets/b195ae0a-c3bf-4f51-8432-bf487434d58f" width="700" alt="칸반 보드" /> |

---

## 🚀 기획 배경 및 목표
**Fask**는 팀 프로젝트나 협업 과정에서 반복되는 "회의는 했는데 정리가 안 되고, 정리는 됐는데 태스크로 이어지지 않는" 문제를 해결하기 위해 기획되었습니다.

### 1. 문제점
* **회의록 정리 부담:** 회의 내용을 별도로 정리하는 데 시간과 인력이 소모됨.
* **협업 툴 분산:** 채팅, 회의록, 태스크 관리 툴이 따로 놀아 정보가 여러 곳에 흩어짐.

### 2. 해결책
* **AI 기반 자동 요약:** 실시간 채팅/회의 내용을 AI가 분석해 핵심 내용을 자동 요약.
* **원스톱 워크스페이스:** 대화, 회의록, 태스크 관리를 하나의 채팅 툴 안에서 처리.

### 3. 기대 효과
* **정리 시간 절감:** 회의 후 수기로 정리하던 시간을 최소화.
* **투명한 협업:** 팀원 모두가 같은 정보와 진행 상황을 실시간으로 공유.

---

## 🛠 사용 기술 (Tech Stack)

| 구분 | 기술 스택 | 비고 |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) | SPA 구조, 실시간 UI 업데이트 |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white) | 실시간 채팅, REST API |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) | 사용자, 워크스페이스, 태스크 데이터 관리 |
| **AI** | ![Gemini](https://img.shields.io/badge/Google_Gemini_API-8E75B2?logo=googlegemini&logoColor=white) | 채팅 내용 분석, 회의록 요약, 태스크 추출 |
| **Collaboration** | ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) | 버전 관리 및 이슈 트래킹 |
---

## ✨ 핵심 구현 기능
* **실시간 채팅:** Socket.io 기반의 워크스페이스별 실시간 채팅 기능.
* **AI 대화 요약:** 안 읽은 메시지부터 최근 메시지까지 채팅 내용을 분석해 요약본 제공.
* **칸반 보드:** 태스크 생성/배정 및 드래그 앤 드롭으로 진행 상태 관리.
* **워크스페이스 관리:** 팀별 워크스페이스 생성 및 멤버 초대/관리.

---

## 👥 Team Members & Roles

| 이름 | 포지션 | GitHub |
| :--- | :--- | :--- |
| **유지환** | `Team Leader` `Backend` | [@angry-cat55](https://github.com/angry-cat55) |
| **유태식** | `Backend` | [@xotlr467-cpu](https://github.com/xotlr467-cpu) |
| **신재영** | `Frontend` | [@NKIA-SJY](https://github.com/NKIA-SJY) |
| **전현서** | `Frontend` | [@aihonte](https://github.com/aihonte) |

---

## 📂 산출물
*(각 항목 클릭 시 해당 문서 확인 가능하도록 추가 예정)*

### 1. 프로젝트 관리 (PM)
* [📂 요구사항 정의서]

### 2. 데이터베이스 설계 (ERD)
* [📂 테이블 정의서]
* [ERD 다이어그램]

### 3. UI/UX 설계
* [📂 화면 설계서]

---

## 💡 회고
*(프로젝트 최종 완료 후 팀원별 회고 작성 예정)*

### 📈 성과 및 배운 점
*(프로젝트 최종 완료 후 작성 예정)*
