import React from 'react';

interface ChartData {
  name: string;
  exercises: number;
}

interface SimpleBarChartProps {
  data: ChartData[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  const chartHeight = 200;
  const chartWidth = 400;
  const barWidth = 35;
  const barMargin = 20;
  const yAxisWidth = 30;
  const xAxisHeight = 20;

  const chartAreaWidth = chartWidth - yAxisWidth;
  const totalBarAndMarginWidth = data.length * (barWidth + barMargin) - barMargin;
  const effectiveBarWidth = (chartAreaWidth / totalBarAndMarginWidth) * barWidth;
  const effectiveMarginWidth = (chartAreaWidth / totalBarAndMarginWidth) * barMargin;


  const maxValue = Math.max(...data.map(d => d.exercises), 1); // Avoid division by zero, min height of 1
  const scale = (value: number) => (value / maxValue) * (chartHeight - xAxisHeight - 10); // Leave space for labels and padding

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" aria-label="Weekly activity chart" role="img">
      <title>Bar chart showing completed exercises per day for the last week</title>
      {/* Y-axis lines (grid) */}
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = chartHeight - xAxisHeight - scale(f * maxValue);
        return <line key={f} x1={yAxisWidth} y1={y} x2={chartWidth} y2={y} stroke="#4A4A4A" strokeWidth="0.5" strokeDasharray="3 3" />;
      })}
      
      {/* Bars and X-axis labels */}
      {data.map((item, index) => {
        const barHeight = scale(item.exercises);
        const x = yAxisWidth + index * (effectiveBarWidth + effectiveMarginWidth);
        const y = chartHeight - barHeight - xAxisHeight;

        return (
          <g key={index}>
            <title>{`${item.name}: ${item.exercises} exercises`}</title>
            <rect
              x={x}
              y={y}
              width={effectiveBarWidth}
              height={barHeight}
              fill="#00F5D4"
              rx="2"
            />
            <text
              x={x + effectiveBarWidth / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              fill="#B3B3B3"
              fontSize="12"
            >
              {item.name}
            </text>
          </g>
        );
      })}
      
      {/* Y-axis labels */}
      <text x={yAxisWidth - 8} y="15" textAnchor="end" fill="#B3B3B3" fontSize="12">{Math.ceil(maxValue)}</text>
      <line x1={yAxisWidth} x2={chartWidth} y1={chartHeight - xAxisHeight} y2={chartHeight - xAxisHeight} stroke="#4A4A4A" strokeWidth="1" />

    </svg>
  );
};

export default SimpleBarChart;
