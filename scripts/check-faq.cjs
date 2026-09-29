// Isolated FAQ interaction checks. Real-browser visual checks remain necessary.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync(path.join(__dirname, '../js/faq.js'), 'utf8');

function fixture({reduced = false, animationAPI = true, throws = false, initiallyOpen = []} = {}) {
  const allAnimations = [];
  const pendingToggles = new Set();
  const nodes = [];
  let observer;
  function node() {
    const value = {
      dataset: {}, style: {overflow: ''}, events: {}, animations: [],
      addEventListener(type, handler) { (this.events[type] ||= []).push(handler); },
      emit(type, event = {}) { (this.events[type] || []).forEach(handler => handler(event)); }
    };
    if (animationAPI) value.animate = function(frames, options) {
      if (throws) throw new Error('Unsupported animation');
      const animation = {
        frames, options, onfinish: null, cancelled: false, finished: false, progress: 0,
        cancel() { this.cancelled = true; },
        finish() {
          if (this.cancelled || this.finished) return;
          this.finished = true;
          this.onfinish?.();
        }
      };
      this.animations.push(animation);
      allAnimations.push(animation);
      return animation;
    };
    return value;
  }
  for (let i = 0; i < 5; i++) {
    const item = node(), summary = node(), answer = node();
    let open = initiallyOpen.includes(i);
    item.bodyHeight = 100 + i * 15;
    item.summaryHeight = 60;
    Object.defineProperty(item, 'open', {
      get() { return open; },
      set(next) { if (next !== open) pendingToggles.add(item); open = next; }
    });
    item.querySelector = selector => selector === 'summary' ? summary : selector === '.faq-answer' ? answer : null;
    item.getBoundingClientRect = () => {
      const running = item.animations.findLast(animation => !animation.cancelled && !animation.finished);
      const height = running
        ? parseFloat(running.frames[0].height) * (1 - running.progress) + parseFloat(running.frames[1].height) * running.progress
        : item.summaryHeight + 2 + (item.open ? item.bodyHeight : 0);
      return {height};
    };
    answer.getBoundingClientRect = () => ({height: item.open ? item.bodyHeight : 0});
    nodes.push({item, summary, answer});
  }
  const group = node();
  group.querySelectorAll = () => nodes.map(entry => entry.item);
  const motion = node();
  motion.matches = reduced;
  const window = node();
  window.matchMedia = () => motion;
  window.ResizeObserver = class {
    constructor(handler) { observer = handler; }
    observe() {}
  };
  const context = {
    window,
    document: {querySelectorAll: () => [group]}
  };
  const run = () => vm.runInNewContext(code, context);
  run();
  const countOpen = () => nodes.filter(entry => entry.item.open).length;
  const flush = () => {
    const pending = [...pendingToggles];
    pendingToggles.clear();
    pending.forEach(item => item.emit('toggle'));
    assert.ok(countOpen() <= 1, 'At most one answer is open');
  };
  const click = index => {
    let prevented = false;
    nodes[index].summary.emit('click', {preventDefault() { prevented = true; }});
    assert.equal(prevented, true, 'The click is handled once by the enhancer');
    assert.ok(countOpen() <= 1, 'Exclusive state holds immediately, even during transitions');
    flush();
  };
  const finish = () => { allAnimations.forEach(animation => animation.finish()); flush(); };
  return {nodes, group, motion, window, allAnimations, run, click, countOpen, finish, flush,
    resizeContent(index) { observer([{target: nodes[index].answer}]); }};
}

{
  const f = fixture();
  assert.equal(f.countOpen(), 0);
  f.click(0);
  assert.equal(f.nodes[0].item.open, true);
  assert.equal(f.allAnimations.length, 2);
  assert.equal(f.nodes[0].item.dataset.faqState, 'opening');
  assert.equal(f.allAnimations[1].frames[0].transform, 'translateY(-8px)');
  f.finish();
  assert.equal(f.nodes[0].item.dataset.faqState, 'open');
  assert.equal(f.nodes[0].item.style.overflow, '');

  f.click(0);
  assert.equal(f.nodes[0].item.dataset.faqState, 'closing');
  const staleFinish = f.allAnimations.at(-2).onfinish;
  f.click(1);
  assert.equal(f.nodes[0].item.open, false);
  assert.equal(f.nodes[1].item.open, true);
  staleFinish();
  assert.equal(f.nodes[1].item.open, true, 'Cancelled animation callbacks cannot overwrite newer state');
  f.finish();
  assert.equal(f.countOpen(), 1);

  for (let i = 0; i < 40; i++) {
    f.allAnimations.forEach(animation => { animation.progress = 0.45; });
    f.click(i % 5);
  }
  f.finish();
  assert.equal(f.countOpen(), 1);
  assert.equal(f.nodes[4].item.open, true);
  f.click(4);
  f.finish();
  assert.equal(f.countOpen(), 0);

  f.run();
  assert.equal(f.nodes[0].summary.events.click.length, 1, 'Reinitialization must not duplicate events');
}

for (const options of [{reduced: true}, {animationAPI: false}, {throws: true}]) {
  const f = fixture(options);
  f.click(0);
  assert.equal(f.nodes[0].item.open, true);
  f.click(1);
  assert.equal(f.nodes[0].item.open, false);
  assert.equal(f.nodes[1].item.open, true);
  f.click(1);
  assert.equal(f.countOpen(), 0);
  assert.equal(f.nodes[1].item.style.overflow, '');
}

{
  const f = fixture();
  f.click(2);
  f.motion.matches = true;
  f.motion.emit('change', {matches: true});
  assert.equal(f.nodes[2].item.dataset.faqState, 'open');
  assert.ok(f.allAnimations.every(animation => animation.cancelled));
  f.motion.matches = false;
  f.click(2);
  f.motion.matches = true;
  f.motion.emit('change', {matches: true});
  assert.equal(f.nodes[2].item.open, false, 'Motion preference changes settle a closing disclosure');
}

{
  const f = fixture();
  f.click(0);
  f.resizeContent(0);
  assert.equal(f.nodes[0].item.dataset.faqState, 'opening', 'Initial observer delivery does not kill the opening animation');
  f.nodes[0].item.bodyHeight += 50;
  f.resizeContent(0);
  assert.equal(f.nodes[0].item.dataset.faqState, 'open');
  assert.equal(f.nodes[0].item.getBoundingClientRect().height, 212);
  f.click(1);
  f.window.emit('resize');
  assert.equal(f.nodes[1].item.dataset.faqState, 'open');
  assert.equal(f.nodes[1].item.style.overflow, '');
}

{
  const f = fixture({initiallyOpen: [0, 1, 2]});
  assert.equal(f.countOpen(), 1, 'Normalize multiple initial disclosures even without native grouping support');
  f.nodes[3].item.open = true;
  f.nodes[3].item.emit('toggle');
  f.flush();
  assert.equal(f.countOpen(), 1, 'Programmatic open also enforces exclusivity');
  assert.equal(f.nodes[3].item.open, true);
  f.nodes[3].item.open = false;
  f.flush();
  assert.equal(f.countOpen(), 0);
}

console.log('FAQ checks passed: exclusive answers, interrupted transitions, motion preferences, fallback, resize and native changes.');
