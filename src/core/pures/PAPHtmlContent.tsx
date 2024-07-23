import './normalize.css';

const PAPHtmlContent = ({ content }: { content: string }): JSX.Element => {
  return (
    <div className='html-block' dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default PAPHtmlContent;
