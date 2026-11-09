import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isObviouslyAutomatedLead,
  isRateLimited,
  isSuspiciouslyFast,
} from '../api/lead.ts';

test('отсекает автоматическую заявку, аналогичную обнаруженному спаму', () => {
  assert.equal(
    isObviouslyAutomatedLead({
      name: 'RAHpTYCfTwqCLIWxM',
      email: 'm.uq.ujawo.j.o.s.e26@gmail.com',
      phone: '8198916466',
    }),
    true,
  );
});

test('не отсекает обычные русские имя, телефон и email', () => {
  assert.equal(
    isObviouslyAutomatedLead({
      name: 'Гузель Газиз',
      email: 'guzel@example.com',
      phone: '+7 (999) 123-45-67',
    }),
    false,
  );
});

test('не отсекает длинное настоящее имя', () => {
  assert.equal(
    isObviouslyAutomatedLead({
      name: 'Christopherjohnson',
      email: 'christopher@example.com',
    }),
    false,
  );
});

test('не считает спамом только необычный email или только ошибку в телефоне', () => {
  assert.equal(
    isObviouslyAutomatedLead({
      name: 'Иван',
      email: 'i.v.a.n.p.e.t.r.o.v26@gmail.com',
      phone: '+7 999 123-45-67',
    }),
    false,
  );
  assert.equal(
    isObviouslyAutomatedLead({ name: 'Иван', email: 'ivan@example.com', phone: '8198916466' }),
    false,
  );
});

test('отсеивает мгновенную отправку, но не обычное заполнение', () => {
  const now = 1_800_000_000_000;
  assert.equal(isSuspiciouslyFast(now - 2999, now), true);
  assert.equal(isSuspiciouslyFast(now - 3000, now), false);
  assert.equal(isSuspiciouslyFast(now - 60_000, now), false);
  assert.equal(isSuspiciouslyFast(undefined, now), false);
  assert.equal(isSuspiciouslyFast(now + 10 * 60 * 1000, now), true);
});

test('разрешает 10 попыток и ограничивает одиннадцатую', () => {
  const now = 1_800_000_000_000;
  const key = 'test-rate-limit-main';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(isRateLimited(key, now), false);
  }
  assert.equal(isRateLimited(key, now), true);
});

test('сбрасывает ограничение после окна и разделяет разные адреса', () => {
  const now = 1_800_000_000_000;
  const key = 'test-rate-limit-reset';
  for (let attempt = 0; attempt < 11; attempt += 1) isRateLimited(key, now);
  assert.equal(isRateLimited('test-rate-limit-other', now), false);
  assert.equal(isRateLimited(key, now + 10 * 60 * 1000), false);
});
