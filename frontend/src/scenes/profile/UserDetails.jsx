import React, { useMemo } from "react";
import { useLanguage } from '../../components/LanguageContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import "../../styles/UserDetails.css";


const UserDetails = ({ data, selectedUser }) => {
  const { language } = useLanguage();
  const t = (en, fa) => (language === 'en' ? en : fa);

  // Filter data for the selected user
  const filteredData = useMemo(() => {
    if (!selectedUser) return [];
    return data.filter(item => item.username === selectedUser);
  }, [data, selectedUser]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData
      .sort((a, b) => new Date(a.test_time_raw) - new Date(b.test_time_raw))
      .map((row, index) => ({
        id: index,
        test_label: `${row.test_number}.${row.attempt_number}`,
        total_score: row.total_score === "N/A" ? 0 : Number(row.total_score),
      }));
  }, [filteredData]);

  // Calculate average total score for reference line
  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, d) => sum + d.total_score, 0);
    return total / chartData.length;
  }, [chartData]);

  if (chartData.length === 0) {
    return <p className="text-muted">{t('No test results available for this user.', 'هیچ نتیجه‌ای برای این کاربر موجود نیست.')}</p>;
  }

  return (
    <div className="mt-3 mb-6 p-3 bg-light rounded shadow-sm">
      <h4 className="my-4 mx-4 header-text">
        {t('Total Score Progression', 'پیشرفت')} - {selectedUser}
      </h4>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          <XAxis 
            dataKey="test_label"
            label={{
              value: t('Test.Attempt', 'آزمون.تلاش'),
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: 12, fontWeight: 'bold' }
            }}
            tick={{ fill: '#666', fontSize: 10, angle: -45, textAnchor: 'end' }}
            stroke="#333"
          />
          
          <YAxis 
            label={{
              value: t('Total Score', 'مجموع امتیاز'),
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fontWeight: 'bold' }
            }} 
            tick={{ fill: '#666', fontSize: 11 }}
            stroke="#333"
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}
            formatter={(value) => [value, t('Total Score', 'مجموع امتیاز')]} 
            labelFormatter={(label) => `${t('Test.Attempt', 'آزمون.تلاش')} ${label}`}
          />
          
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 14, fontWeight: 'bold' }} />
          
          <Area
            type="monotone"
            dataKey="total_score"
            stroke="#2d4059"
            fill="#2d4059"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: '#4dabf7', strokeWidth: 2, r: 5, stroke: '#fff' }}
            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }}
          />
          
          <ReferenceLine
            y={averageScore}
            label={`Avg: ${averageScore.toFixed(1)}`}
            stroke="red"
            strokeDasharray="3 3"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="text-center mt-3 mb-5">
        <span className="badge-style fs-6 px-4 py-3">
          {t('Average Total Score', 'میانگین مجموع امتیاز')}: <strong>{averageScore.toFixed(1)}</strong>
        </span>
      </div>
    </div>
  );
};

export default UserDetails;