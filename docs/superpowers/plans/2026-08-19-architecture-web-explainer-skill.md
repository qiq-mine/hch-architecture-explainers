# 技术架构 Web 可视化 Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为当前 Skill 生命周期页面补充流程章节标题，并创建一个可复用、可验证、可安装的技术架构 Web 可视化个人 Skill。

**Architecture:** 当前页面保持独立单文件，通过新增静态章节标题与响应式 CSS 完成局部增强。新 Skill 在工作区 `skills/creating-architecture-web-explainers/` 维护源文件，以轻量入口、两份按需参考、一个自适应单文件模板和一个 Node 验证器组成；验证通过后复制到个人 Codex Skills 目录。

**Tech Stack:** HTML5、CSS、Vanilla JavaScript、Node.js、Codex Skill Markdown/YAML。

**Spec:** `docs/superpowers/specs/2026-08-19-architecture-web-explainer-skill-design.md`

## Global Constraints

- Web 展示必须为单文件 HTML、零框架、零构建步骤。
- HCH.HUB 2.0 默认使用 `#05091A` 背景、`#E2EEFF` 正文、`#00CFFF` 主强调、`#00FF8A` 成功态、`#FF7C5C` 警示态。
- 1–3 个可独立理解的流程节点使用纵向滚动；4 个及以上节点使用横向 Slide。
- 横向 Slide 必须提供按钮、页码、左右方向键、触控滑动、首尾禁用状态和 reduced-motion 支持。
- 中文是主要信息语言；英文仅用于短标签、代码、协议名或技术术语。
- 当前目录不是 Git 仓库；本计划的提交步骤以记录验证结果替代，不初始化新仓库。

---

### Task 1: 为当前流程区增加章节标题

**Files:**
- Modify: `validate-skill-lifecycle.mjs`
- Modify: `skill-lifecycle.html`

**Interfaces:**
- Consumes: 现有 `.layout`、`.visual-col`、`.steps-col` 与 `.slider-nav`。
- Produces: `.mechanism-intro` 静态标题区，包含 `#mechanismTitle`；`main.layout` 通过 `aria-labelledby="mechanismTitle"` 与其关联。

- [ ] **Step 1: 写入失败的视觉契约断言**

在 `validate-skill-lifecycle.mjs` 增加：

```js
assert.match(html, /class="mechanism-intro"/);
assert.match(html, /id="mechanismTitle"/);
assert.match(html, /Skill 的发现、加载与执行机制/);
assert.match(html, /从能力匹配、主说明加载、资源按需展开，到真实执行与结果验证/);
```

- [ ] **Step 2: 运行测试并确认正确失败**

Run: `node .\validate-skill-lifecycle.mjs`

Expected: FAIL，原因是页面尚无 `mechanism-intro`。

- [ ] **Step 3: 加入标题结构与布局样式**

在 `<main class="layout">` 内最前方加入：

```html
<header class="mechanism-intro">
  <p class="section-kicker">// SKILL OPERATING MECHANISM</p>
  <h2 id="mechanismTitle">Skill 的发现、加载与执行机制</h2>
  <p>从能力匹配、主说明加载、资源按需展开，到真实执行与结果验证。</p>
</header>
```

将 `main` 改为 `aria-labelledby="mechanismTitle"`。桌面端标题绝对定位在流程区顶部，视觉内容与正文整体下移但仍保留底部导航空间；820px 以下缩小字号与上下间距，避免遮挡 Stage。

- [ ] **Step 4: 运行页面契约与脚本语法检查**

Run: `node .\validate-skill-lifecycle.mjs`

Expected: `skill-lifecycle visual contract: PASS`

Run:

```powershell
node -e "const fs=require('fs');const h=fs.readFileSync('skill-lifecycle.html','utf8');[...h.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log('inline scripts parse: PASS')"
```

Expected: `inline scripts parse: PASS`

### Task 2: 建立无自定义 Skill 的基线场景

**Files:**
- Create: `docs/superpowers/skill-tests/architecture-web-explainer-baseline.md`

**Interfaces:**
- Consumes: 一个不引用本 Skill 的独立评估任务。
- Produces: 可对比的缺失项列表，供 Task 3 的 Skill 指令直接修正。

- [ ] **Step 1: 运行独立基线场景**

向独立评估者提供：

```text
把一个包含“入口层、API 网关、三个业务服务、消息队列、数据层、监控与故障回路”的系统架构整理成 HCH.HUB 风格、单文件、零框架的中文 Web 解释页。说明你会如何组织内容、选择流程交互，并定义验收方式。只输出实施方案，不读取或引用任何自定义架构可视化 Skill。
```

