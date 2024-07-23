import { Image } from 'antd';
import styled from 'styled-components';
import { signedKeyUrl } from 'utils/helpers';

type DocumentNeededType = {
  content_needs_to_add: string;
  guideline_images: string;
};

const DocumentNeededComponent = ({
  documentNeeded,
  isHasImage,
}: {
  documentNeeded?: DocumentNeededType;
  isHasImage: boolean;
}) => {
  return (
    documentNeeded?.content_needs_to_add && (
      <div style={{ margin: '1rem' }}>
        <DocumentNeeded>
          <p>
            EasyGop đã xem qua hồ sơ và hướng dẫn bạn cập nhật thông tin như
            sau:
          </p>
          {documentNeeded.content_needs_to_add.split('\n').map(item => {
            return <p key={item}>{item}</p>;
          })}
          <p>
            Nếu có bất kỳ thắc mắc về trường hợp của mình, vui lòng liên hệ Tổng
            đài EasyGop để được giải đáp và hướng dẫn chính xác nhất
          </p>
          {isHasImage && (
            <DocumentNeededPreview>
              <Image.PreviewGroup>
                {documentNeeded?.guideline_images?.split(',')?.map(item => {
                  return (
                    <DocumentNeededImage>
                      <Image
                        src={signedKeyUrl(item)}
                        alt='guideline'
                        style={{ width: '100%' }}
                      />
                    </DocumentNeededImage>
                  );
                })}
              </Image.PreviewGroup>
            </DocumentNeededPreview>
          )}
        </DocumentNeeded>
      </div>
    )
  );
};

export default DocumentNeededComponent;

const DocumentNeeded = styled.div`
  text-align: justify;
  width: 24rem;
  margin: auto;
  background-color: #fff7d2;
  border-radius: 20px;
  border: 1px solid #dbdcce;
  padding: 1rem;
  @media screen and (max-width: 768px) {
    max-width: 28rem;
    width: 100%;
  }
`;

const DocumentNeededPreview = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DocumentNeededImage = styled.div`
  width: 30%;
`;
