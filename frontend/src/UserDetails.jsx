import React from "react";
import { useLanguage } from './LanguageContext';


import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Fragment } from "react";

const UserDetails = ({ data }) => {
  const { language } = useLanguage();
  const t = (en, fa) => (language === 'en' ? en : fa);

  // const [showModal, setShowModal] = useState(false);
  // const [selectedRow, setSelectedRow] = useState(null);


  // Prepare chart data: total scores over tests, sorted by test_time for progression
  const chartData = data
    .sort((a, b) => new Date(a.test_time) - new Date(b.test_time))
    .map((row, index) => ({
      id: index,
      test_label: `${row.test_number}.${row.attempt_number}`,
      total_score: row.total_score
    }));

  // Calculate average total score for reference line
  const averageScore = chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.total_score, 0) / chartData.length : 0;

  return (
    <Fragment>
      {/* Enhanced Area Chart for Total Score Progression */}
      {chartData.length > 0 && (
        <div className="mb-4 p-3 bg-light rounded shadow-sm">
          <h4 className="mb-3 text-primary">{t('Total Score Progression', 'پیشرفت')}</h4>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="test_label"
                      label={{ value: t('Test.Attempt', 'آزمون.تلاش'), position: 'insideBottom', offset: -10, style: { fontSize: 12, fontWeight: 'bold' } }}
                      tick={{ fill: '#666', fontSize: 10, angle: -45, textAnchor: 'end' }}
                      stroke="#333" />
              <YAxis label={{ value: t('Total Score', 'مجموع امتیاز'), angle: -90, position: 'insideLeft', style: { fontSize: 12, fontWeight: 'bold' } }} 
                      tick={{ fill: '#666', fontSize: 11 }} 
                      stroke="#333" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}
                formatter={(value, name, props) => [value, t('Total Score', 'مجموع امتیاز')]} 
                labelFormatter={(label) => `${t('Test.Attempt', 'آزمون.تلاش')} ${label}`}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 14, fontWeight: 'bold' }} />
              <Area type="monotone" 
                    dataKey="total_score" 
                    stroke="#4dabf7" 
                    fill="#4dabf7" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    dot={{ fill: '#4dabf7', strokeWidth: 2, r: 5, stroke: '#fff' }}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }} 
              />
              <ReferenceLine y={averageScore} label={`Average: ${averageScore.toFixed(1)}`} stroke="red" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="badge bg-info fs-6 p-2">
              {t('Average Total Score', 'میانگین مجموع امتیاز')}: <strong>{averageScore.toFixed(1)}</strong>
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default UserDetails;