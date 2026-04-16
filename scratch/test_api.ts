import { fetchDashboardData } from '../src/lib/api';

async function test() {
  try {
    const data = await fetchDashboardData();
    console.log('DASHBOARD DATA:', JSON.stringify(data, null, 2));
    
    // Check raw capacity plan if I can get to it
    // Actually, I'll just check if there are other fields in the real response
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

test();
