import React, { useState, useEffect, useCallback } from "react";
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

const UserResults = () => {
  const { language } = useLanguage();
  const t = (en, fa) => (language === 'en' ? en : fa);
  const dir = language === 'en' ? 'ltr' : 'rtl';
  const isDesktop = useIsDesktop(992);

  const columns = [
    { name: t('Username', 'نام کاربری'), selector: (row) => row.username, sortable: true, width: '180px' },
    { name: t('Age', 'سن'), selector: (row) => row.age, sortable: true, width: '80px' },
    { name: t('Gender', 'جنسیت'), selector: (row) => (row.gender === 'female' ? t('female', 'زن') : t('male', 'مرد')), sortable: true, width: '110px' },
    { name: t('Test Number', 'شماره آزمون'), selector: (row) => row.test_number, sortable: true, width: '120px' },
    { name: t('Attempt', 'تلاش'), selector: (row) => row.attempt_number, sortable: true, width: '100px' },
    { name: t('Round 1 Score', 'امتیاز دور ۱'), selector: (row) => row.round1 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 2 Score', 'امتیاز دور ۲'), selector: (row) => row.round2 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 3 Score', 'امتیاز دور ۳'), selector: (row) => row.round3 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 4 Score', 'امتیاز دور ۴'), selector: (row) => row.round4 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 5 Score', 'امتیاز دور ۵'), selector: (row) => row.round5 ?? '-', sortable: true, width: '130px' },
    { name: t('Test Time', 'تاریخ آزمون'), selector: (row) => row.test_time, sortable: true, width: '230px' },
    { name: t('Approved', 'تایید شده'), selector: (row) => (row.approved === 'Yes' ? t('Yes', 'بله') : t('No', 'خیر')), sortable: true, width: '130px' },
    { name: t('Total Score', 'مجموع امتیاز'), selector: (row) => row.total_score, sortable: true, width: '140px' },
  ];

  const [adminInfo, setAdminInfo] = useState({ username: '', profile_photo: '' });
  const [filters, setFilters] = useState({ username: "", test_number: "", test_time: "" });
  const [data, setData] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

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

  // fetch and group user results
  const fetchData = useCallback(async () => {
    try {
      let testTime = filters.test_time;
      if (testTime && !testTime.includes('seconds')) testTime = testTime + ':00';
      const formattedFilters = { ...filters, test_time: testTime || '' };
      const query = new URLSearchParams(formattedFilters).toString();
      const response = await fetch(`/api/admin/user-results?${query}`);
      if (response.ok) {
        const result = await response.json();
        const rows = result.map((item) => ({
          ...item,
          id: `${item.username}-${item.test_number}-${item.attempt_number}`,
          test_time: item.test_time ? new Date(item.test_time).toLocaleString() : ''
        }));
        setData(rows);
        const uniqueUsers = [...new Set(result.map((item) => item.username))];
        setUserOptions(uniqueUsers);
      }
    } catch (err) {
      console.error(language === 'en' ? 'Fetch error:' : 'خطا در واکشی اطلاعات', err);
    }
  }, [filters, language]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleReset = () => setFilters({ username: "", test_number: "", test_time: "" });

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

  return (
    <div className="container-fluid profile" dir={dir}>
      <div className="row">
        <div className="col-12 col-lg-1 sidebar px-0 pt-5 pb-5 d-flex flex-column align-items-center">
          <ProfileImageUpload
            onChange={handlePhotoChange}
            source={adminInfo.profile_photo ? `${BASE_URL}/static/profile_photos/${adminInfo.profile_photo}` : "../images/profile.png"}
          />
          <h5 className="text-center mt-3 mb-0">{t('admin', 'مدیر')}</h5>
        </div>

        <div className="col-12 col-lg-11 py-5 px-3 px-lg-5">
          <div className="px-0 px-md-2 py-3 py-md-5">
            <h3 className="mb-4 mb-md-5">{t('User Results', 'نتایج کاربران')}</h3>

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
                  type="datetime-local"
                  onChange={handleChange}
                  value={filters.test_time}
                />
                <select
                  className="form-control"
                  name="username"
                  value={filters.username}
                  onChange={handleChange}
                >
                  <option value="">{t('All Users', 'تمام کاربران')}</option>
                  {userOptions.map((username, idx) => (
                    <option key={idx} value={username}>{username}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleReset}>
                  {t('Reset', 'حذف فیلترها')}
                </button>
              </div>
            </form>

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
                noDataComponent={t('There are no records to display', 'هیچ داده ای برای نمایش وجود ندارد.')}
                customStyles={{
                  table: { style: { padding: '20px 40px' } },
                  headCells: { style: { paddingLeft: '8px', paddingRight: '8px' } },
                  cells: { style: { paddingLeft: '18px', paddingRight: '8px' } },
                }}
              />
            ) : (
              <section aria-label={t('User results', 'نتایج کاربران')}>
                {data.length === 0 ? (
                  <p className="text-muted mt-3">{t('There are no records to display', 'هیچ داده ای برای نمایش وجود ندارد.')}</p>
                ) : (
                  <div className="cards-grid">
                    {data.map((row) => {
                      const approved = row.approved === 'Yes';
                      const rounds = [1, 2, 3, 4, 5].map((n) => ({ n, v: row[`round${n}`] ?? '—' }));
                      const gLabel = row.gender === 'female' ? t('female', 'زن') : t('male', 'مرد');
                      return (
                        <article key={`${row.username}-${row.test_number}`} className="result-card" aria-label={t('Result card', 'کارت نتیجه')}>
                          <header className="card-head">
                            <div className="title-wrap">
                              <span className="hash"><GoHash aria-hidden /></span>
                              <h5 className="title mb-0">{t('Test', 'آزمون')} {row.test_number}</h5>
                            </div>
                            <div className="head-meta">
                              <span className={`badge ${approved ? 'badge-yes' : 'badge-no'}`}>
                                {approved ? (<><GoCheckCircle aria-hidden /> {t('Approved', 'تایید شده')}</>) : (<><GoXCircle aria-hidden /> {t('Not approved', 'تایید نشده')}</>)}
                              </span>
                              <span className="chip chip-score" title={t('Total Score', 'مجموع امتیاز')}><GoTrophy aria-hidden className="me-1" /> {row.total_score}</span>
                            </div>
                          </header>

                          {/* Identity row */}
                          <div className="px-3 pt-2 pb-1 d-flex flex-wrap gap-2 align-items-center">
                            <span className="chip"><LuUser aria-hidden /> {row.username}</span>
                            <span className="chip">{t('Age', 'سن')}: {row.age}</span>
                            <span className="chip">{t('Gender', 'جنسیت')}: {gLabel}</span>
                          </div>

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

export default UserResults;
