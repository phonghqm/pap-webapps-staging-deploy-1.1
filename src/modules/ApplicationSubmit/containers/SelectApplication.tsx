import { Radio } from "antd";
import Layout from "core/layout";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { useCoordination, useTrackViewPage } from "hooks";
import { useAppDispatch, useAppSelector } from "appRedux";
import { useNavigate, useSearchParams } from "react-router-dom";
import PATH, { SUBMIT_PATH } from "common/path";
import { addProfile, resetProfiles, updateCoordination } from "../slice";
import { PAPBackButton, PAPBottomButton } from "core/pures";
import { ChooseApplicationOption } from "../enum";
import { withPhone } from "hoc";
import { OWNER_RELATIVE } from "common/constants";
import { saveCache } from "utils/cache";
import { useTranslation } from "react-i18next";
import { EVENT_NAME, logGAEvent } from "utils/googleAnalytics";
import { shallowEqual } from "react-redux";
import { asyncRequestMyInfo } from "modules/Singpass/slice";

function SelectApplication(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_CHOOSE_TYPE_REGISTRANT);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [coor, error] = useCoordination();
  const [option, setOption] = useState(ChooseApplicationOption.Relative);

  const authPhone = useAppSelector((state) => state.auth.phone, shallowEqual);
  const [hospital, pcCode] = useAppSelector(
    (state) => [state.submit.hospital, state.submit.pcCode],
    shallowEqual
  );
  let [searchParams] = useSearchParams();

  const handleNext = useCallback(() => {
    dispatch(resetProfiles());
    switch (option) {
      case ChooseApplicationOption.Patient: {
        logGAEvent(EVENT_NAME.BTN_CHOOSE_TYPE_REGISTRANT_NEXT, {
          type: "patient",
        });
        const register = {
          index: 1,
          is_present: true,
          patient_relationship: OWNER_RELATIVE,
          phone: authPhone,
          hospital: hospital,
          pc_code: pcCode as string,
        };
        dispatch(addProfile(register));
        saveCache(register, "1");
        break;
      }
      case ChooseApplicationOption.Relative: {
        logGAEvent(EVENT_NAME.BTN_CHOOSE_TYPE_REGISTRANT_NEXT, {
          type: "relative",
        });
        const register = {
          index: 1,
          is_present: true,
          patient_relationship: null,
          phone: authPhone,
          pc_code: pcCode as string,
        };
        const patient = {
          index: 2,
          is_present: false,
          patient_relationship: OWNER_RELATIVE,
          hospital: hospital,
          pc_code: pcCode as string,
        };
        dispatch(addProfile(register));
        saveCache(register, "1");
        dispatch(addProfile(patient));
        saveCache(patient, "2");
        break;
      }
    }

    navigate(`.${SUBMIT_PATH.EKYC}`);
  }, [authPhone, option, hospital, pcCode, dispatch, navigate]);

  useEffect(() => {
    if (!error) {
      dispatch(updateCoordination(coor));
    }
  }, [coor, error, dispatch]);

  return (
    <Layout back={() => navigate(PATH.TERM_CONFIRM)}>
      <PAPBackButton
        gaTrack={{
          event: EVENT_NAME.BTN_CHOOSE_TYPE_REGISTRANT_BACK,
        }}
        onClick={() => navigate(PATH.TERM_CONFIRM)}
      />
      <Container>
        <Title>
          {t("I_REGISTER_VE_PAP_2024")} {t("I_AM")}
        </Title>
        <SelectContainer>
          <SelectOption value={option} onChange={setOption} />
        </SelectContainer>
      </Container>
      <PAPBottomButton
        text={t("CONTINUE")}
        type="primary"
        onClick={handleNext}
      />
    </Layout>
  );
}

function SelectOption({
  value,
  onChange,
}: {
  value: ChooseApplicationOption;
  onChange: any;
}) {
  const { t } = useTranslation();

  return (
    <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
      <OptionSelect value={ChooseApplicationOption.Relative}>
        <ImageOption src="/Relative.webp" />
        <TextOption>
          <span>The {t("RELATIVE")}</span>
          <SelectOptionDescription>
            {t("RELATIONSHIP_DESCRIPTION")}
          </SelectOptionDescription>
        </TextOption>
      </OptionSelect>
      <OptionSelect value={ChooseApplicationOption.Patient}>
        <ImageOption src="/Patient.webp" />
        <TextOption>The {t("PATIENT")}</TextOption>
      </OptionSelect>
    </RadioGroup>
  );
}

const Container = styled.div`
  width: 30rem;
  margin: auto;
  margin-top: 3rem;

  @media screen and (max-width: 768px) {
    width: 100%;
    margin-top: 2rem;
  }
`;

const Title = styled.h4`
  padding-inline: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.25rem;

  margin-bottom: 2rem;

  @media screen and (max-width: 768px) {
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
`;

const OptionSelect = styled(Radio)`
  display: flex;
  align-items: center;
  margin-block: 0.5rem;
  padding-inline: 1rem;
  padding-block: 0.5rem;
  box-shadow: ${(props) => props.theme.boxShadow};

  > span {
    display: flex;
    align-items: center;
    padding-inline: 1rem;
  }
`;

const ImageOption = styled.img`
  height: 64px;
  border-radius: 50%;
  width: 64px;
  margin-inline: 1rem;
`;

const TextOption = styled.span`
  color: black;
  margin-left: 1rem;
  @media screen and (max-width: 540px) {
    margin-left: 0;
  }
`;

const RadioGroup = styled(Radio.Group)`
  width: 100%;
`;

const SelectContainer = styled.div`
  padding-inline: 2.5rem;
  @media screen and (max-width: 540px) {
    padding-inline: 1rem;
  }
`;

const SelectOptionDescription = styled.span`
  display: block;
  color: ${(props) => props.theme.grey5};
  font-size: 0.625rem;
`;

const SelectApplicationWithPhone = withPhone(SelectApplication);

export default SelectApplicationWithPhone;
