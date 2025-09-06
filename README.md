# HTML Chess Game with AI

This is a simple chess game built with HTML, CSS, and JavaScript. The goal is to create a functional chessboard and eventually integrate with the Google Gemini API to power the AI opponent. This project is designed to be easily deployable on GitHub Pages.

## 專案簡介 (Project Introduction)

這是一個使用 HTML, CSS, 和 JavaScript 建立的簡易西洋棋遊戲。專案目標是建立一個功能完整的棋盤，並最終整合 Google Gemini API 作為 AI 對手。此專案的設計使其能輕易地部署在 GitHub Pages 上。

## 專案結構 (Project Structure)

-   `index.html`: 遊戲主頁面，負責載入所有資源與建立基本版面。
-   `style.css`: 棋盤與其他 UI 元素的樣式表。
-   `chess.js`: 核心遊戲邏輯，包括棋盤初始化、棋子移動規則等。
-   `ai.js`: AI 對手邏輯，未來將用於連接 Gemini API。
-   `README.md`: 專案說明文件。

## 功能簡介 (Features)

-   **響應式棋盤 (Responsive Board):** 使用 HTML/CSS 繪製的 8x8 棋盤，能自動適應不同尺寸的螢幕。
-   **完整遊戲規則 (Complete Game Rules):** 實現了所有棋子的移動規則，以及將軍 (Check)、將死 (Checkmate) 和逼和 (Stalemate) 的遊戲結束判斷。
-   **互動式介面 (Interactive UI):** 提供棋子選取、最後一步高亮、以及合法移動提示等視覺回饋。
-   **基礎 AI 對手 (Basic AI Opponent):** 內建一個可進行隨機合法移動的 AI，讓玩家可以立即開始一場完整的對局。
-   **模組化程式碼 (Modular Code):** 將遊戲邏輯 (`chess.js`) 與 AI 邏輯 (`ai.js`) 分離，方便維護與擴充。
-   **可擴充的 AI 架構 (Extensible AI Architecture):** `ai.js` 中的 `getAIMove()` 函式採用非同步設計，為未來串接 Gemini 等外部 API 提供了良好的基礎。
-   **靜態網站 friendly (Static Site Friendly):** 整個專案由純靜態檔案組成，可直接在任何網頁伺服器或 GitHub Pages 上運行。
