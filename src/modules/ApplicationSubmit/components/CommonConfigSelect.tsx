import { SelectProps } from "antd";
import { useAppDispatch, useAppSelector } from "appRedux";
import { PAPSelect } from "core/pures/PAPInput";
import { asyncLoadCommonConfig } from "modules/Config/slice";
import { NameConfig } from "modules/Config/type";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";

type CommonConfigSelectProps = SelectProps & {
  name: NameConfig;
};

function CommonConfigSelect({ name, ...props }: CommonConfigSelectProps) {
  const { t } = useTranslation();

  const { data, is_loaded, loading } = useAppSelector(
    (state) => state.config[name],
    shallowEqual
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!is_loaded) {
      dispatch(asyncLoadCommonConfig(name));
    }
  }, [is_loaded, name, dispatch]);

  return (
    <PAPSelect
      loading={loading}
      options={data.map((item) => ({
        value: item.qs_cond_key,
        label: t(item.qs_cond_key),
      }))}
      placeholder={t("CHOOSE_PLACEHOLDER")}
      {...props}
    />
  );
}

export default CommonConfigSelect;
