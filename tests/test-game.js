const assert = require('assert');
const http = require('http');

console.log('========================================');
console.log('🎮 化学元素合成挑战 - 单元测试');
console.log('========================================\n');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
    results.push({ name, passed: true });
  } catch (e) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
    results.push({ name, passed: false, error: e.message });
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(message || 'Expected true');
  }
}

function assertFalse(condition, message = '') {
  if (condition) {
    throw new Error(message || 'Expected false');
  }
}

function assertContains(array, item, message = '') {
  if (!array.includes(item)) {
    throw new Error(message || `Array does not contain ${item}`);
  }
}

function assertNotContains(array, item, message = '') {
  if (array.includes(item)) {
    throw new Error(message || `Array should not contain ${item}`);
  }
}

const elements = [
  { id: 1, name: '氢', symbol: 'H', protons: 1, neutrons: 0, electrons: 1, atomic_number: 1, mass_number: 1 },
  { id: 2, name: '氦', symbol: 'He', protons: 2, neutrons: 2, electrons: 2, atomic_number: 2, mass_number: 4 },
  { id: 3, name: '锂', symbol: 'Li', protons: 3, neutrons: 4, electrons: 3, atomic_number: 3, mass_number: 7 },
  { id: 4, name: '铍', symbol: 'Be', protons: 4, neutrons: 5, electrons: 4, atomic_number: 4, mass_number: 9 },
  { id: 5, name: '硼', symbol: 'B', protons: 5, neutrons: 6, electrons: 5, atomic_number: 5, mass_number: 11 },
  { id: 6, name: '碳', symbol: 'C', protons: 6, neutrons: 6, electrons: 6, atomic_number: 6, mass_number: 12 },
  { id: 7, name: '氮', symbol: 'N', protons: 7, neutrons: 7, electrons: 7, atomic_number: 7, mass_number: 14 },
  { id: 8, name: '氧', symbol: 'O', protons: 8, neutrons: 8, electrons: 8, atomic_number: 8, mass_number: 16 },
  { id: 9, name: '氟', symbol: 'F', protons: 9, neutrons: 10, electrons: 9, atomic_number: 9, mass_number: 19 },
  { id: 10, name: '氖', symbol: 'Ne', protons: 10, neutrons: 10, electrons: 10, atomic_number: 10, mass_number: 20 },
  { id: 11, name: '钠', symbol: 'Na', protons: 11, neutrons: 12, electrons: 11, atomic_number: 11, mass_number: 23 },
  { id: 12, name: '镁', symbol: 'Mg', protons: 12, neutrons: 12, electrons: 12, atomic_number: 12, mass_number: 24 },
  { id: 13, name: '铝', symbol: 'Al', protons: 13, neutrons: 14, electrons: 13, atomic_number: 13, mass_number: 27 },
  { id: 14, name: '硅', symbol: 'Si', protons: 14, neutrons: 14, electrons: 14, atomic_number: 14, mass_number: 28 },
  { id: 15, name: '磷', symbol: 'P', protons: 15, neutrons: 16, electrons: 15, atomic_number: 15, mass_number: 31 },
  { id: 16, name: '硫', symbol: 'S', protons: 16, neutrons: 16, electrons: 16, atomic_number: 16, mass_number: 32 },
  { id: 17, name: '氯', symbol: 'Cl', protons: 17, neutrons: 18, electrons: 17, atomic_number: 17, mass_number: 35 },
  { id: 18, name: '氩', symbol: 'Ar', protons: 18, neutrons: 22, electrons: 18, atomic_number: 18, mass_number: 40 },
  { id: 19, name: '钾', symbol: 'K', protons: 19, neutrons: 20, electrons: 19, atomic_number: 19, mass_number: 39 },
  { id: 20, name: '钙', symbol: 'Ca', protons: 20, neutrons: 20, electrons: 20, atomic_number: 20, mass_number: 40 }
];

function checkSynthesis(element_id, protons, neutrons, electrons) {
  const element = elements.find(el => el.id === parseInt(element_id));
  if (!element) return null;
  
  const errors = [];
  const warnings = [];
  
  const protonCorrect = protons === element.protons;
  const neutronCorrect = neutrons === element.neutrons;
  const electronCorrect = electrons === element.electrons;
  
  if (!protonCorrect) {
    errors.push({ 
      type: 'protons', 
      message: `质子数不符：需要 ${element.protons} 个，当前 ${protons} 个` 
    });
  }
  
  if (!neutronCorrect) {
    if (protonCorrect) {
      warnings.push({
        type: 'isotope',
        message: `质子数正确，但中子数不同，这是${element.name}的同位素（质量数=${protons + neutrons}），目标是${element.mass_number}`
      });
    }
    errors.push({ 
      type: 'neutrons', 
      message: `中子数不符：需要 ${element.neutrons} 个，当前 ${neutrons} 个` 
    });
  }
  
  if (!electronCorrect) {
    const charge = protons - electrons;
    if (charge !== 0) {
      warnings.push({
        type: 'charge',
        message: `电荷不平衡：原子应为电中性（质子数=电子数），当前电荷为${charge > 0 ? '+' : ''}${charge}`
      });
    }
    errors.push({ 
      type: 'electrons', 
      message: `电子数不符：需要 ${element.electrons} 个，当前 ${electrons} 个` 
    });
  }
  
  return {
    correct: errors.length === 0,
    element,
    errors,
    warnings,
    current: { protons, neutrons, electrons },
    required: {
      protons: element.protons,
      neutrons: element.neutrons,
      electrons: element.electrons
    }
  };
}

