import { Checkbox, Divider, Modal, Tag } from "antd";
import {
  HOTLINE,
  SCHEME,
  SCHEME_MAPPING,
  STATUS_PROFILE,
  STATUS_PROFILE_MAPPING,
} from "common/constants";
import PATH, { RESULT_PATH, SUBMIT_PATH } from "common/path";
import { PAPButton, PAPError, PAPHtmlContent } from "core/pures";
import { DoneData } from "modules/ApplicationSubmit/type";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { formatDay } from "utils/helpers";
import Otp from "./Otp";
import { useAppDispatch, useAppSelector } from "appRedux";
import { CloseOutlined } from "@ant-design/icons";
import {
  asyncApproveResult,
  asyncRejectResult,
  updateReSubmit,
  updateSubmitApplicationProfile,
} from "modules/ApplicationSubmit/slice";
import HotlineComponent from "./HotlineComponent";
import { useTranslation } from "react-i18next";
import { EVENT_NAME } from "utils/googleAnalytics";
import { asyncGenerateOtp, updateGenOTPErr } from "modules/Auth/slice";
import { shallowEqual } from "react-redux";
import { CANCLE_JOIN_CONTENT } from "common/content";

export default function ProfileResult({ profile }: { profile: DoneData }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [authPhone, authOtp] = useAppSelector(
    (state) => [state.auth.phone, state.auth.otp],
    shallowEqual
  );
  const [canReSubmit, confirmResult] = useAppSelector(
    (state) => [state.submit.canReSubmit, state.submit.confirmResult],
    shallowEqual
  );

  const [agree, setAgree] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  const [
    showAgree,
    agreed,
    rejected,
    done,
    resulted,
    showScheme,
    showReSubmitOneYear,
    duplicateProfile,
    isActiveUpdate,
    confirming,
  ] = useMemo(() => {
    const showAgree = (() => {
      if (profile.scheme === SCHEME.NONE) return false;
      return profile.status === STATUS_PROFILE.CONFIRMING;
    })();
    const agreed = profile.status === STATUS_PROFILE.CONFIRMED;
    const rejected = profile.status === STATUS_PROFILE.REJECTED;
    const done = agreed || rejected;
    const resulted = profile.scheme !== SCHEME.NONE || done;
    const confirming = STATUS_PROFILE.CONFIRMING === profile.status;
    const showScheme = profile.scheme && profile.scheme !== SCHEME.NONE;
    const showReSubmitOneYear = [
      STATUS_PROFILE.CONFIRMED,
      STATUS_PROFILE.CONFIRMING,
    ].includes(profile.status);
    const duplicateProfile =
      profile.status === STATUS_PROFILE.DUPLICATE_PROFILE;
    const isActiveUpdate = [
      STATUS_PROFILE.NOT_QUALIFIED_FOR_EVALUATION,
    ].includes(profile.status);
    return [
      showAgree,
      agreed,
      rejected,
      done,
      resulted,
      showScheme,
      showReSubmitOneYear,
      duplicateProfile,
      isActiveUpdate,
      confirming,
    ];
  }, [profile.status, profile.scheme]);

  const onResendOTP = useCallback(
    (callback?: () => void) => {
      dispatch(asyncGenerateOtp({ phone: authPhone || "" }))
        .unwrap()
        .then(callback)
        .catch((err) => {
          if (err.error.code.includes("TOKEN")) {
            navigate(`/login?outdate=true&phone=${authPhone}`);
            dispatch(updateGenOTPErr(null));
          }
        });
    },
    [dispatch, authPhone]
  );

  const generateOtp = () => {
    if (sentOtp) {
      setShowOtp(true);
    } else {
      dispatch(asyncGenerateOtp({ phone: authPhone }))
        .unwrap()
        .then(() => {
          setShowOtp(true);
          setSentOtp(true);
        })
        .catch((err) => {
          if (err.error.code.includes("TOKEN")) {
            navigate(`/login?outdate=true&phone=${authPhone}`);
            dispatch(updateGenOTPErr(null));
          }
        });
    }
  };

  const onConfirmOtp = useCallback(
    (otp_code: string, callback: () => void) => {
      dispatch(asyncApproveResult({ otp_code, phone: authPhone }))
        .unwrap()
        .then((res) => {
          callback && callback();
          dispatch(
            updateSubmitApplicationProfile({
              profiles: res.data?.profiles,
              canReSubmit: res.data?.re_submit,
            })
          );
          setShowOtp(false);
          navigate(PATH.RESULT);
        })
        .catch((err) => {
          if (err.error.code.includes("TOKEN")) {
            navigate(`/login?outdate=true&phone=${authPhone}`);
            dispatch(updateGenOTPErr(null));
          }
        });
    },
    [authPhone, dispatch, navigate]
  );

  const reSubmitProfile = () => {
    dispatch(updateReSubmit(true));
    navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`);
  };

  const onClickable = useCallback(() => {
    if (isActiveUpdate) return;
    if (profile.active_status !== "ACTIVE") return;
    if (resulted || duplicateProfile)
      navigate(`${PATH.RESULT}${RESULT_PATH.PROFILES}`);
    else navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`);
  }, [profile.active_status, resulted, navigate, duplicateProfile]);

  return (
    <>
      <Container>
        <ProfileCard>
          <Clickable
            isActive={profile.active_status === "ACTIVE"}
            onClick={onClickable}
          >
            <TextRow
              title={
                <MainTitleRow>{t("REGISTER_PROFILE_VEPAP_2024")}</MainTitleRow>
              }
              content={
                <CustomTag
                  color={STATUS_PROFILE_MAPPING[profile.status]?.color}
                  style={{
                    color: STATUS_PROFILE_MAPPING[profile.status]?.text,
                  }}
                >
                  {t(STATUS_PROFILE_MAPPING[profile.status]?.label)}
                </CustomTag>
              }
              bottom="1rem"
            />
            <TextRow title={t("FULLNAME_SHORT")} content={profile.full_name} />
            <TextRow title={t("REGISTER_PHONE")} content={profile.phone} />
            <TextRow title={t("ID_CARD")} content={profile.id_card_number} />
            <TextRow
              title={t("DATE_OF_BIRTH_LONG")}
              content={formatDay(profile.dob)}
            />
            <DividerProfile />
          </Clickable>
          <ActionGroup>
            {showScheme && (
              <>
                <TextRow
                  title={t("CLASSIFY")}
                  content={
                    <SchemeText>
                      {t(SCHEME_MAPPING[profile.scheme]?.level)}
                    </SchemeText>
                  }
                />
                {confirming && (
                  <p
                    style={{
                      textAlign: "left",
                    }}
                  >
                    {t(SCHEME_MAPPING[profile.scheme]?.content)}
                  </p>
                )}
              </>
            )}

            {showAgree && (
              <CheckboxContainer>
                <Checkbox
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <CheckboxText>
                  {t("I_READ_AND_AGREE_WITH")}{" "}
                  <TextLink
                    onClick={() =>
                      navigate(`${PATH.RESULT}${RESULT_PATH.AGREE}`)
                    }
                  >
                    {t("CLASSIFY_RESULT_OF_VEPAP")}
                  </TextLink>
                </CheckboxText>
              </CheckboxContainer>
            )}
            {agreed && (
              <ResultText>
                {t("I_AGREE_WITH")} {t("CLASSIFY_RESULT_OF_VEPAP")}
              </ResultText>
            )}

            {rejected && (
              <ResultText>{t("I_CANCELLED_PROFILE_AND")}</ResultText>
            )}

            {showAgree && (
              <>
                <StyledPAPButton
                  type="primary"
                  disabled={!agree}
                  onClick={generateOtp}
                  loading={authOtp.loading}
                  gaTrack={{
                    event: EVENT_NAME.BTN_AGREE_RESULT,
                  }}
                >
                  {t("I_AGREE_JOIN_PROGRAM")}
                </StyledPAPButton>
                <PAPError error={authOtp.error} />
              </>
            )}

            {canReSubmit && (
              <StyledPAPButton
                type="primary"
                onClick={reSubmitProfile}
                gaTrack={{
                  event: EVENT_NAME.BTN_RE_SUBMIT_APPLICATION,
                }}
              >
                {t("RESUBMIT_PROFILE")}
              </StyledPAPButton>
            )}
            {isActiveUpdate && (
              <span style={{ fontSize: "12px" }}>
                {t("CONTACT_HOTLINE_TO_SUPPORT")}
              </span>
            )}
            {!duplicateProfile && (
              <ProcessingButtons
                done={done}
                showAgree={showAgree}
                naviateToUpdate={() =>
                  navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`)
                }
                t={t}
                profileStatus={profile.status}
              />
            )}
          </ActionGroup>
        </ProfileCard>
        {agreed && <CheckEmail>{t("CHECK_EMAIL")}</CheckEmail>}
        {/* {showReSubmitOneYear && (
          <ReSubmit>
            {t("YOU_CAN_REQUEST")}{" "}
            <ReUW
              onClick={() => {
                if (canReSubmit) reSubmitProfile();
              }}
              active={canReSubmit}
            >
              {t("RE_UNDERWRITING")}
            </ReUW>{" "}
            {t("AFTER_ONE_YEAR")}
          </ReSubmit>
        )} */}

        <Otp
          isOpen={showOtp}
          onNext={onConfirmOtp}
          onResend={onResendOTP}
          onClose={() => setShowOtp(false)}
          loading={confirmResult.loading}
          error={confirmResult.error}
        />
      </Container>
      <PhoneBtn href={`tel:${HOTLINE}`}>
        <HotlineComponent />
      </PhoneBtn>
    </>
  );
}

const TextRow = ({
  title,
  content,
  bottom = "0.5rem",
}: {
  title: ReactNode;
  content: ReactNode;
  bottom?: string;
}): JSX.Element => {
  return (
    <FlexRow style={{ marginBottom: bottom }}>
      <TitleRow>{title}</TitleRow>
      <Content>{content}</Content>
    </FlexRow>
  );
};

const CancelModal = ({
  onClose,
  next,
  profileStatus,
}: {
  onClose: () => void;
  next: () => void;
  profileStatus?: string;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authPhone = useAppSelector((state) => state.auth.phone, shallowEqual);
  const [loading, setLoading] = useState(false);
  const onRejected = useCallback(() => {
    setLoading(true);
    dispatch(asyncRejectResult({ phone: authPhone }))
      .unwrap()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        if (err.error.code.includes("TOKEN")) {
          navigate(`/login?outdate=true&phone=${authPhone}`);
          dispatch(updateGenOTPErr(null));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authPhone, dispatch]);

  const generateOtp = useCallback(() => {
    dispatch(asyncGenerateOtp({ phone: authPhone }))
      .unwrap()
      .then(() => {
        next();
      })
      .catch((err) => {
        if (err.error.code.includes("TOKEN")) {
          navigate(`/login?outdate=true&phone=${authPhone}`);
          dispatch(updateGenOTPErr(null));
        }
      });
  }, [authPhone, dispatch]);

  const hasResult = useMemo(() => {
    return profileStatus === STATUS_PROFILE.CONFIRMING;
  }, [profileStatus]);

  return (
    <ModalContainer>
      <FlexRight style={{ marginTop: 0 }}>
        <CloseButton onClick={onClose}>
          <CloseOutlined />
        </CloseButton>
      </FlexRight>
      <ModalTitle>
        {hasResult ? t("PLEASE_NOTICE") : t("DO_YOU_WANT_TO_CANCLE_PROFILE")}
      </ModalTitle>
      <ModalDescription>
        {hasResult && <PAPHtmlContent content={CANCLE_JOIN_CONTENT} />}
      </ModalDescription>
      <PAPButtonStyled onClick={onClose} type="primary">
        {t("CONTINUE_JOIN")}
      </PAPButtonStyled>
      <StyledPAPCancelButton
        loading={loading}
        onClick={() => {
          if (hasResult) {
            onClose();
            return generateOtp();
          }
          return onRejected();
        }}
        type="text"
        color="colorPrimary"
        gaTrack={{
          event: EVENT_NAME.BTN_CANCEL_RESULT,
        }}
      >
        {t("I_WANT_TO_CANCEL_AND_UNJOIN")}
      </StyledPAPCancelButton>
    </ModalContainer>
  );
};

function ProcessingButtons({
  done,
  showAgree,
  naviateToUpdate,

  t,
  profileStatus,
}: {
  done: boolean;
  showAgree: boolean;
  naviateToUpdate: () => void;

  t: (translate: string) => string;
  profileStatus: string;
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const [authPhone, authOtp] = useAppSelector(
    (state) => [state.auth.phone, state.auth.otp],
    shallowEqual
  );

  const activeUpdate = useMemo(
    () => [STATUS_PROFILE.NOT_QUALIFIED_FOR_EVALUATION].includes(profileStatus),
    [profileStatus]
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onRejected = useCallback(
    (otp_code: string, callback: () => void) => {
      dispatch(asyncRejectResult({ otp_code, phone: authPhone }))
        .unwrap()
        .then(() => {
          callback();
        })
        .catch((err) => {
          if (err.error.code.includes("TOKEN")) {
            navigate(`/login?outdate=true&phone=${authPhone}`);
            dispatch(updateGenOTPErr(null));
          }
        });
    },
    [authPhone, dispatch]
  );

  const onResendOTP = useCallback(
    (callback?: () => void) => {
      dispatch(asyncGenerateOtp({ phone: authPhone || "" }))
        .unwrap()
        .then(callback)
        .catch((err) => {
          if (err.error.code.includes("TOKEN")) {
            navigate(`/login?outdate=true&phone=${authPhone}`);
            dispatch(updateGenOTPErr(null));
          }
        });
    },
    [dispatch, authPhone]
  );
  if (done) return null;
  return (
    <>
      {!showAgree && (
        <StyledPAPButton
          disabled={activeUpdate}
          type="primary"
          onClick={naviateToUpdate}
        >
          {t("CONTINUE_UPDATE_PROFILE")}
        </StyledPAPButton>
      )}
      <StyledPAPCancelButton
        color="colorPrimary"
        type="text"
        onClick={() => {
          setShowCancelModal(true);
        }}
        style={{ fontSize: "0.8rem" }}
      >
        {profileStatus === STATUS_PROFILE.CONFIRMING
          ? t("I_DONT_AGREE_RESULT")
          : t("CANCEL_PROCESS")}
      </StyledPAPCancelButton>

      <Modal
        open={showCancelModal}
        title={null}
        footer={null}
        onCancel={() => setShowCancelModal(false)}
        closeIcon={null}
      >
        <CancelModal
          onClose={() => setShowCancelModal(false)}
          next={() => setShowOtp(true)}
          profileStatus={profileStatus}
        />
      </Modal>

      <Otp
        isOpen={showOtp}
        onNext={onRejected}
        onClose={() => setShowOtp(false)}
        loading={authOtp.loading}
        error={authOtp.error}
        onResend={onResendOTP}
      />
    </>
  );
}

const Container = styled.div`
  text-align: center;
  width: 24rem;
  margin: auto;
  margin-block: 20px;

  @media screen and (max-width: 768px) {
    max-width: 28rem;
    width: 100%;
    padding-bottom: 90px;
  }
`;

const ProfileCard = styled.div`
  border-radius: 1rem;
  border: ${(props) => `1px solid ${props.theme.grey3}`};
  padding: 1rem;
  @media screen and (max-width: 768px) {
    padding: 0.5rem 1rem;
    margin-inline: 1rem;
  }
`;

interface IClickable {
  isActive: boolean;
}

const Clickable = styled.div<IClickable>`
  cursor: ${(props) => (props.isActive ? "pointer" : "default")};
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block: 0.5rem;
  align-items: baseline;
`;

const FlexRight = styled.div`
  display: flex;
  justify-content: right;
  margin-top: 1rem;
  @media screen and (max-width: 768px) {
    margin-top: 0.5rem;
  }
`;

const PhoneBtn = styled.a`
  display: block;
  position: fixed;
  bottom: 3rem;
  right: 0;
  z-index: 9;

  @media screen and (max-width: 540px) {
    bottom: 2rem;
  }
`;

const StyledPAPButton = styled(PAPButton)`
  display: block;
  width: 100%;
  margin-block: 0.75rem;
`;

const StyledPAPCancelButton = styled(StyledPAPButton)`
  background-color: ${(props) => props.theme.blue0};
`;

const TitleRow = styled.span`
  color: ${(props) => props.theme.grey5};
  font-size: 0.75rem;
`;

const Content = styled.span`
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DividerProfile = styled(Divider)`
  margin: 12px 0;
`;

const MainTitleRow = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: black;
`;

const CustomTag = styled(Tag)`
  border-radius: 1rem;
`;

const TextLink = styled.span`
  color: ${(props) => props.theme.colorPrimary};
  cursor: pointer;
`;

const ModalContainer = styled.div`
  text-align: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-block: 0 0.5rem;
`;

const ModalDescription = styled.p`
  color: ${(props) => props.theme.grey7};
  font-size: 0.875rem;
  font-weight: 400;
`;

const PAPButtonStyled = styled(PAPButton)`
  width: 100%;
  margin-block: 0.5rem;
`;

const CloseButton = styled.div`
  cursor: pointer;
`;

const CheckboxText = styled.span`
  padding-left: 8px;
`;

const CheckboxContainer = styled.div`
  margin-block: 0.8rem 2rem;
`;

const SchemeText = styled.span`
  color: ${(props) => props.theme.colorPrimary};
`;

const ResultText = styled.span`
  display: block;
  margin-block: 1rem;
  font-size: 0.75rem;
`;

const ActionGroup = styled.div`
  margin-top: 10px;
`;

const CheckEmail = styled.p`
  margin-top: 2rem;
  color: ${(props) => props.theme.grey5};
  font-size: 0.6875rem;
  font-weight: 400;
  text-align: center;
`;

const ReSubmit = styled.span`
  color: ${(props) => props.theme.grey5};
  font-size: 0.6875rem;
  margin-top: 2rem;
`;

interface IReUW {
  active: boolean;
}

const ReUW = styled.span<IReUW>`
  color: ${(props) => (props.active ? props.theme.colorPrimary : "inherit")};
  cursor: ${(props) => (props.active ? "pointer" : "default")};
`;
