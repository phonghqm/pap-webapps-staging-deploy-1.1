import styled from "styled-components";
import { ProfileForm } from "../type";
import { useNavigate } from "react-router-dom";
import { SUBMIT_PATH } from "common/path";
import { Modal } from "antd";
import { useDispatch } from "react-redux";
import { removeProfile } from "../slice";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { OWNER_RELATIVE } from "common/constants";
import { removeCache } from "utils/cache";
import { useMemo, useState } from "react";
import { PAPButton } from "core/pures";
import { useTranslation } from "react-i18next";

function ProfileItem({ profile }: { profile: ProfileForm }): JSX.Element {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPopUpRemove, setShowPopUpRemove] = useState(false);

  const allowRemove = useMemo(
    () =>
      profile.patient_relationship !== OWNER_RELATIVE && !profile.is_present,
    [profile.patient_relationship, profile.is_present]
  );
  const handleRemove = () => {
    removeCache(profile.index.toString());
    dispatch(removeProfile(profile.index));
  };

  const getTypeProfile = (is_present: boolean, is_owner: boolean) => {
    if (is_present) {
      return t("REGISTER");
    }
    if (is_owner) {
      return t("PATIENT");
    }
    return t("RELATIVE");
  };

  return (
    <Container>
      <Content>
        <Type>
          {getTypeProfile(
            profile.is_present,
            profile.patient_relationship === OWNER_RELATIVE
          )}{" "}
          profile
        </Type>
        <Text>{profile.full_name}</Text>
        {profile.patient_relationship !== OWNER_RELATIVE ? (
          <Text>{t(profile?.patient_relationship ?? "")}</Text>
        ) : (
          <Text>{t("PATIENT")}</Text>
        )}

        <Text>{profile.phone || "N/A"}</Text>
      </Content>
      <Actions>
        <Edit
          onClick={() => navigate(`..${SUBMIT_PATH.FORM}/${profile.index}`)}
        >
          {t("EDIT")} <EditOutlined />
        </Edit>
        {allowRemove ? (
          <Delete onClick={() => setShowPopUpRemove(true)}>
            {t("DELETE")} <CloseOutlined />
          </Delete>
        ) : (
          <div />
        )}
      </Actions>
      <Modal
        open={showPopUpRemove}
        onCancel={() => setShowPopUpRemove(false)}
        footer={null}
        width={400}
      >
        <Title>{t("DELETE_RELATION_PROFILE")}</Title>
        <Description>{t("DELETE_RELATION_PROFILE_DES")}</Description>
        <CustomButton type="primary" onClick={handleRemove}>
          {t("AGREE")}
        </CustomButton>
        <CustomButton
          type="text"
          color="colorPrimary"
          onClick={() => setShowPopUpRemove(false)}
        >
          {t("BACK")}
        </CustomButton>
      </Modal>
    </Container>
  );
}

export default ProfileItem;

const Container = styled.div`
  border-radius: 0.75rem;
  border: 1px solid var(--light-neutral-light-grey-20, #e6e7eb);
  display: flex;
  justify-content: space-between;
  padding: 16px;
  margin: 10px;
  max-width: 100%;
`;

const Content = styled.div``;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 10px;
`;

const Type = styled.h4`
  margin-bottom: 1rem;
  margin-top: 0.25rem;
`;

const Text = styled.span`
  display: block;
  color: ${(props) => props.theme.grey5};
`;

const Edit = styled.span`
  color: ${(props) => props.theme.cyan6};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
`;

const Delete = styled.span`
  color: ${(props) => props.theme.red};
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: 600;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
`;

const Description = styled.p`
  color: ${(props) => props.theme.grey7};
  font-size: 0.875rem;
  font-weight: 400;
  text-align: center;
`;

const CustomButton = styled(PAPButton)`
  width: 100%;
  margin-block: 10px;
`;