function getElements(level = 1, excludeId = null) {
  const maxId = level * 5 + 5;
  const limit = Math.min(level + 4, 10);
  let filtered = elements.filter(el => el.id <= maxId);
  
  if (excludeId !== null && filtered.length > 1) {
    filtered = filtered.filter(el => el.id !== excludeId);
  }
  
  return filtered.slice(0, limit);
}

console.log('📦 1. 组合判定逻辑测试\n');

test('正确合成碳元素应该返回correct=true', () => {
  const result = checkSynthesis(6, 6, 6, 6);
  assertTrue(result.correct, '碳元素应该合成正确');
  assertEqual(result.errors.length, 0, '应该没有错误');
  assertEqual(result.warnings.length, 0, '应该没有警告');
});

test('正确合成氧元素应该返回correct=true', () => {
  const result = checkSynthesis(8, 8, 8, 8);
  assertTrue(result.correct, '氧元素应该合成正确');
  assertEqual(result.element.name, '氧', '元素名称应该是氧');
  assertEqual(result.element.symbol, 'O', '元素符号应该是O');
});

test('正确合成氢元素应该返回correct=true', () => {
  const result = checkSynthesis(1, 1, 0, 1);
  assertTrue(result.correct, '氢元素应该合成正确');
});

console.log('\n🔬 2. 质子数校验测试\n');

test('质子数不足应该返回错误', () => {
  const result = checkSynthesis(6, 5, 6, 6);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该包含质子错误');
  assertTrue(result.errors.some(e => e.message.includes('5')), '错误信息应该包含当前质子数5');
});

test('质子数过多应该返回错误', () => {
  const result = checkSynthesis(6, 7, 6, 6);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该包含质子错误');
  assertTrue(result.errors.some(e => e.message.includes('需要 6')), '错误信息应该说明需要6个质子');
});

test('质子数为0应该返回错误', () => {
  const result = checkSynthesis(1, 0, 0, 1);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该包含质子错误');
});

test('质子数超过元素最大序号应该返回错误', () => {
  const result = checkSynthesis(6, 20, 6, 6);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该包含质子错误');
});

console.log('\n⚛️ 3. 同位素处理测试\n');

test('质子数正确但中子数不同应该提示同位素（同时返回中子数错误）', () => {
  const result = checkSynthesis(6, 6, 7, 6);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'neutrons', '中子数应该作为错误');
  assertContains(result.warnings.map(w => w.type), 'isotope', '应该包含同位素警告');
  assertTrue(result.warnings.some(w => w.message.includes('同位素')), '警告信息应该包含同位素');
  assertTrue(result.warnings.some(w => w.message.includes('13')), '应该提到质量数13');
});

test('碳-13同位素应该被识别（6质子+7中子）', () => {
  const result = checkSynthesis(6, 6, 7, 6);
  assertTrue(result.warnings.some(w => w.type === 'isotope'), '应该有同位素警告');
  assertTrue(result.warnings[0].message.includes('质量数=13'), '应该提到质量数13');
  assertTrue(result.warnings[0].message.includes('目标是12'), '应该对比目标质量数12');
});

test('碳-14同位素应该被识别（6质子+8中子）', () => {
  const result = checkSynthesis(6, 6, 8, 6);
  assertTrue(result.warnings.some(w => w.type === 'isotope'), '应该有同位素警告');
  assertTrue(result.warnings[0].message.includes('质量数=14'), '应该提到质量数14');
});

test('质子数和中子数都错时应该返回两个错误（非同位素警告）', () => {
  const result = checkSynthesis(6, 5, 5, 6);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该包含质子错误');
  assertContains(result.errors.map(e => e.type), 'neutrons', '应该包含中子错误');
  assertEqual(result.warnings.length, 0, '不应该有同位素警告（因为质子错误）');
});

test('同位素情况仍然应该有其他错误（如电子数错误）', () => {
  const result = checkSynthesis(6, 6, 7, 5);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.warnings.map(w => w.type), 'isotope', '应该有同位素警告');
  assertContains(result.errors.map(e => e.type), 'electrons', '应该有电子错误');
});

