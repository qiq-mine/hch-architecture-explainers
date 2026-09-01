import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./skill-lifecycle.html', import.meta.url), 'utf8');

const cssNumber = (selector, property) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = html.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 's'))?.[1] ?? '';
  const value = block.match(new RegExp(`${property}\\s*:\\s*([\\d.]+)px`))?.[1];
  return Number(value);
};

// Catches a regression back to the undersized desktop composition.
assert.ok(cssNumber('.stage', 'max-width') >= 520, 'desktop stage should be at least 520px wide');
assert.ok(cssNumber('.card', 'width') >= 390, 'primary Skill card should be at least 390px wide');
assert.ok(cssNumber('.terminal', 'width') >= 400, 'execution terminal should be at least 400px wide');

// Catches a page that cannot express a deterministic 0–100% reading progress.
assert.match(html, /id="progressBar"/);
assert.match(html, /scrollHeight\s*-\s*innerHeight/);

// Catches losing reduced-motion accessibility during the visual upgrade.
assert.match(html, /prefers-reduced-motion:\s*reduce/);

// Catches browser-review regressions in the approved hero/content revision.
assert.doesNotMatch(html, /class="rail"/);
assert.match(html, /class="skill-definition"/);
assert.match(html, /class="compare-grid"/);
assert.match(html, />匹配即可调用</);
assert.match(html, />用到再展开</);
assert.match(html, /<div class="scroll-cue"[^>]*><i><\/i><\/div>/);

