import { NextApiRequest, NextApiResponse } from 'next';
import { AnalyticsDataService } from '../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { timeframe = '7days' } = req.query;

  try {
    // Fetch real data from main database
    const dashboardData = await AnalyticsDataService.generateDashboardData(timeframe as string);
    
    // Add cache headers for performance
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.status(200).json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      timeframe: timeframe as string,
      source: 'main_database'
    });
  } catch (error) {
    console.error('Dashboard data API error:', error);
    
    // Return empty data structure if database is not available
    const emptyData = await AnalyticsDataService.generateDashboardData('7days');
    
    res.status(200).json({
      success: false,
      data: emptyData,
      error: 'Main database not connected - showing empty structure',
      timestamp: new Date().toISOString(),
      timeframe: timeframe as string,
      source: 'fallback'
    });
  }
}
