import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { MembershipTier, membershipTiers } from "../../types/membership";

interface Member {
  membership_type: MembershipTier;
}

interface MembershipPieChartProps {
  members: Member[];
}

const MembershipPieChart: React.FC<MembershipPieChartProps> = ({ members }) => {
  // Calculate data for pie chart
  const membershipCounts = members.reduce((acc, member) => {
    const type = member.membership_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<MembershipTier, number>);

  // Transform data for recharts
  const chartData = Object.entries(membershipCounts).map(([type, count]) => ({
    name: membershipTiers[type as MembershipTier].name,
    value: count,
    color: membershipTiers[type as MembershipTier].color,
    percentage: ((count / members.length) * 100).toFixed(1),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value} ({chartData[index]?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No membership data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 pl-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MembershipPieChart;