// Catches drifting away from the HCH.HUB 2.0 design-token contract.
assert.match(html, /--bg:#05091A/);
assert.match(html, /--ink:#E2EEFF/);
assert.match(html, /--cyan:#00CFFF/);
assert.match(html, /--green:#00FF8A/);
assert.match(html, /--orange:#FF7C5C/);

// Catches slider boundary and direction regressions in the real state controller.
const sliderSource = html.match(/<script data-component="slider-state">([\s\S]*?)<\/script>/)?.[1];
assert.ok(sliderSource, 'slider state controller should exist');
const sliderContext = {};
runInNewContext(sliderSource, sliderContext);
const transitions = [];
const slider = sliderContext.createSliderState(3, (index, direction) => transitions.push([index, direction]));
assert.equal(slider.index, 0);
assert.equal(slider.next(), 1);
assert.equal(slider.next(), 2);
assert.equal(slider.next(), 2, 'next should clamp at the final slide');
assert.equal(slider.prev(), 1);
assert.equal(slider.go(-10), 0, 'go should clamp at the first slide');
assert.deepEqual(transitions, [[1, 'next'], [2, 'next'], [1, 'prev'], [0, 'prev']]);

// Catches losing the user-visible 60%-opacity navigation affordance.
assert.match(html, /class="slider-nav"/);
assert.match(html, /opacity:\.6/);
assert.match(html, /id="slidePrev"/);
assert.match(html, /id="slideNext"/);

// The left lifecycle illustration mirrors the accessible current-step copy;
// its complete layer stack must therefore stay out of the accessibility tree.
assert.match(
  html,
  /<div class="visual-col" aria-hidden="true">/,
  'redundant lifecycle visual column should stay out of the accessibility tree',
);

assert.match(html, /class="mechanism-intro"/);
assert.match(html, /id="mechanismTitle"/);
assert.match(html, /Skill 的发现、加载与执行机制/);
assert.match(html, /从认识 Skill，到触发选择、按需加载、真实执行与结果闭环。/);
assert.match(html, /<main class="layout" aria-labelledby="mechanismTitle">/);
const mobileLayoutRule = html.match(/@media\(max-width:820px\)\{([\s\S]*?)\}\s*@media\(max-width:520px\)/)?.[1] ?? '';
assert.match(mobileLayoutRule, /\.layout\{[^}]*height:auto/);
assert.match(mobileLayoutRule, /\.layout\{[^}]*overflow:visible/);
const narrowLayoutRule = html.match(/@media\(max-width:520px\)\{([\s\S]*?)\}\s*@media \(prefers-reduced-motion/)?.[1] ?? '';
const mechanismIntroRule = html.match(/\.mechanism-intro p:last-child\{([^}]+)\}/)?.[1] ?? '';
const mobileMechanismIntroRule = mobileLayoutRule.match(/\.mechanism-intro p:last-child\{([^}]+)\}/)?.[1] ?? '';
const narrowMechanismIntroRule = narrowLayoutRule.match(/\.mechanism-intro p:last-child\{([^}]+)\}/)?.[1] ?? '';
const narrowStepCopyRule = narrowLayoutRule.match(/\.step p\{([^}]+)\}/)?.[1] ?? '';
assert.ok(Number(mechanismIntroRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'mechanism intro copy should be at least 16px on desktop');
assert.ok(Number(mobileMechanismIntroRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'mechanism intro copy should remain at least 16px below 820px');
assert.ok(Number(narrowMechanismIntroRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'mechanism intro copy should remain at least 16px below 520px');
assert.ok(Number(narrowStepCopyRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'step copy should remain at least 16px below 520px');

// Catches a concept-level regression where the fourth comparison card is no
// longer the runtime Agent Loop role.
const compareCards = [...html.matchAll(/<article class="compare-card(?: [^"]*)?">[\s\S]*?<\/article>/g)].map(([card]) => card);
assert.equal(compareCards.length, 4, 'the comparison should retain four roles');
const fourthCompareCard = compareCards[3] ?? '';
assert.match(fourthCompareCard, /<h3>Agent Loop<\/h3>/, 'the fourth comparison card should describe Agent Loop');
assert.doesNotMatch(html, /技术栈\s*\/\s*框架/, 'technology stacks should not appear anywhere in the Agent-runtime explanation');
assert.doesNotMatch(fourthCompareCard, /技术栈\s*\/\s*框架/, 'the fourth Agent-runtime role should not be a technology stack');
assert.match(fourthCompareCard, /<span class="role">驱动运行闭环<\/span>/);
assert.match(fourthCompareCard, /判断、调用、观察、再判断/);
assert.match(fourthCompareCard, /何时继续与何时停止/);
assert.match(fourthCompareCard, /<span class="relation">承载 Prompt、Skill 与 Tool 的协作<\/span>/);
assert.match(html, /Prompt、Skill、Tool 与 Agent Loop 在一次 Agent 运行中的不同职责/);

// The story must introduce Skill before explaining how an Agent selects,
// loads, executes, observes and verifies it.
const lifecycleSteps = [...html.matchAll(/<section class="step"[^>]*>[\s\S]*?<\/section>/g)].map(([step]) => step);
assert.equal(lifecycleSteps.length, 12, 'the lifecycle should retain twelve focused slides');
const orderedStepIds = lifecycleSteps.map(step => step.match(/data-step="([^"]+)"/)?.[1]);
assert.deepEqual(orderedStepIds, [
  'struct-3', 'struct-4', 'boot-1', 'disc-1', 'struct-2', 'disc-2',
  'load-1', 'load-2', 'exec-1', 'observe-1', 'exec-2', 'recap',
]);
const [skillIntro, skillComposition, triggerStep, catalogStep, criteriaStep, matchStep, loadMainStep, loadResourceStep, executeStep, observeStep, verifyStep, recapStep] = lifecycleSteps;
assert.match(skillIntro, /Skill 是 Agent 可复用的行动协议/);
assert.match(skillIntro, /<p class="tag">01 · Skill<\/p>/);
assert.match(skillComposition, /触发条件、操作步骤与按需资源组成 Skill/);
assert.match(triggerStep, /任务触发 Agent，能力目录已经在场/);
assert.match(triggerStep, /不是 Skill 自己持续扫描/);
assert.match(catalogStep, /Agent 先查看轻量能力目录/);
assert.match(criteriaStep, /description 是选择 Skill 的主要依据/);
assert.match(matchStep, /显式点名或语义命中，完成选择/);
assert.match(loadMainStep, /选中后，完整加载主说明/);
assert.match(loadResourceStep, /资源沿执行路径按需展开/);
assert.match(executeStep, /Agent 按说明调用工具执行/);
assert.match(observeStep, /执行结果回到 Agent Loop 继续判断/);
assert.match(verifyStep, /验证通过才交付，失败则回到循环/);
assert.match(recapStep, /完整闭环：发现、选择、加载、执行、观察、验证/);

const bootLayerMatch = html.match(/<div class="layer" data-layer="([^"]+)">([\s\S]*?)(?=<div class="layer" data-layer="struct">)/);
assert.ok(bootLayerMatch, 'the startup data layer should precede the structural layer');
const [, bootLayerName, bootLayer] = bootLayerMatch;
assert.equal(bootLayerName, 'boot');
assert.match(bootLayer, /USER TASK[\s\S]*?→[\s\S]*?AGENT/);
assert.match(bootLayer, /SKILL INDEX/);
assert.match(bootLayer, /name \+ description \+ path/);
const firstStepGroup = skillIntro.match(/data-group="([^"]+)"/)?.[1];
const triggerStepGroup = triggerStep.match(/data-group="([^"]+)"/)?.[1];
assert.equal(firstStepGroup, 'struct', 'the first step should activate the Skill structure layer');
assert.equal(triggerStepGroup, bootLayerName, 'the trigger step should activate the host-context layer');
assert.match(html, /layer\.getAttribute\('data-layer'\)===group/, 'slider rendering should activate the layer matching the step group');

assert.match(html, /<div class="stage" id="stage" data-stage="struct-3">/);
assert.match(html, /id="stageLabel">SKILL \/ ACTION PROTOCOL<\/span>/);
assert.match(html, /id="stageIndex">01 \/ 12</);
assert.match(html, /id="slideNavCount"[^>]*><b>01<\/b> \/ 12</);
assert.match(html, /<p class="tag">12 · Recap<\/p>/, 'the final visible step should match the 12-slide total');
assert.match(html, /stepId==='observe-1'/, 'the execution visual should expose an observation state before verification');

const tradeListRule = html.match(/\.trade-panel li\{([^}]+)\}/)?.[1] ?? '';
const tradeBoldRule = html.match(/\.trade-panel li b\{([^}]+)\}/)?.[1] ?? '';
const compareCopyRule = html.match(/\.compare-card p\{([^}]+)\}/)?.[1] ?? '';
const compareRelationRule = html.match(/\.compare-card \.relation\{([^}]+)\}/)?.[1] ?? '';
assert.ok(Number(compareCopyRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'comparison card body copy should be at least 16px');
assert.ok(Number(compareRelationRule.match(/font\s*:\s*[\d.]+\s+([\d.]+)px\//)?.[1]) >= 12, 'comparison card relation copy should be at least 12px');
assert.match(tradeListRule, /font-family\s*:\s*var\(--sans\)/, 'trade list Chinese copy should use the sans font');
assert.match(tradeBoldRule, /font-family\s*:\s*var\(--sans\)/, 'trade list emphasis should use the sans font');
assert.ok(Number(tradeListRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'trade list copy should be at least 16px');
assert.ok(Number(tradeBoldRule.match(/font-size\s*:\s*([\d.]+)px/)?.[1]) >= 16, 'trade list emphasis should be at least 16px');
const tradeBoldWeight = Number(tradeBoldRule.match(/font-weight\s*:\s*([\d.]+)/)?.[1]);
assert.ok(tradeBoldWeight >= 550 && tradeBoldWeight <= 650, 'trade list emphasis should retain a natural weight around 600');
assert.ok(Number(tradeListRule.match(/line-height\s*:\s*([\d.]+)/)?.[1]) >= 1.5, 'trade list copy should retain readable line height');
assert.ok(Number(tradeBoldRule.match(/line-height\s*:\s*([\d.]+)/)?.[1]) >= 1.5, 'trade list emphasis should retain readable line height');

console.log('skill-lifecycle visual contract: PASS');
