import type { NextApiRequest, NextApiResponse } from 'next';
import { AnalyticsDataService } from '../../lib/dataService';

interface StatisticalReportResponse {
  statistical_summary: {
    sample_size: number;
    normality_test: { statistic: number; isNormal: boolean };
    autocorrelation: number;
    seasonality_detected: boolean;
    data_quality_score: number;
  };
  performance_benchmarks: {
    efficiency_percentiles: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    wait_time_percentiles: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
  };
  forecast: number[];
  recommendations: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatisticalReportResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeframe = '30days' } = req.query;
    
    // Validate timeframe parameter
    if (typeof timeframe !== 'string' || !['7days', '30days', '90days'].includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe. Use 7days, 30days, or 90days.' });
    }

    // Generate comprehensive statistical report
  const report = await AnalyticsDataService.generateStatisticalReport(timeframe as string);

    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating statistical report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
