import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import qs from "query-string";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "appRedux";
import { EKYC_STEP } from "common/constants";
import PATH, { SUBMIT_PATH } from "common/path";
import Layout from "core/layout";
import { PAPBackButton, PAPBottomButton } from "core/pures";
import { withPhone } from "hoc";
import { EkycItem } from "modules/ApplicationSubmit/components";
import { EkycType } from "modules/ApplicationSubmit/enum";
import { ImageResponse, ProfileForm } from "modules/ApplicationSubmit/type";
import Liveness from "./Liveness";
import IdCard from "./IdCard";

import { EVENT_NAME, logGAEvent } from "utils/googleAnalytics";
import { useTrackViewPage } from "hooks";
import apis from "modules/ApplicationSubmit/api";
import {
  asyncRequestMyInfo,
  updateLiveness,
  updateProfile,
} from "modules/ApplicationSubmit/slice";
import { updateAuthToken, updateRedirectUrl } from "modules/Singpass/slice";
import { setPhone } from "utils/localStorage";

function Ekyc(): JSX.Element {
  const { search } = useLocation();
  const parse = qs.parse(search);

  switch (parse?.step) {
    case EKYC_STEP.PORTRAIT:
      return <Liveness key="liveness" />;
    case EKYC_STEP.FRONT:
      return <IdCard key="id-card-front" type="front" />;
    case EKYC_STEP.BACK:
      return <IdCard key="id-card-back" type="back" />;
    default:
      return <EkycSteps key="main" />;
  }
}

function EkycSteps() {
  useTrackViewPage(EVENT_NAME.PAGE_EKYC);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const data = useAppSelector((state) => {
    const profiles = state.submit.data;
    if (profiles?.length > 0) return profiles[0];
    return {} as ProfileForm;
  }, shallowEqual);
  let hostname = window.location.origin;
  const [authPhone] = useAppSelector(
    (state) => [state.auth.phone],
    shallowEqual
  );
  const [ekycImage, setEkycImage] = useState<any>(null);
  const dispatch = useAppDispatch();

  const LIST_LIVENESS = useMemo(
    () => [
      {
        index: 1,
        title: t("LIVENESS_PORTRAIT"),
        type: EkycType.Portrait,
        description: t("LIVENESS_PORTRAIT_DESCRIPTION"),
        fallbackImage: "/PortraitFallback.webp",
        step: EKYC_STEP.PORTRAIT,
      },
      {
        index: 2,
        title: t("LIVENESS_IDCARD_FRONT"),
        type: EkycType.IdCardFront,
        fallbackImage: "/FrontID.webp",
        step: EKYC_STEP.FRONT,
      },
      {
        index: 3,
        title: t("LIVENESS_IDCARD_BACK"),
        type: EkycType.IdCardBack,
        fallbackImage: "/BackID.webp",
        step: EKYC_STEP.BACK,
      },
    ],
    [t]
  );

  const back = () => navigate(`..${SUBMIT_PATH.CHOOSE_APPLICATION}`);

  useEffect(() => {
    dispatch(
      asyncRequestMyInfo({
        redirect: `${hostname}/submit/form/1?init=true`,
        attributes: ["name", "email", "mobileno"],
      })
    ).then((res) => {
      dispatch(updateAuthToken(res.payload.data.token));
      localStorage.setItem("singpassToken", res.payload.data.token);
      dispatch(updateRedirectUrl(res.payload.data.url));
    });
  }, []);
  const next = useCallback(() => {
    const registerProfile = data;
    // After filling full information, move to next screen
    if (
      registerProfile.id_card_front &&
      registerProfile.id_card_back &&
      registerProfile.ekyc_info?.portrait
    ) {
      setPhone(authPhone);
      logGAEvent(EVENT_NAME.BTN_EKYC_CONFIRM_NEXT);
      navigate(`..${SUBMIT_PATH.FORM}/1?init=true`);
      return;
    }
    // Go ahead the first screen to take a portrait photo
    logGAEvent(EVENT_NAME.BTN_EKYC_GUIDELINE_NEXT);
    if (!registerProfile.ekyc_info?.portrait) {
      navigate({
        pathname,
        search: createSearchParams({
          step: EKYC_STEP.PORTRAIT,
        }).toString(),
      });
      return;
    }
    // Move to the 2nd screen to take photo in a front of the ID card
    if (!registerProfile.id_card_front) {
      navigate({
        pathname,
        search: createSearchParams({
          step: EKYC_STEP.FRONT,
        }).toString(),
      });
      return;
    }
    // Move to the last screen to take photo in a back of the ID card
    navigate({
      pathname,
      search: createSearchParams({
        step: EKYC_STEP.BACK,
      }).toString(),
    });
  }, [data, navigate, pathname]);

  const showImageAfterReceiving = useCallback(
    (type: EkycType) => {
      const registerProfile = ekycImage || data;

      switch (type) {
        case EkycType.Portrait:
          return (registerProfile.ekyc_info?.portrait as ImageResponse)?.url;
        case EkycType.IdCardFront:
          return (registerProfile.id_card_front as ImageResponse)?.url;
        case EkycType.IdCardBack:
          return (registerProfile.id_card_back as ImageResponse)?.url;
        default:
          return;
      }
    },
    [data, ekycImage]
  );

  useEffect(() => {
    const profile = {} as any;
    apis
      .getEkycImage()
      .then((res) => {
        profile["id_card_front"] = res.data.id_card_front;
        profile["id_card_back"] = res.data.id_card_back;
        setEkycImage(res.data);
        dispatch(updateLiveness(res.data.ekyc_info.portrait));
        dispatch(updateProfile({ profile, index: 1 }));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Layout back={back}>
      <PAPBackButton
        onClick={back}
        gaTrack={{
          event: EVENT_NAME.BTN_EKYC_CONFIRM_BACK,
        }}
      />
      <Container>
        <Title>{t("CREATE_ACCOUNT")}</Title>
        <Description>{t("EKYC_DESCRIPTION")}</Description>
        <EkycContainer>
          {LIST_LIVENESS.map((item) => (
            <EkycItem
              key={item.index}
              index={item.index}
              title={item.title}
              type={item.type}
              description={item.description}
              fallbackImg={item.fallbackImage}
              src={showImageAfterReceiving(item.type) as string}
              step={item.step}
            />
          ))}
        </EkycContainer>
      </Container>
      <PAPBottomButton text={t("CONTINUE")} type="primary" onClick={next} />
    </Layout>
  );
}

const Container = styled.div`
  margin-top: 3rem;
  width: 400px;
  margin: auto;

  @media screen and (max-width: 921px) {
    margin-top: 3rem;
  }

  @media screen and (max-width: 768px) {
    width: 100%;
    padding-inline: 1rem;
    margin-top: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  margin-block: 0.25rem;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.grey7};
  margin-block: 0.5rem;
`;

const EkycContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 5rem;
`;

const EkycWithPhone = withPhone(Ekyc);

export default EkycWithPhone;
