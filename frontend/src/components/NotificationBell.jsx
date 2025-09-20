// NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LuBell, LuBellRing, LuCheck, LuCheckCheck, LuX } from 'react-icons/lu';
import '../styles/NotificationBell.css';
import { useLocation } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();

  const { language } = useLanguage();
  const dir = language === 'en' ? 'ltr' : 'rtl';

  const onHome = location.pathname === "/";
  const iconColor = onHome ? "white" : "#2d4059";

  // Fetch unread count and poll every 30s.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/admin/notifications/count', {
          credentials: 'include',
          signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        setUnreadCount(Number(data.count ?? 0));
      } catch (err) {
        // If aborted, ignore. Otherwise log a simple, non-localized message to avoid capturing `language`.
        if (err.name === 'AbortError') return;
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  // Fetch notifications (called when opening the dropdown)
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications?limit=10', {
        credentials: 'include'
      });
      if (!response.ok) return;
      const data = await response.json();
      console.log(data);
      setNotifications(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Toggle dropdown; fetch notifications only when opening.
  const toggleDropdown = () => {
    setIsOpen(prev => {
      const nextOpen = !prev;
      if (!prev && nextOpen) {
        fetchNotifications();
      }
      return nextOpen;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.querySelector('.notification-dropdown');

      // Check if click was on the button or inside the modal
      const clickedInsideButton = dropdownRef.current?.contains(event.target);
      const clickedInsideModal = dropdownElement?.contains(event.target);

      if (!clickedInsideButton && !clickedInsideModal) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return language === "en" ? 'Just now' : "همین الان";
    if (diffInMinutes < 60) return language === "en" ? `${diffInMinutes}m ago` : `${diffInMinutes} دقیقه پیش`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return language === "en" ? `${diffInHours}h ago` : `${diffInHours} ساعت پیش`;

    const diffInDays = Math.floor(diffInHours / 24);
    return language === "en" ? `${diffInDays}d ago` : `${diffInDays} روز پیش`;
  };

  const formatMessage = (message) => {
    if (!message) return '';
    if (message.includes(' | ')) {
      if (language === "en") return message.split(' | ')[0];
      else return message.split(' | ')[1];
    }
    return message;
  };

  return (
    <div className="notification-bell" ref={dropdownRef} dir={dir}>
      <button
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? (
          <>
            <LuBellRing className="notification-icon active" style={{ color: iconColor }}/>
            <span className="notification-text" style={{ color: iconColor }}>
              {language === "en" ? "Notifications" : "اعلان ها" }
            </span>
          </>
        ) : (
          <>
            <LuBell className="notification-icon" style={{ color: iconColor, marginInlineEnd: "0.5rem" }} />
            <span className="notification-text" style={{ color: iconColor }}>
              {language === "en" ? "Notifications" : "اعلان ها" }
            </span>
          </>
        )}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && createPortal(
        <>
          <div className="notification-backdrop d-md-none" onClick={() => setIsOpen(false)} />
          <div
            className="notification-dropdown notification-portal"
            dir={dir}
            style={(() => {
              if (!dropdownRef.current) return { zIndex: 999999 };

              const rect = dropdownRef.current.getBoundingClientRect();
              const isRTL = language === 'fa';
              const isMobile = window.innerWidth <= 768;

              if (isMobile) {
                return {
                  position: 'fixed',
                  top: '5px',
                  left: '5px',
                  right: '5px',
                  width: 'auto',
                  maxHeight: '90vh',
                  zIndex: 999999
                };
              }

              const dropdownWidth = 320;

              if (isRTL) {
                let leftPos = rect.left;
                if (leftPos + dropdownWidth > window.innerWidth) {
                  leftPos = window.innerWidth - dropdownWidth - 10;
                }
                return {
                  position: 'fixed',
                  top: rect.bottom + 5,
                  left: leftPos,
                  zIndex: 999999
                };
              } else {
                let rightPos = window.innerWidth - rect.right;
                if (rect.right - dropdownWidth < 0) {
                  rightPos = 10;
                }
                return {
                  position: 'fixed',
                  top: rect.bottom + 5,
                  right: rightPos,
                  zIndex: 999999
                };
              }
            })()}
          >
            <div className="notification-header">
              <h4>{language === "en" ? "Notifications" : "اعلان ها" }</h4>
              <div className="notification-header-actions">
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                    title={language === "en" ? "Mark all as read" : "نشان گذاری همه به عنوان خوانده شده"}
                  >
                    <LuCheckCheck style={{ color: iconColor }} />
                  </button>
                )}
                <button
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <LuX style={{ color: iconColor }} />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">{language === "en" ? "Loading..." : "در حال بارگذاری..."}</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">{language === "en" ? "No notifications" : "اعلانی یافت نشد"}</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <div className="notification-message">
                        {formatMessage(notification.message)}
                      </div>
                      <div className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        className="mark-read-btn"
                        onClick={() => markAsRead(notification.id)}
                        title={language === "en" ? "Mark as read" : "نشان گذاری به عنوان خوانده شده"}
                      >
                        <LuCheck />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <small>{notifications.length} {language === "en" ? "recent notifications" : "اعلان جدید"}</small>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;
