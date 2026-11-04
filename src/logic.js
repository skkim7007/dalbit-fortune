const { analyzeSaju } = require('saju-fortune');
const { recommendNames } = require('naming-house');

const topics = { general: '종합운', love: '연애와 관계', wealth: '재물과 소비', career: '일과 진로', health: '건강과 생활 습관' };
const elements = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };

function readFortune(birth, topic = 'general') {
  return analyzeSaju({ ...birth, calendar: 'solar' }, { analysisType: 'fortune', fortuneType: topic });
}

function questionTopic(question) {
  if (/연애|사랑|결혼|애인|남친|여친|관계|이성/.test(question)) return 'love';
  if (/돈|재물|재산|투자|금전|소비|사업/.test(question)) return 'wealth';
  if (/직업|직장|취업|이직|진로|공부|시험|일자리|커리어/.test(question)) return 'career';
  if (/건강|몸|휴식|운동|수면/.test(question)) return 'health';
  if (/사주|오행|운세|종합|운명/.test(question)) return 'general';
  return null;
}

function parseCandidates(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length > 2 || !parts[0] || (parts.length === 2 && !parts[1])) throw new Error('이름 후보는 한 줄에 하나씩 ‘이름’ 또는 ‘이름, 한자’로 입력해 주세요.');
    return { givenName: parts[0], ...(parts[1] ? { hanjaName: parts[1] } : {}) };
  });
}

async function readNames(birth, surname, surnameHanja, text) {
  const candidates = parseCandidates(text);
  if (!candidates.length || candidates.length > 10) throw new Error('이름 후보를 1~10개 입력해 주세요.');
  return recommendNames({ ...birth, calendar: 'solar', surname, ...(surnameHanja ? { surnameHanja } : {}), candidates });
}

module.exports = { topics, elements, readFortune, questionTopic, parseCandidates, readNames };
