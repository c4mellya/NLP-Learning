<template>
  <main id="main" ref="pageRoot" class="studio-home">
    <div class="studio-welcome">
      <div><p class="overline">YOUR SPACE TO THINK & BUILD</p><h1>学习，从好奇开始<span class="welcome-dot">。</span></h1></div>
      <p>一个关于语言、模型与智能体的开放笔记本。<br/><span>少一点旁观，多一次亲手验证。</span></p>
    </div>
    <section class="curiosity-cover" aria-labelledby="curiosity-title">
      <div class="cover-grain" aria-hidden="true"></div>
      <div class="curiosity-copy">
        <p class="cover-eyebrow"><span class="live-dot"></span> AN OPEN NOTEBOOK FOR THE AI ERA</p>
        <h2 id="curiosity-title">把好奇心，<br/>变成<span>行动力。</span></h2>
        <p class="curiosity-deck">从理解语言，到探索模型，再到构建智能体。<br/>让每一个「为什么」，都有一次亲手验证。</p>
        <div class="curiosity-actions"><RouterLink class="explore-button" to="/#courses">开始探索 <StudioIcon name="arrow" /></RouterLink><RouterLink class="resume-button" :to="resumeTo"><StudioIcon name="play" />{{ resumeLabel }}</RouterLink></div>
        <div class="cover-signoff"><span>LEARN.</span><span>BUILD.</span><span>REPEAT.</span><i></i><span>无限次好奇与尝试</span></div>
      </div>
      <div class="curiosity-art">
        <div class="sculpture-index"><span>FIG. 001</span><span>THE SHAPE OF POSSIBILITY</span><b>+</b></div>
        <canvas id="learning-network" role="img" aria-label="不断旋转的黄绿色立体环面雕塑，象征语言、模型与行动之间的连接。">语言、模型与行动的连接</canvas>
        <span class="sculpture-tag tag-one"><i></i> idea →</span><span class="sculpture-tag tag-two">→ possibility <StudioIcon name="spark" /></span>
        <div class="sculpture-console"><div aria-label="探索学习方向" class="concept-tabs"><button v-for="(item, i) in concepts" :key="item.id" :aria-pressed="concept === i" :data-concept="item.id" @click="concept = i">{{ item.label }}</button></div><button class="motion-toggle" aria-label="暂停知识雕塑动画" aria-pressed="false" type="button"><span aria-hidden="true">Ⅱ</span></button></div>
        <p id="concept-description" aria-live="polite" class="sculpture-description">{{ concepts[concept].description }}</p>
      </div>
    </section>
    <section class="exploration-path" aria-label="学习探索路径">
      <button v-for="(item, i) in concepts" :key="item.id" class="path-stop" :class="{ selected: concept === i }" :data-concept="item.id" :aria-pressed="concept === i" @click="concept = i"><span class="path-icon"><StudioIcon :name="item.icon" /></span><span class="path-stop-copy"><span><b>{{ item.title }}</b><small>{{ item.label }}</small></span><span>{{ item.subtitle }}</span></span><span class="path-index">0{{ i + 1 }}<span>↗</span></span></button>
    </section>
    <section id="courses" class="studio-notebooks" aria-labelledby="notebooks-title" data-reveal>
      <div class="notebooks-heading"><div><p class="overline">THE NOTEBOOK / 实践笔记</p><h2 id="notebooks-title">从理解，到亲手实现<span class="notebook-count">02</span></h2></div><div class="notebook-filters" aria-label="筛选学习笔记"><button v-for="item in filters" :key="item.value" :aria-pressed="filter === item.value" @click="filter = item.value">{{ item.label }}</button></div></div>
      <div class="notebooks-grid">
        <RouterLink v-show="filter !== 'llm'" class="notebook-card" to="/hermes/">
          <div class="notebook-visual hermes-visual" aria-hidden="true"><span class="visual-label">01 / THE AGENT FIELD GUIDE</span><span class="visual-plus">+</span>
            <div class="mini-terminal"><div class="mini-terminal-bar"><span><i></i><i></i><i></i></span><b>hermes / terminal</b><StudioIcon name="agent" /></div><div class="mini-terminal-body"><p><span>~</span> hermes chat</p><p class="terminal-question">› 把想法变成一次真实行动。</p><p class="terminal-answer"><span>✳</span> Thinking → Planning → Acting<span class="terminal-cursor"></span></p><div class="terminal-complete"><StudioIcon name="check" /><span>Ready to build something.</span><small>↵</small></div></div></div>
            <div class="terminal-orbit orbit-a"></div><div class="terminal-orbit orbit-b"></div><span class="visual-foot">OBSERVE. REASON. ACT.</span>
          </div>
          <div class="notebook-body"><div class="notebook-meta"><span class="category-pill">AGENT</span><span>CLI · 实践指南</span><span class="note-id">NOTE 01</span></div><h3>Hermes Agent 六步上手</h3><p>从环境搭建、模型配置到第一次工具调用，<br class="desktop-break"/>带着你的第一个 Agent，完成一次真实任务。</p><div class="notebook-bottom"><span><StudioIcon name="book" />6 个步骤<span class="meta-separator">/</span>逐步验收</span><span class="notebook-arrow"><StudioIcon name="arrow" /></span></div></div>
        </RouterLink>
        <RouterLink v-show="filter !== 'agent'" class="notebook-card" to="/llm-api/">
          <div class="notebook-visual caching-visual" aria-hidden="true"><span class="visual-label">02 / THE COMPUTATION EXPERIMENT</span><span class="visual-plus">+</span>
            <div class="cache-stack"><div class="cache-line"><span>REQUEST 01</span><div><i v-for="letter in 'PREFIX'" :key="letter">{{ letter }}</i><b>A</b></div></div><div class="cache-line cached-line"><span>REQUEST 02</span><div><i v-for="letter in 'PREFIX'" :key="letter">{{ letter }}</i><b>B</b></div></div><div class="cache-reuse"><span>└──── SAME PREFIX. LESS COMPUTE.</span><span class="cache-hit"><i></i> CACHE HIT</span></div></div>
            <span class="cache-watermark">reuse.</span><span class="visual-foot">LESS RECOMPUTE. MORE POSSIBILITY.</span>
          </div>
          <div class="notebook-body"><div class="notebook-meta"><span class="category-pill llm-pill">LLM</span><span>交互演示 · 成本模拟</span><span class="note-id">NOTE 02</span></div><h3>LLM API 与 Prompt Caching</h3><p>相同的前缀，更少的重复计算。动手调整输入，<br class="desktop-break"/>看懂缓存的命中、失效与真正的复用收益。</p><div class="notebook-bottom"><span><StudioIcon name="model" />交互实验<span class="meta-separator">/</span>可视化模拟</span><span class="notebook-arrow"><StudioIcon name="arrow" /></span></div></div>
        </RouterLink>
      </div>
      <p class="notebooks-status" role="status">{{ filter === 'all' ? '两篇笔记，两种把理解变成行动的方式。' : `正在探索 ${filter === 'agent' ? 'Agent' : 'LLM'} · 1 篇实践笔记` }}</p>
    </section>
    <section class="studio-daily" aria-labelledby="daily-invite-title" data-reveal>
      <div class="daily-mark" aria-hidden="true"><StudioIcon name="signal" /><span></span></div><div class="studio-daily-copy"><p class="overline">THE DAILY SIGNAL <span class="daily-live">持续更新</span></p><h2 id="daily-invite-title">学习之外，也看看世界的下一步。</h2><p>追踪 AI 新进展，在变化里积累自己的判断。</p></div><RouterLink to="/ai-daily/" class="daily-read"><span>阅读 AI 日报<small v-if="latestDate">最新刊期 / {{ latestDate }}</small></span><StudioIcon name="arrow" /></RouterLink>
    </section>
    <footer class="studio-footer"><span><b>NLP Learning</b><span>保持好奇，建立连接。</span></span><span class="footer-motto">A LITTLE CURIOSITY GOES A LONG WAY.</span><RouterLink to="/#main" aria-label="回到顶部">↑</RouterLink></footer>
  </main>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { usePage } from '../composables/useReading.js'
