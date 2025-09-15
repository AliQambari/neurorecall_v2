import React, { useState, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { LuBell, LuBellRing, LuCheck, LuCheckCheck, LuX } from 'react-icons/lu';
import './NotificationBell.css';
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

  // Pass language to positioning logic
  const positioningProps = { language };

  // ✅ Determine if on home page
  const onHome = location.pathname === "/";

  // Dynamic color logic
  const iconColor = onHome ? "white" : "#2d4059 "; // white on home, black elsewhere


  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/notifications/count', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error(language === "en" ? 'Error fetching unread count:' : "خطا در واکشی تعداد اعلان های خوانده نشده.", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications?limit=10', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(language === "en" ? 'Error fetching notifications:' : "خطا در واکشی اعلان ها.", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(language === "en" ? 'Error marking notification as read:' : "خطا در نشان کردن اعلان به عنوان خوانده شده.", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(language === "en" ? 'Error marking all notifications as read:' : "خطا در نشان کردن همه اعلان ها به عنوان خوانده شده", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString + 'Z');
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === "en" ? 'Just now' : "همین الان";
    if (diffInMinutes < 60) return language === "en" ? `${diffInMinutes}m ago` : `دقیقه پیش${diffInMinutes}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return language === "en" ? `${diffInHours}h ago` : `ساعت پیش${diffInHours}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return language === "en" ? `${diffInDays}d ago` : `روز پیش${diffInDays}`;
  };

  // Format notification message (extract English part for display)
  const formatMessage = (message) => {
    // If message contains bilingual format, extract English part
    if (message.includes(' | ')) {
      return message.split(' | ')[0];
    }
    return message;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? (
          <>
            <LuBellRing className="notification-icon active" style={{ color: iconColor }}/>
            <span 
              className="notification-text"
              style={{ color: iconColor }}
            >
              {language === "en" ? "Notifications" : "اعلان ها" }
            </span>
          </>
        ) : (
          < >
            <LuBell className="notification-icon" style={{ color: iconColor, marginInlineEnd: "0.5rem" }} />
            <span 
              className="notification-text"
              style={{ color: iconColor }}
            >
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
              
              // Desktop positioning
              const dropdownWidth = 320;
              
              if (isRTL) {
                // RTL: align dropdown to left edge of button
                let leftPos = rect.left;
                // Ensure it doesn't go off screen
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
                // LTR: align dropdown to right edge of button
                let rightPos = window.innerWidth - rect.right;
                // Ensure it doesn't go off screen
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
            })()
            }
          >
            <div className="notification-header">
            <h4>{language === "en" ? "Notifications" : "اعلان ها" }</h4>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title={language === "en" ? "Mark all as read" : "نشان گذاری همه به عنوان خوانده شده" }
                >
                  <LuCheckCheck style={{ color: iconColor }}/>
                </button>
              )}
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <LuX style={{ color: iconColor }}/>
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">{language === "en" ? "Loading..." : "در حال بارگذاری..." }</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">{language === "en" ? "No notifications" : "اعلانی یافت نشد" }</div>
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
                      title={language === "en" ? "Mark as read" : "نشان گذاری به عنوان خوانده شده" }
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
              <small>{notifications.length} recent notifications</small>
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