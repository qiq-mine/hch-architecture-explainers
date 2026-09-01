# Archscribe PoC · Skill Runtime

这是一个独立的 Archscribe 流程图 PoC，不会直接修改上层的 `skill-lifecycle.html`。它现在作为 Hybrid 方案的“全局闭环层”，与页面的逐步讲解共用阶段定义。

它只验证一个视觉问题：把 Skill 的运行机制压缩成一张“可同时看见主链路与失败回环”的动态图，是否比逐页浏览更直观。

## 内容模型

`任务进入 → 能力目录 → 选择 Skill → 加载 SKILL.md → 按需展开资源 → 调用工具 → 观察结果 → 验证交付`

验证失败会通过 `kind: "loop"` 回到加载阶段，表达 Agent Loop 的继续判断。

## 文件

- `skill-runtime-spec.json`：Archscribe graph 配置，后续可直接迁移到正式页面。
- `engine/scripts/`：本次 PoC 使用的 Archscribe 官方布局器和 Pillow 渲染入口。
- `outputs/`：生成的 PNG / Excalidraw 产物。

## 生成

当前 PoC 使用 Pillow 兜底渲染，避免安装 Chromium；因此动画采用 Archscribe 的经典 `flow` 管线，`failure-recovery` 仍保留在 spec 中，供后续浏览器渲染使用：

```powershell
$env:PYTHONPATH = (Resolve-Path '.\engine\vendor').Path
python -X utf8 .\engine\scripts\render_animated_diagram.py `
  --spec .\skill-runtime-spec.json `
  --outdir .\outputs `
  --basename skill-runtime `
  --renderer pillow `
  --formats png,gif,excalidraw `
  --verify --check
```

完整浏览器渲染可再切换到 `--renderer browser`，得到更接近 Archscribe 官方的手绘 SVG / HTML 动效。

本次输出：`outputs/skill-runtime.png`、`outputs/skill-runtime.gif`、`outputs/skill-runtime.excalidraw`。

## 与现有页面融合

正式页面的叙事顺序为“Skill 定义 → 相邻概念比较 → Archscribe 完整闭环 → 12 页 Web 细节 Slide → 总结”。`hybrid-map.json` 把图中的六个稳定节点映射到当前页面的 12 个步骤；其中前两个步骤负责介绍 Skill，不重复进入运行拓扑。

PoC 阶段可在比较区与机制区之间引用 `outputs/skill-runtime.png` 验证信息结构。正式单文件版本应把浏览器渲染得到的 SVG 内联进 `skill-lifecycle.html`，并用 `data-phase` 与 Slide 联动高亮，避免外链图片或 iframe。
