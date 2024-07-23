import { Select, SelectProps } from 'antd';
import styled from 'styled-components';
import '../normalize.css';

interface ISelectProps extends SelectProps {}

const PAPSelect = ({ ...props }: ISelectProps): JSX.Element => {
  return (
    <Select
      getPopupContainer={ele => ele.parentElement}
      virtual={false}
      dropdownRender={menu => (
        <StyledDropDown className='dropdown-select'>{menu}</StyledDropDown>
      )}
      {...props}
    />
  );
};

PAPSelect.Option = Select.Option;

export default PAPSelect;

const StyledDropDown = styled.div`
  max-height: 264px;
  overflow: hidden;
  overflow-y: auto;
`;
