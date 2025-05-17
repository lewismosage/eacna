import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card, { CardContent } from "../../components/common/Card";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MemberEngagement: React.FC = () => {
  const data = days.map((day, i) => ({
    day,
    logins: [12, 18, 9, 14, 20, 25, 22][i],
  }));

  return (
    <Card className="w-full">
      <CardContent>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Member Engagement
        </h2>

        <div className="flex flex-col space-y-6">
          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Forum Posts
                  </h3>
                  <p className="text-2xl font-bold text-blue-900 mt-1">45</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Event Signups
                  </h3>
                  <p className="text-2xl font-bold text-green-900 mt-1">23</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Logins This Week
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="logins"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberEngagement;
