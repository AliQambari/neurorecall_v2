import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import ProfileImageUpload from "./ProfileImageUpload";
import { useLanguage } from './LanguageContext';
import {
  GoCheckCircle,
  GoXCircle,
  GoClock,
  GoHash,
  GoTrophy,
} from "react-icons/go";
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

    // Fallback for older browsers (no deprecated addListener)
    window.addEventListener('resize', onResizeFallback);
    setIsDesktop(mq.matches);
    return () => window.removeEventListener('resize', onResizeFallback);
  }, [query, breakpoint]);

  return isDesktop;
}

const UserProfileHome = () => {
  const [filters, setFilters] = useState({ test_number: '', test_time: '' });
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState([]);
  const { language } = useLanguage();
  const isDesktop = useIsDesktop(992);

  const t = (en, fa) => (language === 'en' ? en : fa);

  const columns = [
    { name: t('Test Number', 'شماره آزمون'), selector: (row) => row.test_number, sortable: true, width: '130px' },
    { name: t('Attempt', 'تلاش'), selector: (row) => row.attempt_number, sortable: true, width: '110px' },
    { name: t('Round 1 Score', 'امتیاز دور ۱'), selector: (row) => row.round1 ?? '-', sortable: true, width: '140px' },
    { name: t('Round 2 Score', 'امتیاز دور ۲'), selector: (row) => row.round2 ?? '-', sortable: true, width: '140px' },
    { name: t('Round 3 Score', 'امتیاز دور ۳'), selector: (row) => row.round3 ?? '-', sortable: true, width: '140px' },
    { name: t('Round 4 Score', 'امتیاز دور ۴'), selector: (row) => row.round4 ?? '-', sortable: true, width: '140px' },
    { name: t('Round 5 Score', 'امتیاز دور ۵'), selector: (row) => row.round5 ?? '-', sortable: true, width: '140px' },
    { name: t('Test End Time', 'زمان پایان آزمون'), selector: (row) => row.test_time, sortable: true, width: '200px' },
    { name: t('Approved', 'تایید شده'), selector: (row) => (row.approved === 'Yes' ? t('Yes', 'بله') : t('No', 'خیر')), sortable: true, width: '110px' },
    { name: t('Total Score', 'مجموع امتیاز'), selector: (row) => row.total_score, sortable: true, width: '130px' },
  ];

  useEffect(() => {
    const load = async () => {
      const formattedFilters = { ...filters };
      if (formattedFilters.test_time) {
        formattedFilters.test_time = `${formattedFilters.test_time}T00:00:00`;
      }
      const qs = new URLSearchParams(formattedFilters).toString();
      const res = await fetch(`/api/user-profile?${qs}`);
      const result = await res.json();
      if (res.ok) {
        const rows = result.scores.map((item) => ({
          ...item,
          id: `${item.test_number}-${item.attempt_number}`,
          test_time: item.test_time ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tehran'
          }).format(new Date(item.test_time)) : ''
        }));
        setUserData(result.user);
        setData(rows);
      }
    };
    load();
  }, [filters, language]);

  const onChange = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onReset = () => setFilters({ test_number: '', test_time: '' });

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', userData.id);
    const res = await fetch('/api/upload-profile-photo', { method: 'POST', body: formData });
    if (res.ok) {
      const result = await res.json();
      setUserData((prev) => ({ ...prev, profile_photo: result.photo }));
    } else {
      alert(t('Upload failed.', 'خطا در آپلود!'));
    }
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';

  return (
    <div className="container-fluid profile" dir={dir}>
      <div className="row">
        <div className="col-12 col-lg-1 sidebar px-0 pt-5 pb-5 d-flex flex-column align-items-center">
          <ProfileImageUpload
            onChange={handlePhotoChange}
            source={userData.profile_photo
              ? `/static/profile_photos/${userData.profile_photo}`
              : "../images/profile.png"}
          />
          <h5 className="text-center mt-3 mb-0">{userData.username ? userData.username : ""}</h5>
        </div>

        <div className="col-12 col-lg-11 py-5 px-3 px-lg-5">
          <div className="px-0 px-md-2 py-3 py-md-5">
            <h3 className="mb-4 mb-md-5">{t('Test Results', 'نتایج آزمون ها')}</h3>

            {/* Filters */}
            <form className="profile-filters" onSubmit={(e) => e.preventDefault()}>
              <div className="filters-grid">
                <div className="form-floating mb-3">
                  <select
                    name="test_number"
                    className="form-control search-input"
                    onChange={onChange}
                    value={filters.test_number}
                  >
                    <option value="">{t('All Tests', 'همه آزمون ها')}</option>
                    <option value="1">{t('Test 1', 'آزمون ۱')}</option>
                    <option value="2">{t('Test 2', 'آزمون ۲')}</option>
                    <option value="3">{t('Test 3', 'آزمون ۳')}</option>
                    <option value="4">{t('Test 4', 'آزمون ۴')}</option>
                  </select>
                  <label className="fw-bold">{t('Filter By Test Number', 'فیلتر بر اساس شماره آزمون')}</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="test_time_filter"
                    name="test_time"
                    className="form-control search-input"
                    type="date"
                    onChange={onChange}
                    onInput={onChange}
                    onBlur={onChange}
                    value={filters.test_time}
                  />
                  <label htmlFor="test_time_filter" className="fw-bold">
                    {t('Filter by Test Date', 'فیلتر بر اساس تاریخ آزمون')}
                  </label>
                </div>
                <button onClick={onReset} className="btn btn-primary px-3">
                  {t('Reset', 'حذف فیلترها')}
                </button>
              </div>
            </form>

            {/* Desktop: table view; Mobile/Tablet: card grid */}
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
              <section key={`mobile-${JSON.stringify(filters)}`} aria-label={t('Test results', 'نتایج آزمون')}>
                {data.length === 0 ? (
                  <p className="text-muted mt-3">{t('There are no records to display', 'هیچ داده ای برای نمایش وجود ندارد.')}</p>
                ) : (
                  <div className="cards-grid">
                    {data.map((row) => {
                      const approved = row.approved === 'Yes';
                      const rounds = [1, 2, 3, 4, 5].map((n) => ({ n, v: row[`round${n}`] ?? '—' }));
                      return (
                        <article key={row.id} className="result-card" aria-label={t('Test card', 'کارت آزمون')}>
                          <header className="card-head">
                            <div className="title-wrap">
                              <span className="hash">
                                <GoHash aria-hidden />
                              </span>
                              <h5 className="title mb-0">
                                {t('Test', 'آزمون')} {row.test_number}
                              </h5>
                            </div>
                            <div className="head-meta">
                              <span className={`badge ${approved ? 'badge-yes' : 'badge-no'}`}>
                                {approved ? (
                                  <>
                                    <GoCheckCircle aria-hidden /> {t('Approved', 'تایید شده')}
                                  </>
                                ) : (
                                  <>
                                    <GoXCircle aria-hidden /> {t('Not approved', 'تایید نشده')}
                                  </>
                                )}
                              </span>
                              <span className="chip chip-score" title={t('Total Score', 'مجموع امتیاز')}>
                                <GoTrophy aria-hidden className="me-1" /> {row.total_score}
                              </span>
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
                              <GoClock aria-hidden />
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

export default UserProfileHome;
