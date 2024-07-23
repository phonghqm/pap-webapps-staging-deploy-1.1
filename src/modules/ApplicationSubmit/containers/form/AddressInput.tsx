import { Col, Form, FormInstance, Row } from "antd";
import { useAppDispatch, useAppSelector } from "appRedux";
import { OTHER } from "common/constants";
import { PAPError } from "core/pures";
import PAPInput, { AntSelect, PAPSelect } from "core/pures/PAPInput";
import useDebounce from "hooks/useDebounce";
import { set } from "lodash";
import {
  asyncLoadCites,
  asyncLoadDistrictsByCityId,
  asyncLoadWardsByDistrictId,
  updateNewAddress,
} from "modules/Config/slice";
import { NewAddress } from "modules/Config/type";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import { debounce, getAddressFromString } from "utils/helpers";

function AddressInput({
  name,
  form,
  defaultCity,
  defaultDistrict,
  required,
  addresses,
  updateResident,
  is_present = false,
}: {
  name: string;
  form: FormInstance;
  defaultCity?: string;
  defaultDistrict?: string;
  required?: boolean;
  addresses: string[];
  updateResident?: number;
  is_present?: boolean;
}) {


  const { t } = useTranslation();
  const [cityId, setCityId] = useState<number>(0);
  const count = useRef<any>(null);
  // const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<number>(0);
  // const [wards, setWards] = useState<Ward[]>([]);
  const [showToFill, setShowToFill] = useState(
    is_present || addresses.length === 0 || form.getFieldValue(name) === OTHER
  );
  const [province, setProvince] = useState<any>([]);
  const [district, setDistrict] = useState<any>([]);
  const [ward, setWard] = useState<any>([]);
  const [isHaveNew, setIsHaveNew] = useState(false);

  const dispatch = useAppDispatch();

  const { districts, wards, cities } = useAppSelector(
    (state) => state.config,
    shallowEqual
  );

  const updateAddress = (value: string) => {
 
    setShowToFill(value === OTHER);
    if (value !== OTHER) {
      const parseAddr = getAddressFromString(value);
      form.setFieldValue(["address_info", name, "city"], parseAddr?.city);
      form.setFieldValue(
        ["address_info", name, "district"],
        parseAddr?.district
      );
      form.setFieldValue(["address_info", name, "ward"], parseAddr?.ward);
      form.setFieldValue(["address_info", name, "street"], parseAddr?.street);
    } else {
      setCityId(0);
      form.setFieldValue(["address_info", name, "city"], null);
      form.setFieldValue(["address_info", name, "district"], null);
      form.setFieldValue(["address_info", name, "ward"], null);
      form.setFieldValue(["address_info", name, "street"], null);
    }
  };

  const onDistrictChange = (value: string) => {
    setDistrictId(districts.data.find((c) => c.name === value)?.id || 0);
    if (isHaveNew) {
      const payload: { [key: string]: any } = {
        is_have_new: true,
        province: "",
        city: "",
        ward: "",
      };
      payload["city"] = value;
      dispatch(updateNewAddress(payload));
    }
    setIsHaveNew(false);
    // form.setFieldValue(["address_info", name, "ward"], null);
  };

  const onCityChange = (value: string) => {
    setCityId(cities.data.find((c) => c.name === value)?.id || 0);
    if (isHaveNew) {
      const payload: { [key: string]: any } = {
        is_have_new: true,
        province: "",
        district: "",
        ward: "",
      };
      payload["province"] = value;
      dispatch(updateNewAddress(payload));
    }
    // form.setFieldValue(["address_info", name, "district"], null);
    // form.setFieldValue(["address_info", name, "ward"], null);
    setIsHaveNew(false);
  };
  const onWardChange = (value: string) => {
    if (isHaveNew) {
      const payload: { [key: string]: any } = {
        is_have_new: true,
        province: "",
        city: "",
        ward: "",
      };
      payload["ward"] = value;
      dispatch(updateNewAddress(payload));
    }
    setIsHaveNew(false);
  };

  const handleSearch = (value: string, list: any, setList: any) => {
    if (!list.map((item: any) => item.label).includes(value)) {
      setIsHaveNew(true);

      setList((state: any) => [...state, { label: value, value }]);
    }
  };

  const handleFocus = (value: any, setValue: any, name: string) => {
    setValue(value);
  };

  useEffect(() => {
    if (cityId) {
      dispatch(asyncLoadDistrictsByCityId(cityId));
    }
  }, [cityId, name, dispatch]);

  useEffect(() => {
    if (districtId) {
      dispatch(asyncLoadWardsByDistrictId(districtId));
    }
  }, [districtId, name, dispatch]);

  useEffect(() => {
    const ward = form.getFieldValue(["address_info", name, "ward"]);

    if (ward && wards.data.length > 0) {
      const findWard = wards.data.find(
        (item) => item.name.toLowerCase().trim() === ward.toLowerCase().trim()
      );

      if (count.current == null) {
        findWard &&
          form.setFieldValue(["address_info", name, "ward"], findWard.name);
      }
    }
    return () => {
      count.current = 1;
    };
  }, [wards, form, name]);

  useEffect(() => {
    const district =
      defaultDistrict || form.getFieldValue(["address_info", name, "district"]);

    if (district && districts.data.length > 0) {
      const findDistrict = districts.data.find(
        (d) => d.name.toLowerCase().trim() === district.toLowerCase().trim()
      );
      setDistrictId(findDistrict?.id || 0);

      if (count.current == null) {
        findDistrict &&
          form.setFieldValue(
            ["address_info", name, "district"],
            findDistrict.name
          );
      }
    }
    return () => {
      count.current = 1;
    };
  }, [districts, form, name, defaultDistrict]);

  useEffect(() => {
    const city =
      defaultCity || form.getFieldValue(["address_info", name, "city"]);
    if (city && cities.data.length > 0) {
      setCityId(cities.data.find((c) => c.name === city)?.id || 0);
    }
  }, [form, cities, name, defaultCity]);

  useEffect(() => {
    setShowToFill(
      is_present || addresses.length === 0 || form.getFieldValue(name) === OTHER
    );
  }, [form, name, updateResident, addresses, is_present]);

  useEffect(() => {
    if (!cities.is_loaded) {
      dispatch(asyncLoadCites());
    }
  }, [cities.is_loaded, dispatch]);

  useEffect(() => {
    setProvince(
      cities.data.map((item: any) => ({
        label: item.name,
        value: item.name,
      }))
    );
  }, [cities]);
  useEffect(() => {
    setDistrict(
      districts.data.map((item: any) => ({
        label: item.name,
        value: item.name,
      }))
    );
  }, [districts]);
  useEffect(() => {
    setWard(
      wards.data.map((item: any) => ({
        label: item.name,
        value: item.name,
      }))
    );
  }, [wards]);

  return (
    <Row gutter={[12, 0]}>
      {addresses.length > 0 && !is_present && (
        <Col span={24}>
          <Form.Item
            name={name}
            label={t("AT")}
            rules={[{ required, message: t("PLEASE_INPUT") }]}
          >
            <PAPSelect
              onChange={(value) => updateAddress(value)}
              options={addresses
                .map((item) => ({
                  label: item,
                  value: item,
                }))
                .concat({
                  label: t("ADDRESS_OTHER"),
                  value: OTHER,
                })}
              placeholder={t("CHOOSE_PLACEHOLDER")}
            />
          </Form.Item>
        </Col>
      )}

      <Col span={12}>
        <Form.Item
          name={["address_info", name, "city"]}
          label={t("PROVINCE")}
          rules={[{ required, message: t("PLEASE_INPUT") }]}
          hidden={!showToFill}
          extra={<PAPError error={cities.error} />}
        >
          <AntSelect
            placeholder={t("CHOOSE_PLACEHOLDER")}
            onChange={onCityChange}
            value={form.getFieldValue(["address_info", name, "city"])}
            options={province}
            allowClear={!required}
            loading={cities.loading}
            showSearch
            onSearch={(value) => {
              handleSearch(value, province, setProvince);
            }}
            onFocus={() => {
              handleFocus(
                cities.data.map((item) => ({
                  label: item.name,
                  value: item.name,
                })),
                setProvince,
                "province"
              );
            }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={["address_info", name, "district"]}
          label={t("DISTRICT")}
          rules={[
            { required: required || !!cityId, message: t("PLEASE_INPUT") },
          ]}
          hidden={!showToFill}
          extra={<PAPError error={districts.error} />}
        >
          <AntSelect
            placeholder={t("CHOOSE_PLACEHOLDER")}
            onChange={onDistrictChange}
            value={form.getFieldValue(["address_info", name, "district"])}
            options={district}
            loading={districts.loading}
            showSearch
            onSearch={(value) => {
              handleSearch(value, district, setDistrict);
            }}
            onFocus={() => {
              handleFocus(
                districts.data.map((item) => ({
                  label: item.name,
                  value: item.name,
                })),
                setDistrict,
                "district"
              );
            }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={["address_info", name, "ward"]}
          label={t("WARD")}
          rules={[
            { required: required || !!cityId, message: t("PLEASE_INPUT") },
          ]}
          hidden={!showToFill}
          extra={<PAPError error={wards.error} />}
        >
          <AntSelect
            value={form.getFieldValue(["address_info", name, "ward"])}
            placeholder={t("CHOOSE_PLACEHOLDER")}
            options={ward}
            loading={wards.loading}
            showSearch
            onSearch={(value) => {
              handleSearch(value, ward, setWard);
            }}
            onChange={onWardChange}
            onFocus={() => {
              handleFocus(
                wards.data.map((item) => ({
                  label: item.name,
                  value: item.name,
                })),
                setWard,
                "ward"
              );
            }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={["address_info", name, "street"]}
          label={t("HOUSE_NUMBER")}
          rules={[
            { required: required || !!cityId, message: t("PLEASE_INPUT") },
          ]}
          hidden={!showToFill}
        >
          <PAPInput placeholder={t("HOUSE_NUMBER")} />
        </Form.Item>
      </Col>
    </Row>
  );
}

export default AddressInput;