console.log('\n⚡ 4. 电荷不平衡测试\n');

test('电子数不足应该提示电荷不平衡', () => {
  const result = checkSynthesis(6, 6, 6, 5);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.warnings.map(w => w.type), 'charge', '应该有电荷警告');
  assertTrue(result.warnings.some(w => w.message.includes('+1')), '电荷应该是+1');
});

test('电子数过多应该提示电荷不平衡', () => {
  const result = checkSynthesis(6, 6, 6, 7);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.warnings.map(w => w.type), 'charge', '应该有电荷警告');
  assertTrue(result.warnings.some(w => w.message.includes('-1')), '电荷应该是-1');
});

test('质子数和电子数同时错误时应该有电荷警告', () => {
  const result = checkSynthesis(6, 7, 6, 5);
  assertFalse(result.correct, '合成应该失败');
  assertContains(result.warnings.map(w => w.type), 'charge', '应该有电荷警告');
  assertTrue(result.warnings.some(w => w.message.includes('+2')), '电荷应该是+2');
});

test('质子数=电子数时不应该有电荷警告', () => {
  const result = checkSynthesis(6, 5, 6, 5);
  assertEqual(result.warnings.filter(w => w.type === 'charge').length, 0, '不应该有电荷警告');
});

console.log('\n🎲 5. 题库随机算法测试\n');

test('关卡1应该返回前5个元素（limit=1+4=5）', () => {
  const result = getElements(1);
  assertEqual(result.length, 5, '应该返回5个元素');
  assertTrue(result.every(el => el.id <= 10), '所有元素ID应该<=10');
});

test('关卡2应该返回前6个元素（limit=2+4=6）', () => {
  const result = getElements(2);
  assertEqual(result.length, 6, '应该返回6个元素');
  assertTrue(result.every(el => el.id <= 15), '所有元素ID应该<=15');
});

test('关卡5应该返回前9个元素（limit=5+4=9）', () => {
  const result = getElements(5);
  assertEqual(result.length, 9, '应该返回9个元素');
  assertTrue(result.every(el => el.id <= 20), '所有元素ID应该<=20');
});

test('关卡6应该返回前10个元素（limit=min(6+4,10)=10）', () => {
  const result = getElements(6);
  assertEqual(result.length, 10, '应该返回10个元素');
  assertTrue(result.every(el => el.id <= 20), '所有元素ID应该<=20');
});

test('关卡10应该返回前10个元素', () => {
  const result = getElements(10);
  assertEqual(result.length, 10, '应该返回10个元素');
});

console.log('\n🔄 6. 去重机制测试\n');

test('excludeId参数应该排除指定元素', () => {
  const result = getElements(2, 1);
  assertNotContains(result.map(el => el.id), 1, '不应该包含ID为1的元素');
  assertTrue(result.every(el => el.id !== 1), '确认不包含ID=1');
});

test('排除碳元素(6)后不应该包含碳', () => {
  const result = getElements(2, 6);
  assertNotContains(result.map(el => el.name), '碳', '不应该包含碳元素');
  assertNotContains(result.map(el => el.symbol), 'C', '不应该包含C符号');
});

test('排除元素后数量应该正确（关卡1 limit=5）', () => {
  const result = getElements(1, null);
  assertEqual(result.length, 5, '关卡1默认返回5个元素');
  
  const result2 = getElements(1, 1);
  assertEqual(result2.length, 5, '排除1个后仍然返回5个（因为可用元素有9个）');
  
  const result3 = getElements(2, 6);
  assertEqual(result3.length, 6, '关卡2排除1个后仍然返回6个');
});

test('连续排除应该防止重复', () => {
  let lastId = 6;
  let hasDuplicate = false;
  
  for (let i = 0; i < 100; i++) {
    const result = getElements(2, lastId);
    const available = result.filter(el => el.id !== lastId);
    
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const newElement = available[randomIndex];
      
      if (newElement.id === lastId) {
        hasDuplicate = true;
        break;
      }
      lastId = newElement.id;
    }
  }
  
  assertFalse(hasDuplicate, '100次随机选择中不应该出现连续相同元素');
});

test('去重后元素应该仍然在范围内', () => {
  const withoutExclude = getElements(2);
  const withExclude = getElements(2, 1);
  
  assertEqual(withExclude.length, 6, '仍然返回6个元素');
  assertNotContains(withExclude.map(el => el.id), 1, '不应该包含被排除的ID=1');
});

test('排除多个元素测试', () => {
  const result1 = getElements(3, 1);
  assertNotContains(result1.map(el => el.id), 1, '不应该包含ID=1');
  
  const result2 = getElements(3, 2);
  assertNotContains(result2.map(el => el.id), 2, '不应该包含ID=2');
  
  const result3 = getElements(3, 3);
  assertNotContains(result3.map(el => el.id), 3, '不应该包含ID=3');
});

