import fs from 'fs';
import path from 'path';
import url from 'url';

const results = [];

function describe(_name, fn) {
  fn();
}

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'passed' });
  } catch (err) {
    results.push({ name, status: 'failed', error: err });
  }
}

function expect(received) {
  return {
    toBe(expected) {
      if (received !== expected) {
        throw new Error(`Expected ${received} to be ${expected}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(received > expected)) {
        throw new Error(`Expected ${received} to be greater than ${expected}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(received - expected);
      const tolerance = Math.pow(10, -precision) / 2 * Math.max(Math.abs(received), Math.abs(expected));
      if (diff > tolerance) {
        throw new Error(`Expected ${received} to be close to ${expected} with precision ${precision}`);
      }
    }
  };
}

global.describe = describe;
global.test = test;
global.expect = expect;

async function run() {
  const testDir = path.resolve('tests/automatic');
  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(testDir, file);
    await import(url.pathToFileURL(filePath));
  }

  for (const r of results) {
    if (r.status === 'passed') {
      console.log(`\u2713 ${r.name}`);
    } else {
      console.log(`\u2717 ${r.name}`);
      console.error(r.error.stack || r.error);
    }
  }

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.length - passed;
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();
