import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
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
    { name: t('Username', 'نام کاربری'), selector: (row) => <Link to={`/admin/user/${row.username}`}>{row.username}</Link>, sortable: false, width: '180px' },
    { name: t('Age', 'سن'), selector: (row) => row.age, sortable: true, width: '80px' },
    { name: t('Gender', 'جنسیت'), selector: (row) => (row.gender === 'female' ? t('female', 'زن') : t('male', 'مرد')), sortable: true, width: '110px' },
    { name: t('Test Number', 'شماره آزمون'), selector: (row) => row.test_number, sortable: false, width: '120px' },
    { name: t('Attempt', 'تلاش'), selector: (row) => row.attempt_number, sortable: true, width: '100px' },
    { name: t('Round 1 Score', 'امتیاز دور ۱'), selector: (row) => row.round1 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 2 Score', 'امتیاز دور ۲'), selector: (row) => row.round2 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 3 Score', 'امتیاز دور ۳'), selector: (row) => row.round3 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 4 Score', 'امتیاز دور ۴'), selector: (row) => row.round4 ?? '-', sortable: true, width: '130px' },
    { name: t('Round 5 Score', 'امتیاز دور ۵'), selector: (row) => row.round5 ?? '-', sortable: true, width: '130px' },
    { name: t('Test Time', 'تاریخ آزمون'), selector: (row) => row.test_time, sortable: false, width: '230px', id: 'test_time' },
    { name: t('Approved', 'تایید شده'), selector: (row) => (row.approved === 'Yes' ? t('Yes', 'بله') : t('No', 'خیر')), sortable: true, width: '130px' },
    { name: t('Total Score', 'مجموع امتیاز'), selector: (row) => row.total_score, sortable: true, width: '140px' },

  ];

  const [adminInfo, setAdminInfo] = useState({ username: '', profile_photo: '' });
  const [filters, setFilters] = useState({ username: "", test_number: "", test_time: "" });
  const [data, setData] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setData([]);
    try {
      let testTime = filters.test_time;
      if (testTime) {
        testTime = `${testTime}T00:00:00`;
      }
      const formattedFilters = { ...filters, test_time: testTime || '' };
      if (approvedOnly) {
        formattedFilters.approved = 'Yes';
      }
      const query = new URLSearchParams(formattedFilters).toString();
      const response = await fetch(`/api/admin/user-results?${query}`, {
        cache: 'no-cache'
      });
      if (response.ok) {
        const result = await response.json();
        const rows = result.map((item) => ({
          ...item,
          id: `${item.username}-${item.test_number}-${item.attempt_number}`,
          test_time: item.test_time ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tehran'
          }).format(new Date(item.test_time)) : ''
        }));
        setData(rows);
        const uniqueUsers = [...new Set(result.map((item) => item.username))];
        setUserOptions(uniqueUsers);
      }
    } catch (err) {
      console.error(language === 'en' ? 'Fetch error:' : 'خطا در واکشی اطلاعات', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, language, approvedOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFilters({ username: "", test_number: "", test_time: "" });
  };

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
            source={adminInfo.profile_photo ? `/static/profile_photos/${adminInfo.profile_photo}` : "../images/profile.png"}
          />
          <h5 className="text-center mt-3 mb-0">{t('admin', 'مدیر')}</h5>
        </div>

        <div className="col-12 col-lg-11 py-5 px-3 px-lg-5">
          <div className="px-0 px-md-2 py-3 py-md-5">
            <h3 className="mb-3">{t('User Results', 'نتایج کاربران')}</h3>
            <div className="alert alert-info py-2" role="alert">
              {t('Tip: Click a username to view their progress and detailed results.', 'نکته: برای مشاهده روند پیشرفت و جزئیات نتایج هر کاربر روی نام کاربری او کلیک کنید.')}
            </div>

            {/* Filters */}
            <form className="profile-filters" onSubmit={(e) => e.preventDefault()}>
              <div className="filters-grid">
                <div className="form-floating mb-3">
                  <select
                    className="form-control"
                    name="test_number"
                    onChange={handleChange}
                    value={filters.test_number}
                  >
                    <option value="">{t('All Tests', 'همه آزمون ها')}</option>
                    <option value="1">{t('Test 1', 'آزمون ۱')}</option>
                    <option value="2">{t('Test 2', 'آزمون ۲')}</option>
                    <option value="3">{t('Test 3', 'آزمون ۳')}</option>
                    <option value="4">{t('Test 4', 'آزمون ۴')}</option>
                  </select>
                  <label className="fw-bold">{t('Filter by Test Number', 'فیلتر بر اساس شماره آزمون')}</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="test_time_filter"
                    className="form-control"
                    name="test_time"
                    type="date"
                    onChange={handleChange}
                    value={filters.test_time}
                  />
                  <label htmlFor="test_time_filter" className="fw-bold">
                    {t('Filter by Test Date', 'فیلتر بر اساس تاریخ آزمون')}
                  </label>
                </div>
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
                <button type="button" className="btn btn-primary" onClick={handleReset}>
                  {t('Reset', 'حذف فیلترها')}
                </button>
                <button
                  type="button"
                  className={`btn ${approvedOnly ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setApprovedOnly(prev => !prev);
                  }}
                  disabled={loading}
                >
                  {loading ? t('Loading...', 'در حال بارگذاری...') : (approvedOnly ? t('Show All', 'نمایش همه') : t('Approved Only', 'فقط تایید شده'))}
                </button>
              </div>
            </form>

            {/* Desktop: DataTable; Mobile/Tablet: Cards */}
            {isDesktop ? (
              <>
              <DataTable
                className="tableCustom"
                columns={columns}
                data={data}
                defaultSortFieldId="test_time"
                defaultSortAsc={false}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                noDataComponent={loading ? t('Loading...', 'در حال بارگذاری...') : t('There are no records to display', 'هیچ داده ای برای نمایش وجود ندارد.')}
                conditionalRowStyles={[
                  {
                    when: (row) => row.approved === 'Yes',
                    style: {
                      backgroundColor: '#d4edda',
                    },
                  },
                ]}
                customStyles={{
                  table: { style: { padding: '20px 40px' } },
                  headCells: { style: { paddingLeft: '8px', paddingRight: '8px' } },
                  cells: { style: { paddingLeft: '18px', paddingRight: '8px' } },
                }}
              />

              {/* Removed modal here; moved to AdminUserDetail */}
              </>
            ) : (
              <section aria-label={t('User results', 'نتایج کاربران')}>
                {loading ? (
                  <p className="text-muted mt-3">{t('Loading...', 'در حال بارگذاری...')}</p>
                ) : data.length === 0 ? (
                  <p className="text-muted mt-3">{t('There are no records to display', 'هیچ داده ای برای نمایش وجود ندارد.')}</p>
                ) : (
                  <div className="cards-grid">
                    {data.map((row) => {
                      const approved = row.approved === 'Yes';
                      const rounds = [1, 2, 3, 4, 5].map((n) => ({ n, v: row[`round${n}`] ?? '—' }));
                      const gLabel = row.gender === 'female' ? t('female', 'زن') : t('male', 'مرد');
                      return (
                        <article key={`${row.username}-${row.test_number}`} className={`result-card ${approved ? 'approved' : ''}`} aria-label={t('Result card', 'کارت نتیجه')}>
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
                            <span className="chip"><Link to={`/admin/user/${row.username}`}><LuUser aria-hidden /> {row.username}</Link></span>
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

                          <footer className="card-foot d-flex justify-content-between align-items-center">
                            <span className="time">
                              <GoClock aria-hidden />
                              {row.test_time}
                            </span>
                            <Link to={`/admin/user/${row.username}`} className="btn btn-outline-primary btn-sm">
                              {t('View details', 'نمایش جزئیات')}
                            </Link>
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