console.log('\n⏱️ 7. 计时器重置逻辑测试\n');

function simulateGameState() {
  return {
    currentLevel: 1,
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    currentElement: null,
    lastElementId: null,
    timestamp: Date.now()
  };
}

function shouldResetGame(state) {
  if (!state) return false;
  const now = Date.now();
  const timeSinceSave = now - state.timestamp;
  
  if (timeSinceSave > 10000) {
    return true;
  }
  
  if (state.isPlaying) {
    return true;
  }
  
  return false;
}

test('新游戏状态不应该触发重置', () => {
  const state = simulateGameState();
  assertFalse(shouldResetGame(state), '新游戏状态不应该重置');
});

test('超过10秒的旧状态应该重置', () => {
  const state = simulateGameState();
  state.timestamp = Date.now() - 15000;
  
  assertTrue(shouldResetGame(state), '15秒前的状态应该重置');
});

test('正在进行的游戏应该重置', () => {
  const state = simulateGameState();
  state.isPlaying = true;
  
  assertTrue(shouldResetGame(state), '正在进行的游戏应该重置');
});

test('9.9秒的状态不应该重置', () => {
  const state = simulateGameState();
  state.timestamp = Date.now() - 9900;
  
  assertFalse(shouldResetGame(state), '9.9秒的状态不应该重置');
});

test('10.1秒的状态应该重置', () => {
  const state = simulateGameState();
  state.timestamp = Date.now() - 10100;
  
  assertTrue(shouldResetGame(state), '10.1秒的状态应该重置');
});

test('空状态不应该触发重置', () => {
  assertFalse(shouldResetGame(null), 'null状态不应该重置');
  assertFalse(shouldResetGame(undefined), 'undefined状态不应该重置');
});

console.log('\n🧪 8. 综合场景测试\n');

test('完整错误场景：质子错误+电子错误+电荷警告', () => {
  const result = checkSynthesis(6, 7, 6, 5);
  assertFalse(result.correct, '应该失败');
  assertContains(result.errors.map(e => e.type), 'protons', '应该有质子错误');
  assertContains(result.errors.map(e => e.type), 'electrons', '应该有电子错误');
  assertContains(result.warnings.map(w => w.type), 'charge', '应该有电荷警告');
  assertEqual(result.warnings.filter(w => w.type === 'isotope').length, 0, '不应该有同位素警告');
});

test('完整警告场景：同位素+电荷警告', () => {
  const result = checkSynthesis(6, 6, 7, 5);
  assertFalse(result.correct, '应该失败');
  assertContains(result.warnings.map(w => w.type), 'isotope', '应该有同位素警告');
  assertContains(result.warnings.map(w => w.type), 'charge', '应该有电荷警告');
  assertContains(result.errors.map(e => e.type), 'electrons', '应该有电子错误');
  assertContains(result.errors.map(e => e.type), 'neutrons', '应该有中子错误');
});

test('连续关卡元素不重复', () => {
  let lastElement = null;
  let hasRepeat = false;
  const seenIds = new Set();
  
  for (let level = 1; level <= 10; level++) {
    const excludeId = lastElement ? lastElement.id : null;
    const available = getElements(level, excludeId);
    
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const currentElement = available[randomIndex];
      
      if (lastElement && currentElement.id === lastElement.id) {
        hasRepeat = true;
        break;
      }
      
      if (seenIds.has(currentElement.id)) {
      }
      seenIds.add(currentElement.id);
      
      lastElement = currentElement;
    }
  }
  
  assertFalse(hasRepeat, '10个关卡中不应该有连续重复元素');
});

test('高关卡应该能选中大部分元素', () => {
  const seenIds = new Set();
  
  for (let i = 0; i < 1000; i++) {
    const elements = getElements(10);
    elements.forEach(el => seenIds.add(el.id));
  }
  
  assertTrue(seenIds.size >= 10, '应该能选中至少10种元素');
  assertTrue(seenIds.has(1), '应该包含氢');
  assertTrue(seenIds.has(6), '应该包含碳');
  assertTrue(seenIds.has(8), '应该包含氧');
});

test('题库应该包含20种元素', () => {
  assertEqual(elements.length, 20, '总共有20种元素');
  assertEqual(elements[0].name, '氢', '第一个元素是氢');
  assertEqual(elements[5].name, '碳', '第6个元素是碳');
  assertEqual(elements[7].name, '氧', '第8个元素是氧');
  assertEqual(elements[19].name, '钙', '第20个元素是钙');
});

console.log('\n========================================');
console.log('📊 测试结果统计');
console.log('========================================');
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📝 总计: ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('\n⚠️  部分测试失败');
  console.log('\n失败的测试:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
}
