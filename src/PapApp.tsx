import { App, ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "appRedux";
import { THEME_ANTD, THEME_STYLED } from "core/theme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ROUTES from "common/routes";
import locale from "antd/es/locale/en_US";
import { ThemeProvider } from "styled-components";
import VideoCall from "modules/VideoCall";
import "./App.css";
// import {
//   // isLocalhost,
//   isMobileDevice,
//   isSupportedBrowser,
// } from 'utils/deviceModel';

function PAPApp() {
  // const mobileDevice = isMobileDevice();

  // const supportedBrowser = isSupportedBrowser();

  // const isShowModal = mobileDevice && !supportedBrowser;

  return (
    <Provider store={store}>
      <ConfigProvider theme={THEME_ANTD} locale={locale}>
        <App>
          <ThemeProvider theme={THEME_STYLED}>
            <VideoCall />
            <BrowserRouter>
              <Routes>
                {ROUTES.map((route) => (
                  <Route
                    key={route.key}
                    path={route.path}
                    Component={route.Component}
                  />
                ))}
              </Routes>
            </BrowserRouter>
            {/* <Modal open={isShowModal} title={null} footer={null}>
              <h2>
                Bạn vui lòng truy cập ứng dụng trên trình duyệt Chrome hoặc
                Safari của thiết bị di động. Nhấn vào dấu “…” ở góc phải màn
                hình xong chọn “Mở bằng trình duyệt” để tiếp tục tham gia chương
                trình.
              </h2>
            </Modal> */}
          </ThemeProvider>
        </App>
      </ConfigProvider>
    </Provider>
  );
}

export default PAPApp;
