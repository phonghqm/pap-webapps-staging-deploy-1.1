import { Form } from "antd";
import { useAppDispatch, useAppSelector } from "appRedux";
import PATH from "common/path";
import Layout from "core/layout";
import { PAPButton, PAPError, PAPInput } from "core/pures";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { asyncCheckExistingPresentUserPhoneAndPCCode } from "../slice";
import { PATTERN } from "utils/validation";
import { useCallback, useEffect } from "react";
import InputPhoneFlag from "../components/InputPhoneFlag";
import SupportComponent from "../components/Support";
import { useTranslation } from "react-i18next";
import { EVENT_NAME } from "utils/googleAnalytics";
import { useTrackViewPage } from "hooks";
import { shallowEqual } from "react-redux";

function SignUp(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_SIGN_UP);
  const [form] = Form.useForm();

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loading, error] = useAppSelector(
    (state) => [state.auth.signUp.loading, state.auth.signUp.error],
    shallowEqual
  );

  const submitHandler = useCallback(
    (values: any) => {
      const pc_code = values.pc_code?.toLocaleUpperCase();
      const phone =
        values.phone?.length === 9 ? `0${values.phone}` : values.phone;

      dispatch(
        asyncCheckExistingPresentUserPhoneAndPCCode({
          phone,
          pc_code,
        })
      )
        .unwrap()
        .then(() => {
          navigate(PATH.TERM_CONFIRM);
        })
        .catch(() => {});
    },
    [dispatch, navigate]
  );
  useEffect(() => {
    localStorage.removeItem("auth");
    localStorage.removeItem("notSubmitApplicationToken");
    localStorage.removeItem("isSubmitApplication");
  }, []);

  return (
    <Layout linkLogo="/" back={() => navigate(PATH.HOME)}>
      <SignUpFormContainer>
        <div>
          <SignUpTitle>{t("REGISTER_PROGRAM")}</SignUpTitle>
          <Form form={form} onFinish={submitHandler} layout="vertical">
            <Form.Item
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
              />
            </Form.Item>
            <Form.Item
              name="pc_code"
              label={t("REFERRAL_CODE")}
              rules={[
                {
                  required: true,
                  message: t("REFERRAL_REQUIRED"),
                },
                {
                  pattern: /^[a-zA-Z0-9\s.,?!]*$/,
                  message: t("ENGLISH_LETTER_ONLY"),
                },
              ]}
              extra={<ExplainPcCode>{t("PC_CODE_EXPLAIN")}</ExplainPcCode>}
            >
              <PAPInput placeholder={t("INPUT_REFERRAL_CODE")} />
            </Form.Item>
            <Note>
              {t("NOTE")}: {t("NOTE_IN_SIGN_UP")}
            </Note>
            <PAPError error={error} />
            <ButtonContainer>
              <SignUpButton
                gaTrack={{
                  event: EVENT_NAME.BTN_SIGN_UP,
                  properties: {
                    phone: form.getFieldValue("phone"),
                  },
                }}
                htmlType="submit"
                type="primary"
                loading={loading}
              >
                {t("NEW_REGISTER")}
              </SignUpButton>
            </ButtonContainer>
          </Form>
          <NavigateLogin>
            {t("YOU_REGISTERED")}{" "}
            <LoginLink to={PATH.LOGIN}>
              {t("LOGIN_TO_SEE_YOUR_PROFILE")}
            </LoginLink>
          </NavigateLogin>
        </div>
        <SupportComponent />
      </SignUpFormContainer>
    </Layout>
  );
}

export default SignUp;

const SignUpFormContainer = styled.div`
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

const SignUpTitle = styled.h2`
  margin-block-start: 3rem;
  margin-block-end: 3rem;

  @media screen and (max-height: 760px) {
    margin-block-start: 1.5rem;
    margin-block-end: 1rem;
  }
`;

const SignUpButton = styled(PAPButton)`
  margin-block: 1rem;
  width: 100%;
`;

const NavigateLogin = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 1.5rem;
  display: block;
`;

const LoginLink = styled(Link)`
  color: ${(props) => props.theme.colorPrimary};
  text-decoration: none;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;

  @media screen and (max-height: 760px) {
    margin-top: 1rem;
  }
`;

const ExplainPcCode = styled.span`
  font-size: 0.675rem;
  color: ${(props) => props.theme.grey4};
  font-weight: 400;

  @media screen and (max-width: 540px) {
    font-size: 0.625rem;
  }
`;

const Note = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.grey7};
  text-align: justify;
  margin-bottom: 0;
`;