- [ ] **Step 2: 记录可观察的基线结果**

在基线文件中逐项记录评估者是否：

- 先建立“概念、关系、流程、权衡、结论”内容模型。
- 按节点数明确选择纵向滚动或横向 Slide。
- 对横向模式定义按钮、页码、键盘、触控与禁用状态。
- 区分 HCH.HUB 视觉规则与一次性内容。
- 定义自动校验和桌面/移动端视觉验收。

保留其关键原话，并将缺失项作为 Task 3 的输入。

### Task 3: 创建 Skill 入口与按需参考

**Files:**
- Create: `skills/creating-architecture-web-explainers/SKILL.md`
- Create: `skills/creating-architecture-web-explainers/agents/openai.yaml`
- Create: `skills/creating-architecture-web-explainers/references/content-model.md`
- Create: `skills/creating-architecture-web-explainers/references/visual-system.md`

**Interfaces:**
- Consumes: Task 2 的基线缺失项与设计规格。
- Produces: 可自动发现的 Skill，以及只在内容建模或 HCH.HUB 视觉实现时加载的两份参考。

- [ ] **Step 1: 初始化 Skill 目录**

Run:

```powershell
python C:\Users\qiuwe\.codex\skills\.system\skill-creator\scripts\init_skill.py creating-architecture-web-explainers --path skills --resources references,scripts,assets --interface display_name="技术架构 Web 可视化" --interface short_description="将复杂技术架构整理成可交互的单文件中文 Web 展示" --interface default_prompt="Use $creating-architecture-web-explainers to turn this technical architecture into an interactive Chinese single-file web explainer."
```

Expected: 生成 Skill 目录和 `agents/openai.yaml`，无示例占位文件。

- [ ] **Step 2: 编写最小 Skill 入口**

`SKILL.md` 的 description 仅写触发条件：

```yaml
description: Use when turning a technical stack, system architecture, lifecycle, call chain, data flow, deployment flow, or technology comparison into an interactive Chinese web explainer.
```

正文必须包含：输入澄清、五类内容模型、流程节点计数、1–3 纵向/4+ 横向规则、单文件交付、浏览器视觉验收和常见错误；将内容与视觉细节分别路由到两份 reference。入口控制在约 500 英文词等价篇幅以内。

- [ ] **Step 3: 编写内容建模参考**

`content-model.md` 提供：原始资料提取表、概念/关系/流程/权衡/结论映射、节点合并规则，以及一个“API 网关到故障回路”的完整中文示例。明确节点是语义阶段而不是视觉页数。

- [ ] **Step 4: 编写视觉系统参考**

`visual-system.md` 提供：HCH.HUB 颜色令牌、字体层级、Hero/对比卡/Stage/Slide/总结组件、60% 导航透明度、响应式和 reduced-motion 规则。禁止用低对比小字号伪造科技感。

- [ ] **Step 5: 快速验证 Skill 元数据**

Run:

```powershell
python C:\Users\qiuwe\.codex\skills\.system\skill-creator\scripts\quick_validate.py skills\creating-architecture-web-explainers
```

Expected: `Skill is valid!`

### Task 3A: 修正 Agent 概念层级、字体与流程启动阶段

**Files:**
- Modify: `validate-skill-lifecycle.mjs`
- Modify: `skill-lifecycle.html`

**Interfaces:**
- Consumes: 当前对比卡、边界列表、流程标题和 11 页 Slider。
- Produces: Agent Loop 对比卡、统一中文列表字体、一个新的启动 Slide 与自动更新后的 12 页 Slider。

- [ ] **Step 1: 先写失败契约**

断言页面包含 `Agent Loop`、启动阶段标题、`USER TASK`、`SKILL INDEX`、`name + description + path`、更新后的流程副标题与 `12` 页；并断言不再出现 `技术栈 / 框架`。为边界粗体增加明确的 `var(--sans)` 与至少 12px 字号契约。

- [ ] **Step 2: 运行契约并确认正确失败**

Run: `node .\validate-skill-lifecycle.mjs`

Expected: FAIL，原因是 Agent Loop 与启动阶段尚未实现。

- [ ] **Step 3: 实现最小页面修正**

将第 4 张定位卡改成 Agent Loop，职责为驱动“判断 → 调用 → 观察 → 再判断”的运行闭环。调整 `.trade-panel li` 和 `.trade-panel li b` 的中文字体、字号与行高。流程副标题改为从“任务进入、能力目录暴露与语义匹配”开始；在现有 Slide 前加入一个启动 Slide，准确说明宿主提供轻量 Skill 索引，以及显式/隐式两种选择路径。Slider 总数自动变为 12。

