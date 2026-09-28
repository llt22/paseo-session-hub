# Paseo Session Hub (会话中心)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Paseo](https://img.shields.io/badge/Paseo->=0.9.0-6366F1.svg)](https://paseo.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB.svg)](https://reactnative.dev/)

为 **[Paseo](https://paseo.sh)** 量身打造的 **Linear / Raycast 级全局会话管理中心与看板**。告别杂乱的嵌套折叠与视觉噪点，跨项目秒级检索、管理与调度所有 AI 编码会话。

---

## ✨ 核心特性 (Features)

### 1. ⚡ 极简流线视觉 (Linear / Raycast Aesthetic)
* **彻底告别“砖墙疲劳”**：摒弃带框小盒子的机械堆叠，采用现代纯扁平单行/微卡片设计与通透呼吸感（48px 舒适行高）。
* **原生无缝秒切**：基于 Paseo SDK `navigation.openAgent`，应用内瞬时激活跳转，绝不跳外部浏览器。

### 2. 🎴 三种视图自由秒切 (Three View Modes)
* **⚡ 时间线模式 (Timeline)**：默认将所有项目的会话按**最近活跃时间**自然平铺，谁刚回复/谁在干活谁立刻置顶。
* **🎴 卡片网格模式 (Card Grid)**：自适应 **3 列紧凑网格**，所有卡片高度（136px）与基线严格 Pixel-Perfect 对齐。
* **📁 项目分组模式 (By Project)**：按工程维度一键折叠/展开，清晰掌控各个代码库的任务分布。

### 3. 👁️ 强弱明暗视觉分层 (Visual Dimming Hierarchy)
* **全量保留不丢失**：不强制隐藏任何历史会话，100+ 记录随时通览与搜索。
* **已结束会话自动降权（`opacity: 0.45`）**：旧记录化为淡雅背景，大脑自动略过；**运行中（🟢 绿色呼吸灯）** 与 **待处理（🟠 琥珀色警示灯）** 保持 100% 鲜活高亮，毫秒级聚焦重点。

### 4. ✏️ 会话标题行内重命名 (Inline Rename)
* 点击任意会话旁的 **✏️ 铅笔图标**，直接进入行内编辑，改完按 **`Enter` 回车键**（或点击 ✓）即可秒级持久化。
* 全端联动更新：侧边栏、标题栏与面板数据毫秒级同步。

### 5. 🏷️ AI 模型名称智能弱化 (Model Normalization)
* 自动清洗冗长技术路径（如 `cpa-gpt/gemini-3.7-flash-high` ➔ `Gemini 3.7`），并进行低饱和度弱化渲染，不再抢占 Prompt 视觉焦点。

### 6. 🔍 多维即时模糊搜索 & 一键清理 (Search & Bulk Sweep)
* 支持同时按 **项目名、Prompt 标题、工作区、模型或状态** 联合即输即显过滤。
* 右上角提供 **「一键清理 X 个已结束」** 批量归档按钮，快速释放视线。

---

## 📸 视图模式一览

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🔍 搜索项目、会话标题、Prompt 或模型...                          [时间线]  [卡片]  [按项目]   [清理 106个已结束]  ↻ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ 全部会话 127 ]   [ 运行中 0 ]   [ 🟠 待处理 1 ]   [ 空闲 20 ]   [ 已结束 106 ]                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  🟠 haike-de12       别人今天说的，刚刚和客户交流下... 调研海科...            4分前    Opus 5.5    待处理 │
│  ⚪ haike-de12       插件是源码吗，可以自定义修改内容吗 调研海科...           13分前   Gemini 3.7  空闲   │
│  ⚪ ekc-ai           两个文档在下载目录，你找一下     海科需求   +3,122      56分前   GPT-5.6     空闲   │
│  💤 ekc-ai-rebuild   Senior Advisor: 切片 15 去留判定  本体平台              13小时前             已结束 │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 安装方法 (Installation)

### 方式 1：从 GitHub 直接安装（推荐）

在终端中执行：

```bash
# 安装并启用 session-hub
paseo plugin install https://github.com/llt22/paseo-session-hub.git
```

### 方式 2：本地源码安装

```bash
# 1. 克隆仓库至本地
git clone https://github.com/llt22/paseo-session-hub.git ~/.paseo/plugins/session-hub

# 2. 安装并信任本地插件
paseo plugin install ~/.paseo/plugins/session-hub
```

---

## ⌨️ 快捷操作与使用技巧

| 操作 | 快捷键 / 交互 | 说明 |
| :--- | :--- | :--- |
| **全局呼出看板** | `Cmd + K` (Mac) / `Ctrl + K` (Win) | 输入 `hub` 或 `会话` 按回车直接呼出 |
| **快速重命名标题** | 点击 ✏️ 或双击标题 | 输入新标题后按 `Enter` 确认保存，`Esc` 取消 |
| **切换视图模式** | 点击右上角 `[时间线] / [卡片] / [按项目]` | 毫秒级无缝切换布局 |
| **一键批量清理** | 点击右上角 `[清理 X 个已结束]` | 一键批量归档所有 Closed 状态的冗余历史 |
| **分类快速过滤** | 点击顶部状态药丸 Tab | 过滤 `运行中 🟢`、`待处理 🟠`、`空闲 ⚪` 等 |

---

## 🛠️ 项目目录结构

```text
paseo-session-hub/
├── client/
│   ├── data-loader.ts           # 会话聚合、状态判定与多维搜索算法
│   ├── diff-badge.tsx           # 极简代码 Diff 变动胶囊 (+82 -14)
│   ├── filter-tabs.tsx          # 状态药丸 Tab 族
│   ├── model-formatter.ts       # AI 模型名称规范化与精简引擎
│   ├── observation.ts           # 实时事件订阅与防抖刷新引擎
│   ├── project-group-card.tsx   # 项目树形分组卡片视图
│   ├── search-bar.tsx           # Linear 风格即时搜索栏 + 视图三模切换
│   ├── session-card.tsx         # 3 列自适应高度对齐卡片网格组件
│   ├── session-hub-view.tsx     # 主看板 Surface 容器 (Dark/Light 自适应)
│   ├── session-row.tsx          # 核心单行流线型条目组件 (带内联重命名)
│   ├── time-ago.ts              # 人性化相对时间格式化
│   └── use-sessions.ts          # React Hook 数据层 (TanStack Query + Mutations)
├── shared/
│   ├── constants.ts             # 状态配色与标签常量
│   └── types.ts                 # 严格的领域模型与 TypeScript 契约
├── index.client.tsx             # 客户端挂载 (侧边栏图标 + Cmd+K 快捷命令)
├── index.server.ts              # 后端服务挂载入口
├── paseo-plugin.json            # 插件元数据清单
├── package.json
└── tsconfig.json
```

---

## 💻 本地二次开发 (Development)

修改代码后，无需重启 Paseo 客户端，只需在终端执行：

```bash
# 重新加载插件（即时编译并生效）
paseo plugin reload session-hub

# 查看实时运行日志
paseo plugin logs session-hub

# 静态类型检查
bun x tsc --noEmit
```

---

## 📄 开源许可 (License)

本项目采用 [MIT License](LICENSE) 开源许可。
