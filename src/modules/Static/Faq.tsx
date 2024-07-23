/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlusOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
// import { FAQ } from 'common/content';
import Layout from 'core/layout';
import { PAPHtmlContent } from 'core/pures';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// const FaqItem = ({
//   question,
//   answer,
// }: {
//   question: string;
//   answer: string;
// }): JSX.Element => {
//   return (
//     <Collapse
//       items={[
//         {
//           label: <Question>{question}</Question>,
//           children: <Answer content={answer} />,
//         },
//       ]}
//       expandIconPosition='end'
//       expandIcon={({ isActive }) => (
//         <PlusOutlined style={{ fontSize: 16 }} rotate={isActive ? 45 : 0} />
//       )}
//       bordered={false}
//     />
//   );
// };

function Faq(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout linkLogo='/' back={() => navigate(-1)}>
      <Container>
        <Title>{t('FAQ')}</Title>
        {/* <FaqContainer>
          {FAQ.map((faq, k) => (
            <FaqItem question={faq.question} answer={faq.answer} key={k} />
          ))}
        </FaqContainer> */}
      </Container>
    </Layout>
  );
}

export default Faq;

const Container = styled.div`
  text-align: justify;
  padding-inline: 8rem;
  padding-bottom: 4rem;

  @media screen and (max-width: 928px) {
    padding-inline: 3rem;
  }

  @media screen and (max-width: 768px) {
    padding-inline: 1.2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;

  @media screen and (max-width: 540px) {
    font-size: 1.5rem;
  }
`;

const FaqContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Question = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;

  @media screen and (max-width: 540px) {
    font-size: 1rem;
  }
`;

const Answer = styled(PAPHtmlContent)`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  color: rgba(60, 60, 67, 0.85);
`;
