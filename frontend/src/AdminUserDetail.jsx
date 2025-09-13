import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useLanguage } from './LanguageContext';
import ProfileImageUpload from "./ProfileImageUpload";
import {
  GoCheckCircle,
  GoXCircle,
  GoClock,
  GoHash,
  GoTrophy,
} from "react-icons/go";
import { LuUser } from "react-icons/lu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import "./UserProfileHome.css";

const BASE_URL = process.env.REACT_APP_API_URL;

function useIsDesktop(breakpoint = 992) {
  const query = `(min-width: ${breakpoint}px)`;
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : true);
  const [isDesktop, setIsDesktop] = useState(getMatch);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(query);
    const onMqChange = () => setIsDesktop(mq.matches);
    const onResizeFallback = () => setIsDesktop(window.innerWidth >= breakpoint);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMqChange);
      setIsDesktop(mq.matches);
      return () => mq.removeEventListener('change', onMqChange);
    }
    window.addEventListener('resize', onResizeFallback);
    setIsDesktop(mq.matches);
    return () => window.removeEventListener('resize', onResizeFallback);
  }, [query, breakpoint]);
  return isDesktop;
}

const AdminUserDetail = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en, fa) => (language === 'en' ? en : fa);
  const dir = language === 'en' ? 'ltr' : 'rtl';
  const isDesktop = useIsDesktop(992);

  const columns = [
    { name: t('Test Number', 'شماره آزمون'), selector: (row) => row.test_number, sortable: true, width: '120px' },
    { name: t('Attempt', 'تلاش'), selector: (row) => row.attempt_number, sortable: true, width: '100px' },
    { name: t('Round 1 Score', 'امتیاز دور ۱'), selector: (row) => row.round1 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 2 Score', 'امتیاز دور ۲'), selector: (row) => row.round2 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 3 Score', 'امتیاز دور ۳'), selector: (row) => row.round3 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 4 Score', 'امتیاز دور ۴'), selector: (row) => row.round4 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 5 Score', 'امتیاز دور ۵'), selector: (row) => row.round5 ?? '-', sortable: true, width: '130px' },
    { name: t('Test Time', 'تاریخ آزمون'), selector: (row) => row.test_time, sortable: true, width: '230px' },
    { name: t('Total Score', 'مجموع امتیاز'), selector: (row) => row.total_score, sortable: true, width: '140px' },
  ];

  const [adminInfo, setAdminInfo] = useState({ username: '', profile_photo: '' });
  const [filters, setFilters] = useState({ test_number: "", test_time: "" });
  const [data, setData] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  // fetch admin info
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await fetch(`/api/admin/current-user`, { credentials: 'include' });
        const json = await res.json();
        if (res.ok) setAdminInfo(json);
      } catch (err) {
        console.error(language === 'en' ? 'Failed to fetch admin info:' : 'خطا در واکشی اطلاعات ادمین', err);
      }
    };
    fetchAdminInfo();
  }, [language]);

  // fetch user info from results or separate endpoint
  useEffect(() => {
    if (data.length > 0) {
      setUserInfo({
        username: data[0].username,
        age: data[0].age,
        gender: data[0].gender
      });
    }
  }, [data]);

  // fetch and group user results
  const fetchData = useCallback(async () => {
    try {
      let testTime = filters.test_time;
      if (testTime) {
        testTime = `${testTime}T00:00`;
      }
      const formattedFilters = { ...filters, test_time: testTime || '' };
      const query = new URLSearchParams(formattedFilters).toString();
      const response = await fetch(`/api/admin/user-results/${username}?${query}`, { credentials: 'include' });
      if (response.ok) {
        const result = await response.json();
        const rows = result.map((item) => ({
          ...item,
          id: `${item.test_number}-${item.attempt_number}`,
          test_time: item.test_time ? new Date(item.test_time).toLocaleString() : ''
        }));
        setData(rows);
      }
    } catch (err) {
      console.error(language === 'en' ? 'Fetch error:' : 'خطا در واکشی اطلاعات', err);
    }
  }, [filters, language, username]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleReset = () => setFilters({ test_number: "", test_time: "" });

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', adminInfo.id);
    const res = await fetch('/api/upload-profile-photo', { method: 'POST', body: formData });
    if (res.ok) {
      const result = await res.json();
      setAdminInfo((prev) => ({ ...prev, profile_photo: result.photo }));
    } else {
      alert(t('Upload failed.', 'خطا در آپلود!'));
    }
  };

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
    <div className="container-fluid profile" dir={dir}>
      <div className="row">
        <div className="col-12 col-lg-1 sidebar px-0 pt-5 pb-5 d-flex flex-column align-items-center">
          <ProfileImageUpload
            onChange={handlePhotoChange}
            source={adminInfo.profile_photo ? `${BASE_URL}/static/profile_photos/${adminInfo.profile_photo}` : "/images/profile.png"}
          />
          <h5 className="text-center mt-3 mb-0">{t('admin', 'مدیر')}</h5>
        </div>

        <div className="col-12 col-lg-11 py-5 px-3 px-lg-5">
          <div className="px-0 px-md-2 py-3 py-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
              <h3>{t('Approved Results for', 'نتایج تایید شده برای')} {username}</h3>
              <button className="btn btn-secondary" onClick={() => navigate('/profile/user-results')}>
                {t('Back to User Results', 'بازگشت به نتایج کاربران')}
              </button>
            </div>

            {/* Filters */}
            <form className="profile-filters" onSubmit={(e) => e.preventDefault()}>
              <div className="filters-grid">
                <input
                  className="form-control"
                  name="test_number"
                  type="text"
                  placeholder={t('Filter by Test Number', 'فیلتر بر اساس شماره آزمون')}
                  onChange={handleChange}
                  value={filters.test_number}
                />
                <input
                  className="form-control"
                  name="test_time"
                  type="date"
                  placeholder={t('Filter by Test Date', 'فیلتر بر اساس تاریخ آزمون')}
                  onChange={handleChange}
                  value={filters.test_time}
                />
                <button className="btn btn-primary" onClick={handleReset}>
                  {t('Reset', 'حذف فیلترها')}
                </button>
              </div>
            </form>

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

            {/* Desktop: DataTable; Mobile/Tablet: Cards */}
            {isDesktop ? (
              <DataTable
                className="tableCustom"
                columns={columns}
                data={data}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                noDataComponent={t('There are no approved records to display', 'هیچ نتیجه تایید شده‌ای برای نمایش وجود ندارد.')}
                customStyles={{
                  table: { style: { padding: '20px 40px' } },
                  headCells: { style: { paddingLeft: '8px', paddingRight: '8px' } },
                  cells: { style: { paddingLeft: '18px', paddingRight: '8px' } },
                }}
              />
            ) : (
              <section aria-label={t('User approved results', 'نتایج تایید شده کاربر')}>
                {data.length === 0 ? (
                  <p className="text-muted mt-3">{t('There are no approved records to display', 'هیچ نتیجه تایید شده‌ای برای نمایش وجود ندارد.')}</p>
                ) : (
                  <div className="cards-grid">
                    {data.map((row) => {
                      const rounds = [1, 2, 3, 4, 5].map((n) => ({ n, v: row[`round${n}`] ?? '—' }));
                      return (
                        <article key={`${row.test_number}`} className="result-card approved" aria-label={t('Approved result card', 'کارت نتیجه تایید شده')}>
                          <header className="card-head">
                            <div className="title-wrap">
                              <span className="hash"><GoHash aria-hidden /></span>
                              <h5 className="title mb-0">{t('Test', 'آزمون')} {row.test_number}</h5>
                            </div>
                            <div className="head-meta">
                              <span className="badge badge-yes">
                                <GoCheckCircle aria-hidden /> {t('Approved', 'تایید شده')}
                              </span>
                              <span className="chip chip-score" title={t('Total Score', 'مجموع امتیاز')}><GoTrophy aria-hidden className="me-1" /> {row.total_score}</span>
                            </div>
                          </header>

                          <div className="card-body">
                            <ul className="rounds">
                              {rounds.map(({ n, v }) => (
                                <li key={n} className="round">
                                  <div className="round-label">{t('Round', 'دور')} {n}</div>
                                  <div className="round-value">{v}</div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <footer className="card-foot">
                            <span className="time">
                              <GoClock aria-hidden style={{marginTop: "2px"}}/>
                              {row.test_time}
                            </span>
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;