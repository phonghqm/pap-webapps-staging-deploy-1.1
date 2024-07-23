import { Form } from 'antd';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { AntSelect } from 'core/pures/PAPInput';
import { asyncLoadHospital } from 'modules/Config/slice';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';

function HospitalSelect({ disabled }: { disabled: boolean }): JSX.Element {
  const { t } = useTranslation();

  const { data, is_loaded, loading } = useAppSelector(
    state => state.config.hospitals,
    shallowEqual
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!is_loaded) {
      dispatch(asyncLoadHospital());
    }
  }, [is_loaded, dispatch]);

  return (
    <Form.Item
      name='hospital'
      label={t('HOSPITAL_PATIENT')}
      rules={[{ required: true, message: t('PLEASE_INPUT') }]}
    >
      <AntSelect
        disabled={disabled}
        showSearch
        loading={loading}
        placeholder={t('CHOOSE_PLACEHOLDER')}
        options={data.map(item => ({
          label: item.name,
          value: item.name,
        }))}
      />
    </Form.Item>
  );
}

export default HospitalSelect;
