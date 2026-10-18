// Run with: node --test test/
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// script.js is a browser script; pull the pure tax functions out of it.
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const extract = (name) => {
    const start = source.indexOf(`function ${name}(`);
    let depth = 0;
    for (let i = source.indexOf('{', start); i < source.length; i++) {
        if (source[i] === '{') depth++;
        if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
    }
    throw new Error(`function ${name} not found`);
};
const limit = source.match(/const NEW_REGIME_REBATE_LIMIT = (\d+);/)[1];
const calculateNewRegimeTax = new Function(
    `const NEW_REGIME_REBATE_LIMIT = ${limit};
     ${extract('calculateNewRegimeTaxWithoutRebate')}
     ${extract('calculateNewRegimeTax')}
     return calculateNewRegimeTax;`
)();

test('no tax up to ₹12 lakh taxable income', () => {
    assert.strictEqual(calculateNewRegimeTax(400000), 0);
    assert.strictEqual(calculateNewRegimeTax(1200000), 0);
});

test('marginal relief just above ₹12 lakh', () => {
    assert.strictEqual(calculateNewRegimeTax(1210000), 10000);
    assert.strictEqual(calculateNewRegimeTax(1260000), 60000);
});

test('slab tax once marginal relief no longer applies', () => {
    // 5% of 4-8L + 10% of 8-12L + 15% of 12-12.75L
    assert.strictEqual(calculateNewRegimeTax(1275000), 71250);
    assert.strictEqual(calculateNewRegimeTax(1600000), 120000);
});
