const test = require('node:test');
const assert = require('node:assert/strict');
const { readFortune, readNames, questionTopic, parseCandidates } = require('../src/logic');
const birth = { birthDate: '1990-03-15', gender: 'male' };

test('실제 사주 결과와 시간 미상 한계를 표시한다', () => {
  const result = readFortune(birth, 'love');
  assert.equal(result.pillars.day.label, '기묘');
  assert.equal(result.pillars.hour, null);
  assert.equal(result.fortune.type, 'love');
  assert.match(result.fortune.caveat, /시간/);
});
test('질문은 지원 주제만 분류한다', () => {
  assert.equal(questionTopic('이직해도 될까요?'), 'career');
  assert.equal(questionTopic('연애운이 궁금해요'), 'love');
  assert.equal(questionTopic('오늘 날씨 알려줘'), null);
});
test('후보를 파싱하고 실제 패키지로 이름을 비교한다', async () => {
  assert.deepEqual(parseCandidates('서아, 瑞雅\n지유'), [{ givenName: '서아', hanjaName: '瑞雅' }, { givenName: '지유' }]);
  const result = await readNames(birth, '김', '', '서아\n지유');
  assert.equal(result.recommendations.length, 2);
  assert.ok(result.recommendations.every(item => item.strokeProfile.source === 'korean-stroke-hangul'));
  await assert.rejects(() => readNames(birth, '김', '', ''), /1~10/);
});
