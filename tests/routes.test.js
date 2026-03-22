const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request({
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('core pages render and include unified nav + local sign-in CTA', async () => {
  const server = app.listen(0);
  try {
    const paths = ['/', '/timetable', '/dpp', '/syllabus', '/test-analysis'];
    for (const path of paths) {
      const { statusCode, body } = await request(server, path);
      assert.equal(statusCode, 200, `${path} should return 200`);
      assert.match(body, /href="\/"/);
      assert.match(body, /href="\/timetable"/);
      assert.match(body, /href="\/dpp"/);
      assert.match(body, /href="\/syllabus"/);
      assert.match(body, /href="\/test-analysis"/);
      assert.match(body, /SIGN IN/i);
      assert.match(body, /logo\.png/);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