- [ ] **Step 4: 运行契约与脚本解析**

Run: `node .\validate-skill-lifecycle.mjs`

Expected: PASS。

### Task 4: 创建自适应单文件模板与验证器

**Files:**
- Create: `skills/creating-architecture-web-explainers/assets/explainer-starter.html`
- Create: `skills/creating-architecture-web-explainers/scripts/validate-explainer.mjs`

**Interfaces:**
- Produces: `selectFlowMode(stepCount)`，返回 `'scroll'` 或 `'slides'`；验证器接受目标 HTML 路径作为第一个命令行参数。

- [ ] **Step 1: 先写验证器的模式契约**

验证器读取 HTML 后提取 `data-flow-step` 数量，并断言模板包含 `selectFlowMode`。它通过 Node `vm` 执行纯函数并验证：

```js
assert.equal(selectFlowMode(1), 'scroll');
assert.equal(selectFlowMode(3), 'scroll');
assert.equal(selectFlowMode(4), 'slides');
assert.equal(selectFlowMode(9), 'slides');
```

同时检查单文件、`lang="zh-CN"`、viewport、`prefers-reduced-motion`、语义标题、HCH 令牌，以及横向导航的按钮与 `aria-live` 页码。

- [ ] **Step 2: 运行验证器并确认模板缺失导致失败**

Run:

```powershell
node skills\creating-architecture-web-explainers\scripts\validate-explainer.mjs skills\creating-architecture-web-explainers\assets\explainer-starter.html
```

Expected: FAIL，原因是模板文件不存在。

- [ ] **Step 3: 编写最小自适应模板**

模板包含 4 个示例 `data-flow-step`，加载时通过以下纯函数选择模式：

```js
globalThis.selectFlowMode = function (stepCount) {
  return stepCount > 3 ? 'slides' : 'scroll';
};
```

`scroll` 模式让步骤正常进入文档流并隐藏 Slide 导航；`slides` 模式一次显示一项，并提供右下角按钮、页码、键盘和触控。删除一个或多个示例步骤后，页面会自动切换为纵向滚动。

- [ ] **Step 4: 运行验证器并确认通过**

Run:

```powershell
node skills\creating-architecture-web-explainers\scripts\validate-explainer.mjs skills\creating-architecture-web-explainers\assets\explainer-starter.html
```

Expected: `architecture web explainer contract: PASS`

### Task 5: 用同一场景复测 Skill 并安装

**Files:**
- Create: `docs/superpowers/skill-tests/architecture-web-explainer-with-skill.md`
- Copy: `skills/creating-architecture-web-explainers/` → `C:\Users\qiuwe\.codex\skills\creating-architecture-web-explainers\`

**Interfaces:**
- Consumes: Task 2 的相同场景，以及 Task 3–4 的完整 Skill。
- Produces: 行为对比报告与可在后续任务中直接调用的个人 Skill。

- [ ] **Step 1: 使用 Skill 重跑相同场景**

要求独立评估者读取 `skills/creating-architecture-web-explainers/SKILL.md` 和其中明确路由的参考，再回答 Task 2 的同一请求。

- [ ] **Step 2: 对比并修正真实缺口**

在复测文件中逐项比较 Task 2 的五项标准。若输出仍未按 7 个架构阶段选择横向 Slide，或没有定义多设备验收，只修改造成该缺失的 Skill 指令并重测；不为未出现的假设问题扩写规则。

- [ ] **Step 3: 执行完整验证**

Run:

```powershell
node .\validate-skill-lifecycle.mjs
python C:\Users\qiuwe\.codex\skills\.system\skill-creator\scripts\quick_validate.py skills\creating-architecture-web-explainers
node skills\creating-architecture-web-explainers\scripts\validate-explainer.mjs skills\creating-architecture-web-explainers\assets\explainer-starter.html
```

Expected: 三项均 PASS。

- [ ] **Step 4: 完成桌面与移动端视觉验收**

桌面端检查当前流程标题与 11 页导航；模板检查第 1 页和切换后状态。移动端确认标题不遮挡 Stage、正文可读、按钮可触达。发现布局问题时先修 CSS，再重新执行 Step 3。

- [ ] **Step 5: 安装个人 Skill**

确认目标绝对路径是 `C:\Users\qiuwe\.codex\skills\creating-architecture-web-explainers`，不存在同名用户内容后，将工作区版本复制到该目录。复制后再次对安装目录运行 `quick_validate.py`。

- [ ] **Step 6: 记录不可提交状态**

Run: `git status --short`

Expected: `fatal: not a git repository`。在交付说明中列出所有创建或修改的文件，不初始化仓库、不生成提交。
