import { fetchDashboardData } from '../src/lib/api';

async function test() {
  try {
    const data = await fetchDashboardData();
    console.log('--- AGGREGATED DASHBOARD DATA ---');
    console.log('Pieces Produced (Today):', data.production.daily.value);
    console.log('Efficiency:', data.efficiency);
    console.log('Active Machines:', data.machinery.active);
    
    // Check if I can calculate average setup
    // I need to add this to the DashboardData interface
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

test();
