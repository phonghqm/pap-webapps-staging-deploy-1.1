import { useCallback, useEffect, useMemo, useState } from "react";
import { shallowEqual } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Spin, message } from "antd";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "appRedux";
import PATH from "common/path";
import { Otp } from "core/business";
import Layout from "core/layout";
import { PAPButton, PAPError } from "core/pures";
import { useCoordination, useTrackViewPage } from "hooks";
import { EVENT_NAME } from "utils/googleAnalytics";
import { PATTERN } from "utils/validation";
import InputPhoneFlag from "../components/InputPhoneFlag";
import SupportComponent from "../components/Support";
import { asyncCheckPresentUser, asyncGenerateOtp, asyncLogin } from "../slice";
import { PROFILES_PAGE } from "common/constants";
import { updateSubmitOrUpdateError } from "modules/ApplicationSubmit/slice";
import { preventWhiteSpace } from "utils/helpers";

type FormLoginType = {
  phone: string;
};

export default function LogIn() {
  useTrackViewPage(EVENT_NAME.PAGE_LOG_IN);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();

  const checkPresentUser = useAppSelector(
    (state) => state.auth.presentUserChecking,
    shallowEqual
  );
  const genOtp = useAppSelector((state) => state.auth.otp, shallowEqual);
  const profileAction = useAppSelector(
    (state) => state.auth.profileAction,
    shallowEqual
  );

  const [showOtp, setShowOtp] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isUpdate = searchParams.get("isUpdate") === "true";
  const isOutDate = searchParams.get("outdate") === "true";
  const phone = searchParams.get("phone");
  const currentPage = localStorage.getItem("current_page");
  const [coordination, errorGPS] = useCoordination();

  const submitHandler = useCallback(
    (values: FormLoginType) => {
      const phone =
        values.phone?.length === 9 ? `0${values.phone}` : values.phone;
      return dispatch(asyncCheckPresentUser({ phone }))
        .unwrap()
        .then(() => setShowOtp(true));
    },
    [dispatch]
  );

  const loading = useMemo(
    () => checkPresentUser.loading || genOtp.loading,
    [checkPresentUser.loading, genOtp.loading]
  );

  const error = useMemo(
    () => checkPresentUser?.error || genOtp?.error || null,
    [checkPresentUser.error, genOtp.error]
  );
  const renderUpdateDestination = useCallback((current_page: string | null) => {
    if (!current_page) return PATH.RESULT;
    if (current_page === PROFILES_PAGE) {
      return `/submit/profiles?isCaching=true`;
    }
    if (Number.isInteger(Number(current_page))) {
      return `/submit/form/${current_page}`;
    }
    return PATH.RESULT;
  }, []);

  const onHandleOTP = useCallback(
    (otp_code: string, callback: () => void) => {
      dispatch(
        asyncLogin({
          phone: genOtp.phone || "",
          otp_code,
          coordination: errorGPS ? null : coordination.join(","),
        })
      )
        .unwrap()
        .then(() => {
          callback();
          setShowOtp(false);
          isUpdate
            ? navigate(renderUpdateDestination(currentPage))
            : navigate(PATH.RESULT);
        })
        .then(() => {
          dispatch(updateSubmitOrUpdateError(null));
        });
    },
    [dispatch, genOtp.phone, navigate, coordination]
  );

  const onResendOTP = useCallback(
    (callback?: () => void) => {
      dispatch(asyncGenerateOtp({ phone: checkPresentUser.phone || "" }))
        .unwrap()
        .then(callback);
    },
    [dispatch, checkPresentUser.phone]
  );

  useEffect(() => {
    if (isUpdate || isOutDate) {
      message.error(t("TOKEN_EXPIRED"));
    }
  }, [isUpdate, isOutDate]);

  useEffect(() => {
    localStorage.removeItem("auth");
    localStorage.removeItem("notSubmitApplicationToken");
    localStorage.removeItem("isSubmitApplication");
    localStorage.removeItem("phone");
  }, []);

  return (
    // <Spin spinning={fetchingProfiles}>
    <Spin spinning={profileAction?.loading}>
      <Layout linkLogo="/" back={() => navigate(PATH.HOME)}>
        <LogInFormContainer>
          <div>
            <LogInTitle>{t("LOGIN")}</LogInTitle>
            <Form
              initialValues={{ phone: phone }}
              form={form}
              onFinish={submitHandler}
              layout="vertical"
            >
              <Form.Item<FormLoginType>
                name="phone"
                label={t("PHONE")}
                rules={[
                  {
                    required: true,
                    message: t("PHONE_REQUIRED"),
                  },
                  {
                    pattern: PATTERN.PHONE_PREFIX,
                    message: t("INVALID_PHONE"),
                  },
                ]}
              >
                <InputPhoneFlag
                  isTel
                  placeholder={t("INPUT_REGISTER_PHONE")}
                  autoFocus
                  onKeyDown={preventWhiteSpace}
                />
              </Form.Item>
              <PAPError error={error} />
              <LoginButtonContainer>
                <LogInButton
                  gaTrack={{
                    event: EVENT_NAME.BTN_LOG_IN,
                    properties: {
                      phone: form.getFieldValue("phone"),
                    },
                  }}
                  htmlType="submit"
                  type="primary"
                  loading={loading}
                >
                  {t("LOGIN")}
                </LogInButton>
              </LoginButtonContainer>
              <NavigateSignUp>
                {t("YOU_HAVENT_AN_ACC")}{" "}
                <SignUpLink to={PATH.SIGNUP}>
                  {t("SIGN_UP_NOW_TO_JOIN")}
                </SignUpLink>
              </NavigateSignUp>
            </Form>
          </div>
          <SupportComponent />
        </LogInFormContainer>
        <Otp
          isOpen={showOtp}
          onClose={() => setShowOtp(false)}
          onNext={onHandleOTP}
          onResend={onResendOTP}
          loading={profileAction.loading}
          error={profileAction.error}
        />
      </Layout>
    </Spin>
  );
}

const LogInFormContainer = styled.div`
  text-align: center;
  width: 24rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100dvh - 300px);

  @media screen and (max-height: 760px) {
    height: calc(100dvh - 100px);
  }

  @media screen and (max-width: 540px) {
    width: unset;
    margin-inline: 1rem;
  }
`;

const LogInTitle = styled.h2`
  margin-block-start: 3rem;
  margin-block-end: 3rem;

  @media screen and (max-height: 760px) {
    margin-block-start: 1.5rem;
    margin-block-end: 1rem;
  }

  @media screen and (max-width: 540px) {
    margin-block-start: 1.5rem;
    margin-block-end: 1rem;
  }
`;

const LogInButton = styled(PAPButton)`
  margin-block: 1rem;
  width: 100%;
`;

const LoginButtonContainer = styled.div`
  margin-top: 2rem;

  @media screen and (max-height: 760px) {
    margin-top: 1rem;
  }
`;

const NavigateSignUp = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 1.5rem;
  display: block;
`;

const SignUpLink = styled(Link)`
  color: ${(props) => props.theme.colorPrimary};
  text-decoration: none;
`;
