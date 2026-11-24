const test = require('node:test');
const assert = require('node:assert/strict');
const {
    isValidPassword,
    normalizeUsername,
    validateNote
} = require('../src/utils/validation');

test('username normalization trims whitespace and enforces length', () => {
    assert.equal(normalizeUsername('  notebook  '), 'notebook');
    assert.equal(normalizeUsername('  '), null);
    assert.equal(normalizeUsername(' a '), 'a');
    assert.equal(normalizeUsername('x'.repeat(65)), null);
});

test('password validation enforces registration length and bcrypt byte limit', () => {
    assert.equal(isValidPassword('short'), false);
    assert.equal(isValidPassword('long-enough-password'), true);
    assert.equal(isValidPassword('é'.repeat(37)), false);
    assert.equal(isValidPassword('short', { requireMinimum: false }), true);
});

test('note validation rejects invalid types and oversized content', () => {
    assert.equal(validateNote('  title  ', 'description'), null);
    assert.match(validateNote('   ', ''), /title is required/i);
    assert.match(validateNote('x'.repeat(161), ''), /160 characters/i);
    assert.match(validateNote('title', 42), /must be a string/i);
    assert.match(validateNote('title', 'x'.repeat(10001)), /10000 characters/i);
});
