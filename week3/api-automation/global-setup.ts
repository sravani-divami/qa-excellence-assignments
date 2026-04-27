import { request } from '@playwright/test';

async function globalSetup() {
  console.log('\n🔐 ShopEasy API — Global Setup');

  const apiContext = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  try {
    const health = await apiContext.get('/health');
    if (health.ok()) {
      const body = await health.json();
      console.log(`✅ API is running — ${body.service} v${body.version}`);
    } else {
      console.error(`❌ API health check returned status ${health.status()}. Make sure the server is running: cd api && node server.js`);
      process.exit(1);
    }
  } catch {
    console.error('❌ Cannot reach http://localhost:3000. Start the server first:\n   cd api && node server.js');
    process.exit(1);
  } finally {
    await apiContext.dispose();
  }

  console.log('✅ Global setup complete — running tests...\n');
}

export default globalSetup;
