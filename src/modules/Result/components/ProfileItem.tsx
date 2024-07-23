import styled from 'styled-components';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import { OWNER_RELATIVE } from 'common/constants';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

function ProfileItem({ profile }: { profile: ProfileForm }): JSX.Element {
  const { t } = useTranslation();

  const [title, subscript, phone] = useMemo(() => {
    const title = (() => {
      if (profile.is_present) return t('REGISTER');
      if (profile.patient_relationship === OWNER_RELATIVE) {
        return t('PATIENT');
      }
      return t('RELATIVE')
    })();
    const subscript = profile.patient_relationship !== OWNER_RELATIVE
      ? profile.patient_relationship
      : t('PATIENT');
    const phone = profile.phone || 'N/A';
    return [title, subscript, phone];
  }, [profile.patient_relationship, profile.phone, profile.is_present, t])

  return (
    <Container>
      <Content>
        <Type>{title}</Type>
        <Text>{profile.full_name}</Text>
        <Text>{subscript}</Text>
        <Text>{phone}</Text>
      </Content>
    </Container>
  );
}

export default ProfileItem;

const Container = styled.div`
  border-radius: 0.75rem;
  border: 1px solid ${props => props.theme.grey2};
  padding: 16px;
  margin: 10px;
  max-width: 100%;
`;

const Content = styled.div``;

const Type = styled.h4`
  margin-bottom: 1rem;
  margin-top: 0.25rem;
`;

const Text = styled.span`
  display: block;
  color: ${props => props.theme.grey5};
`;
