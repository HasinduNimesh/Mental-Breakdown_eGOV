import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface StatisticalInsightsProps {
  timeframe: string;
}

interface StatisticalReport {
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

const StatisticalInsights: React.FC<StatisticalInsightsProps> = ({ timeframe }) => {
  const [report, setReport] = useState<StatisticalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatisticalReport = async () => {
      try {
        setLoading(true);
  const response = await fetch(`/api/statistical-report?timeframe=${timeframe}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistical report');
        }
        
        const data = await response.json();
        setReport(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching statistical report:', err);
        setError('Failed to load statistical insights');
      } finally {
        setLoading(false);
      }
    };

    fetchStatisticalReport();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-red-200">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle size={20} />
          <span>{error || 'No statistical data available'}</span>
        </div>
      </div>
    );
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="text-green-600" size={16} />;
    if (score >= 75) return <Activity className="text-yellow-600" size={16} />;
    return <AlertTriangle className="text-red-600" size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Statistical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 size={16} />
            <h3 className="text-sm font-medium">Data Quality</h3>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {getQualityIcon(report.statistical_summary.data_quality_score)}
            <span className={`text-2xl font-bold ${getQualityColor(report.statistical_summary.data_quality_score)}`}>
              {report.statistical_summary.data_quality_score}%
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Sample size: {report.statistical_summary.sample_size} records
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={16} />
            <h3 className="text-sm font-medium">Time Series Analysis</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Autocorrelation:</span>
              <span className="text-sm font-semibold">{report.statistical_summary.autocorrelation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Seasonality:</span>
              <span className={`text-sm font-semibold ${report.statistical_summary.seasonality_detected ? 'text-green-600' : 'text-gray-400'}`}>
                {report.statistical_summary.seasonality_detected ? 'Detected' : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Distribution:</span>
              <span className={`text-sm font-semibold ${report.statistical_summary.normality_test.isNormal ? 'text-green-600' : 'text-yellow-600'}`}>
                {report.statistical_summary.normality_test.isNormal ? 'Normal' : 'Non-normal'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target size={16} />
            <h3 className="text-sm font-medium">7-Day Forecast</h3>
          </div>
          <div className="space-y-1">
            {report.forecast.slice(0, 3).map((value, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-xs text-gray-500">Day +{index + 1}:</span>
                <span className="text-sm font-semibold">{value} appointments</span>
              </div>
            ))}
            {report.forecast.length > 3 && (
              <div className="text-xs text-gray-400 mt-2">
                +{report.forecast.length - 3} more days predicted
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Efficiency Benchmarks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top 10% (90th percentile)</span>
              <span className="font-semibold text-green-600">
                {report.performance_benchmarks.efficiency_percentiles.p90.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top 25% (75th percentile)</span>
              <span className="font-semibold text-blue-600">
                {report.performance_benchmarks.efficiency_percentiles.p75.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Median (50th percentile)</span>
              <span className="font-semibold">
                {report.performance_benchmarks.efficiency_percentiles.p50.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bottom 25% (25th percentile)</span>
              <span className="font-semibold text-orange-600">
                {report.performance_benchmarks.efficiency_percentiles.p25.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Wait Time Benchmarks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">90th percentile (worst 10%)</span>
              <span className="font-semibold text-red-600">
                {report.performance_benchmarks.wait_time_percentiles.p90.toFixed(0)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">75th percentile</span>
              <span className="font-semibold text-orange-600">
                {report.performance_benchmarks.wait_time_percentiles.p75.toFixed(0)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Median (50th percentile)</span>
              <span className="font-semibold">
                {report.performance_benchmarks.wait_time_percentiles.p50.toFixed(0)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">25th percentile (best 25%)</span>
              <span className="font-semibold text-green-600">
                {report.performance_benchmarks.wait_time_percentiles.p25.toFixed(0)} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle size={20} className="text-yellow-600" />
            <h3 className="text-lg font-semibold">Data-Driven Recommendations</h3>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticalInsights;
