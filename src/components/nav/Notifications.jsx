import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Bell, AlertCircle } from 'react-feather';
import Api from 'api';
import NotificationItem from 'components/nav/NotificationItem';
import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const dropdownRef = React.createRef();

  const { t } = useTranslation();
  const history = useHistory();
  const [bullet, setBullet] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [messages, setMessages] = useState([]);

  const fetchData = () => {
    Api.get('users/notifications/')
      .then((resp) => {
        const { data } = resp;
        setAlerts(data.alerts);
        setMessages(data.messages);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setBullet(!!(alerts.length || (messages.length && (
      messages.find((m) => !m.is_read))
    )));
  }, [alerts, messages]);

  const handleClickBell = () => {
    if (dropdownRef.current.classList.contains('show')) {
      fetchData();
    }
  };

  const readAll = () => {
    Api.put('users/notifications/read-all/')
      .then((resp) => {
        setMessages(resp.data);
      });
  };

  const readNotification = (message) => {
    Api.put(`users/notifications/${message.id}/read/`)
      .then((resp) => {
        setMessages(resp.data);
      });
  };

  const deleteNotification = (message) => {
    Api.delete(`users/notifications/${message.id}/delete/`)
      .then((resp) => {
        setMessages(resp.data);
      });
  };

  const onMessageClick = (message) => {
    if (message.link) {
      const url = new URL(message.link);
      if (url.host === window.location.host) {
        history.push(url.pathname + url.search);
        dropdownRef.current.classList.remove('show');
      } else {
        window.open(message.link);
      }
    }
  };

  return (
    <>
      <div
        className={`dropdown-toggle notification ${bullet ? 'notification--bullet' : ''} cursor-pointer`}
        onClick={handleClickBell}
      >
        <Bell className="notification__icon" />
      </div>
      <div
        ref={dropdownRef}
        className="notification-content dropdown-box mt-8 absolute top-0 left-0 sm:left-auto sm:right-0 z-20 -ml-10 sm:ml-0"
      >
        <div className="notification-content__box dropdown-box__content box">
          <div className="notification-content__title border-b-1 pb-2 flex items-center justify-between">
            {t('notifications')}
            <small className="cursor-pointer font-normal text-gray-600" onClick={readAll}>
              {t('markAllAsRead')}
            </small>
          </div>
          <div className="notification-content__body">
            {alerts.map((alert, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={
                  `${alert.link ? 'cursor-pointer' : ''} ` +
                  'relative flex items-center text-theme-6 hover:bg-gray-200'
                }
                style={{ minHeight: 60 }}
              >
                <div className="bg-theme-6 self-stretch w-2" />
                <div
                  className="w-full py-1 px-2"
                  onClick={() => onMessageClick(alert)}
                >
                  {alert.message}
                </div>
                <div className="w-12 h-12 flex-none flex justify-center items-center mr-1 ml-3">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
            ))}
            {messages.map((message) => (
              <NotificationItem
                key={message.id}
                message={message}
                onRead={readNotification}
                onDelete={deleteNotification}
                onClick={() => onMessageClick(message)}
              />
            ))}
            {alerts.length === 0 && messages.length === 0 && (
              <div className="flex justify-center p-5 text-gray-500">
                {t('noNotifications')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Notifications.propTypes = {};

export default Notifications;