import { mountHome } from '../features/home.js'
import StudioIcon from '../components/StudioIcon.vue'
const pageRoot = ref(null), concept = ref(0), filter = ref('all'), latestDate = ref('')
const filters = [{ value: 'all', label: '全部笔记' }, { value: 'agent', label: 'Agent' }, { value: 'llm', label: 'LLM' }]
const concepts = [
  { id: 'nlp', label: 'NLP', icon: 'language', title: '理解语言', subtitle: '从词语，走向意义。', description: '01 / 从词语之间的关系，理解语言的意义。' },
  { id: 'llm', label: 'LLM', icon: 'model', title: '探索模型', subtitle: '看懂生成与推理的逻辑。', description: '02 / 从上下文中的模式，探索生成与推理。' },
  { id: 'agent', label: 'AGENT', icon: 'agent', title: '构建智能体', subtitle: '把理解，连接到真实任务。', description: '03 / 让模型连接工具，把理解变成行动。' },
]
let resumeTo = '/hermes/', resumeLabel = '从第一篇开始'
try {
  const saved = JSON.parse(localStorage.getItem('nlp-learning-position'))
  if (saved && ['hermes', 'llm-api'].includes(saved.course)) {
    resumeTo = '/' + saved.course + '/' + (typeof saved.section === 'string' && /^[\w-]+$/.test(saved.section) ? '#' + saved.section : '')
    resumeLabel = '继续上次阅读'
  }
} catch {}
usePage(pageRoot, mountHome, null)
onMounted(async () => { try { const response = await fetch('/ai-daily/index.json'); if (response.ok) latestDate.value = (await response.json()).latest || '' } catch {} })
</script>
