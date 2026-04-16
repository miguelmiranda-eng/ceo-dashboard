import { fetchDashboardData } from './src/lib/api';

async function test() {
  try {
    const data = await fetchDashboardData();
    console.log('--- DASHBOARD DATA ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
