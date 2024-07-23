import { DatePicker, DatePickerProps } from "antd";
import styled from "styled-components";
import locale from "antd/es/date-picker/locale/en_US";
import "dayjs/locale/vi";
import dayjs from "dayjs";

const PAPDatePicker = (props: DatePickerProps): JSX.Element => {
  return (
    <DatePickerStyled
      locale={locale}
      disabledDate={(date) => date >= dayjs()}
      {...props}
    />
  );
};

export default PAPDatePicker;

const DatePickerStyled = styled(DatePicker)`
  width: 100%;
`;
