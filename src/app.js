const { topics, elements, readFortune, questionTopic, readNames } = require('./logic');

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let birth = null;
const birthForm = $('birth-form');

function birthFromForm() {
  if (!birthForm.reportValidity()) return null;
  return { name: $('name').value.trim(), birthDate: $('birthDate').value, ...( $('birthTime').value ? { birthTime: $('birthTime').value } : {}), gender: $('gender').value };
}

function showReading(result) {
  const name = result.input.name ? `${escapeHtml(result.input.name)}님의` : '당신의';
  const pillarNames = [['year', '년주'], ['month', '월주'], ['day', '일주'], ['hour', '시주']];
  const pillarHtml = pillarNames.map(([key, label]) => `<div class="pillar"><small>${label}</small><strong>${escapeHtml(result.pillars[key]?.label || '미상')}</strong><small>${escapeHtml(result.pillars[key]?.hanja || '시간 미입력')}</small></div>`).join('');
  const elementHtml = Object.entries(elements).map(([key, label]) => `<div class="element">${label}<strong>${result.fiveElements[key]}</strong></div>`).join('');
  $('result').innerHTML = `<div class="eyebrow">YOUR READING ✦</div><h3>${name} ${escapeHtml(result.fortune.label)} 이야기</h3><p class="result-sub">양력 ${escapeHtml(result.input.birthDate)} · ${result.input.birthTime ? escapeHtml(result.input.birthTime) : '태어난 시간 미상'} · 출생지 보정 없음</p><div class="pillars">${pillarHtml}</div><strong>나의 오행 분포</strong><div class="element-grid">${elementHtml}</div><p class="result-text">${escapeHtml(result.fortune.summary)}</p><p class="result-text">${result.fortune.guidance.map(escapeHtml).join('<br>')}</p><div class="result-alert">${escapeHtml(result.fortune.caveat)}<br>간단한 계산 모델로 절기·출생지에 따른 차이가 있을 수 있습니다. 의료·투자·법률 판단을 대신하지 않습니다.</div>`;
  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

birthForm.addEventListener('submit', event => {
  event.preventDefault();
  $('form-error').textContent = '';
  try {
    const input = birthFromForm();
    if (!input) return;
    const result = readFortune(input, $('topic').value);
    birth = input;
    showReading(result);
  } catch (error) { birth = null; $('form-error').textContent = '생년월일과 입력 정보를 확인해 주세요. ' + error.message; }
});

birthForm.addEventListener('input', event => {
  if (event.target.id !== 'topic') {
    birth = null;
    $('result').hidden = true;
    $('naming-result').textContent = '';
  }
});

document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => { $('topic').value = link.dataset.topic; }));

$('naming-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('naming-error').textContent = '';
  $('naming-result').textContent = '';
  if (!birth) { $('naming-error').textContent = '먼저 위에서 출생 정보를 입력하고 사주를 확인해 주세요.'; return; }
  try {
    const result = await readNames(birth, $('surname').value.trim(), $('surnameHanja').value.trim(), $('candidates').value);
    $('naming-result').innerHTML = result.recommendations.map(item => `<div class="name-item"><strong>${item.rank}. ${escapeHtml(item.fullName)} ${item.hanjaName ? `(${escapeHtml(item.hanjaName)})` : ''}</strong><span>${item.score}점</span><p>오행 ${item.components.elementBalance}/40 · 획수 ${item.components.strokeHarmony}/30 · 발음 ${item.components.soundFlow}/20 · 선호 ${item.components.preferenceFit}/10</p><p>${item.explanation.map(escapeHtml).join('<br>')}</p></div>`).join('') + '<p class="result-alert">한자 획수는 필순 기준이며 강희자전 원획수나 81수리와 다릅니다. 인명용 한자 및 법적 적합성은 별도 확인이 필요합니다. 재미와 참고용 결과입니다.</p>';
  } catch (error) { $('naming-error').textContent = '입력 내용을 확인해 주세요. 성씨와 이름은 한글 1~3자, 한자는 한자만 입력합니다. ' + error.message; }
});

function addMessage(text, role) {
  const node = document.createElement('div');
  node.className = `bubble ${role}`;
  node.textContent = text;
  $('messages').appendChild(node);
  $('messages').scrollTop = $('messages').scrollHeight;
}

function ask(question) {
  if (!question.trim()) return;
  addMessage(question.trim(), 'user');
  if (!birth) { addMessage('먼저 위에서 출생 정보를 입력하고 ‘나의 이야기 확인하기’를 눌러주세요.', 'bot'); return; }
  const topic = questionTopic(question);
  if (!topic) { addMessage('질문의 주제를 찾지 못했어요. 연애, 직업, 재물, 건강 또는 사주와 관련된 단어를 넣어 다시 질문해 주세요. 이 기능은 키워드 기반 안내로 질문의 세부 맥락은 이해하지 못해요.', 'bot'); return; }
  const result = readFortune(birth, topic);
  addMessage(`[${topics[topic]}에 관한 참고 이야기]\n${result.fortune.summary}\n\n${result.fortune.guidance.join('\n')}\n\n키워드 기반 안내로 질문의 세부 맥락은 반영하지 못해요. ${result.fortune.caveat}`, 'bot');
}
$('question-form').addEventListener('submit', event => { event.preventDefault(); ask($('question-input').value); $('question-input').value = ''; });
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
