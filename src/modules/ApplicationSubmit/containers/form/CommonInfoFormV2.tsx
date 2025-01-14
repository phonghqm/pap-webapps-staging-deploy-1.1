import { Col, Form, Radio, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import {
  ACCEPT_PAYMENT,
  ACCEPT_PAYMENT_REGISTER,
  AGREE_PAYMENT,
  ONE_MINUTE,
  PRIVATE_INSURANCE,
  RELATIONS,
  RELATION_REGISTER,
  YES,
} from "common/data";

import PAPInput, {
  PAPDatePicker,
  PAPInputNumber,
  PAPSelect,
} from "core/pures/PAPInput";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { PATTERN } from "utils/validation";
import UploadIdCard from "./UploadIdCard";
import {
  OperatingSystem,
  Profile,
  ProfileForm,
} from "modules/ApplicationSubmit/type";
import { saveCache } from "utils/cache";
import { useNavigate, useParams } from "react-router-dom";
import {
  localStorageService,
  removeCache,
  setCurrentPage,
  setPhone,
} from "utils/localStorage";
import store, { useAppDispatch, useAppSelector } from "appRedux";
import {
  convertProfileFormToProfile,
  convertSingpassDataToFormData,
  getStringFromAddress,
  preventWhiteSpace,
  str,
} from "utils/helpers";
import { EXPIRED_TOKEN, HOTLINE } from "common/constants";
import { HotlineComponent } from "core/business";
import AddressInputs from "./AddressInput";
import {
  CommonConfigSelect,
  HospitalSelect,
  SchoolSelect,
} from "modules/ApplicationSubmit/components";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { shallowEqual } from "react-redux";
import PAPUploadFilesV2 from "core/pures/PAPUploadFilesV2";
import UploadPrescriptionV2 from "./UploadPrescriptionV2";
import { EVENT_NAME, logGAEvent } from "utils/googleAnalytics";
import {
  asyncSaveApplication,
  asyncSaveCreatingProfile,
  // asyncUpdateApplication,
  clearRemovedImage,
  updateProfile,
} from "modules/ApplicationSubmit/slice";
import { PAPButton } from "core/pures";
import { ButtonContainer } from "core/pures/PAPBottomButton";
import {
  SubmitActionFunc,
  UNKNOWN,
  retrieveCoordination,
} from "../ListProfiles";
import platform from "platform";
import { ERROR_LOG_TYPE, sendErrorLog } from "utils/errors";
import { Modal } from "antd";
import { Description } from "modules/Result/components/WaitingModal";
import { useCoordination } from "hooks";
import { asyncAddAddress } from "modules/Config/slice";
import { asyncPollMyInfoData } from "modules/Singpass/slice";
import PATH from "common/path";

type InfoFormProps = {
  is_patient: boolean;
  is_present: boolean;
  title: string;
  onSubmit: (values: any) => void;
  data?: any;
};

export default function CommonInfoFormV2({
  is_patient,
  is_present,
  title,
  onSubmit,
  data,
}: InfoFormProps): JSX.Element {
  const { t } = useTranslation();
  const { index } = useParams();

  const [coordination, errorGPS] = useCoordination();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const UPLOAD_WORKING_STATE_DES = t("upload_working_state").split("|");
  const UPLOAD_ADDRESS_DES = t("upload_address").split("|");

  const [authPhone, authToken, authNew] = useAppSelector(
    (state) => [state.auth.phone, state.auth.token, state.auth.new],
    shallowEqual
  );
  const [singpassData] = useAppSelector(
    (state) => [state.singpass.singpassData],
    shallowEqual
  );

  const singpassToken = localStorage.getItem("singpassToken");

  const [profiles, reSubmit, pcCode] = useAppSelector(
    (state) => [state.submit.data, state.submit.reSubmit, state.submit.pcCode],
    shallowEqual
  );
  const { is_have_new, city, province, ward } = useAppSelector(
    (state) => state.config.new_address,
    shallowEqual
  );

  const [defaultCity, setDefaultCity] = useState("");
  const [defaultDistrict, setDefaultDistrict] = useState("");
  const [residentLiving, setResidentLiving] = useState(
    data?.address_info?.resident?.is_living || false
  );
  const [privateInsurance, setPrivateInsurance] = useState(
    data?.private_insurance === YES
  );
  const [acceptPaymentStatus, setAcceptPaymentStatus] = useState(
    data?.accept_payment_status
  );
  const [addresses, setAddresses] = useState<string[]>([]);
  const [updateResident, setUpdateResident] = useState(0);
  // const [validate, setValidate] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const required = useMemo(
    () => acceptPaymentStatus === AGREE_PAYMENT || is_patient,
    [acceptPaymentStatus, is_patient]
  );

  const acceptPaymentOptions = useMemo(
    () =>
      (is_present ? ACCEPT_PAYMENT_REGISTER : ACCEPT_PAYMENT).map((item) => ({
        label: t(item.label),
        value: item.value,
      })),
    [is_present, t]
  );
  const isSubmit = useMemo(() => authNew || reSubmit, [authNew, reSubmit]);
  const isSubmitApplication = localStorageService.get("isSubmitApplication");
  const [job, setJob] = useState<any>(
    ["HOUSEWIFE", "RETIREMENT"].includes(data?.job as string)
  );

  const [form] = useForm();
  const ref = useRef<any>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const beforeSubmit = useCallback(
    (values: any) => {
      // disable save cache if in update flow
      if (!authToken)
        saveCache(
          { ...values, is_new: false, is_saved: true },
          index as string
        );

      // remove ekyc_info if not have it
      if (values.ekyc_info && !values.ekyc_info?.extra_full_name) {
        delete values.ekyc_info;
      }
      const data = { ...values };
      if (["HOUSEWIFE", "RETIREMENT"].includes(data?.job as string)) {
        data.job_title = "NONE_OTHER_POSITION";
      }
      onSubmit({
        ...data,
        dob: data.dob ? data.dob?.format("YYYY-MM-DD") : null,
        done: true,
      });
    },
    [authToken, index, onSubmit]
  );
  const detectOperatingSystem = ((): OperatingSystem => {
    return {
      device_info: {
        name: platform.product || UNKNOWN,
        os: platform.os?.toString() || UNKNOWN,
        product: platform.product,
      },
      browser_info: {
        name: platform.name || UNKNOWN,
        version: platform.version || UNKNOWN,
      },
    };
  })();

  const saveApplication = useCallback(
    (profiles: any, removed_image_ids: string[]) => {
      setButtonLoading(true);
      const convertedProfiles = convertProfileFormToProfile(
        profiles,
        errorGPS ? null : coordination.join(","),
        isSubmit,
        pcCode
      );

      const dispatchAction: SubmitActionFunc = (profiles: Profile[]) => {
        logGAEvent(EVENT_NAME.BTN_UPDATE_APPLICATION_CONFIRM);
        if (isSubmitApplication) {
          return dispatch(
            asyncSaveApplication({
              profiles,
              os_info: detectOperatingSystem,
              removed_image_ids,
              react_app_version: process.env.REACT_APP_VERSION,
            })
          ).unwrap();
        } else {
          return dispatch(
            asyncSaveCreatingProfile({
              profiles,
              os_info: detectOperatingSystem,
              removed_image_ids,
              react_app_version: process.env.REACT_APP_VERSION,
            })
          ).unwrap();
        }
      };

      retrieveCoordination(errorGPS ? null : coordination, convertedProfiles, t)
        .then(dispatchAction)
        .then(() => {
          setButtonLoading(false);
          // clear cache and screen
          removeCache();
          showModal();
          dispatch(clearRemovedImage());
        })
        .catch((e) => {
          console.log("e: ", e);
          setButtonLoading(false);
          sendErrorLog(
            isSubmit ? ERROR_LOG_TYPE.SUBMIT_FLOW : ERROR_LOG_TYPE.UPDATE_FLOW,
            e
          );
          if (e.error.code === EXPIRED_TOKEN) {
            saveCache(profiles, index as string);
            setCurrentPage(index as string);
            navigate(`/login?isUpdate=true&phone=${authPhone}`);
          }
        });
    },
    [
      coordination,
      isSubmit,
      pcCode,
      t,
      dispatch,
      navigate,
      authPhone,
      detectOperatingSystem,
      errorGPS,
      index,
      isSubmitApplication,
    ]
  );

  const validateAndSubmit = useCallback(() => {
    form
      .validateFields()
      .then((res: any) => {
        const data = { ...res };

        if (is_have_new) {
          dispatch(
            asyncAddAddress({
              province: data.address_info.resident.city,
              city: data.address_info.resident.district,
              ward: data.address_info.resident.ward,
            })
          ).finally(() => {
            if (data.address_info?.termporary) {
              dispatch(
                asyncAddAddress({
                  province: data.address_info.termporary.city,
                  city: data.address_info.termporary.district,
                  ward: data.address_info.termporary.ward,
                })
              );
            }
          });
        }
      })

      .then(form.submit)

      .catch((err) => {
        console.log("err: ", err);
        const errorText =
          document.getElementsByClassName("ant-form-item-explain-error")?.[0] ||
          null;
        if (errorText) {
          errorText.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          return;
        }
        // setValidate(t('PLEASE_INPUT_FULL_FIELD'));
        // setTimeout(() => {
        //   setValidate('');
        // }, 3000);
      });
  }, [form]);

  // const submitForm = useCallback(() => {
  //   form
  //     .validateFields()
  //     .then((res) => {
  //       const data = { ...res };

  //       if (["HOUSEWIFE", "RETIREMENT"].includes(data?.job as string)) {
  //         data.job_title = "NONE_OTHER_POSITION";
  //       }
  //       const convertedValue = {
  //         ...data,
  //         dob: data.dob ? data.dob?.format("YYYY-MM-DD") : null,
  //         done: true,
  //       };
  //       if (convertedValue.is_present === 1) {
  //         // register
  //         logGAEvent(EVENT_NAME.BTN_FORM_REGISTRANT_NEXT);
  //         dispatch(
  //           updateProfile({
  //             profile: { ...convertedValue, is_saved: true },
  //             index: parseInt(index || "0", 10),
  //           })
  //         );
  //       } else if (convertedValue.patient_relationship === "OWNER") {
  //         // patient
  //         logGAEvent(EVENT_NAME.BTN_FORM_PATIENT_NEXT);

  //         dispatch(
  //           updateProfile({
  //             profile: { ...convertedValue, is_saved: true },
  //             index: parseInt(index || "2", 10),
  //           })
  //         );
  //       } else {
  //         // relative
  //         const idx = parseInt(index || "0", 10);
  //         dispatch(
  //           updateProfile({
  //             profile: { ...convertedValue, is_saved: true, is_new: false },
  //             index: idx,
  //           })
  //         );
  //         logGAEvent(EVENT_NAME.BTN_FORM_RELATIVE_NEXT);
  //       }
  //       const updatedProfiles = store.getState().submit.data;

  //       const updatedRemoveImage = store.getState().submit.removedImageIds;

  //       if (is_have_new) {
  //         console.log("province: ", province);
  //         console.log("city: ", city);
  //         console.log("ward: ", ward);

  //         dispatch(
  //           asyncAddAddress({
  //             province: data.address_info.resident.city,
  //             city: data.address_info.resident.district,
  //             ward: data.address_info.resident.ward,
  //           })
  //         ).finally(() => {
  //           if (data.address_info?.termporary) {
  //             dispatch(
  //               asyncAddAddress({
  //                 province: data.address_info.termporary.city,
  //                 city: data.address_info.termporary.district,
  //                 ward: data.address_info.termporary.ward,
  //               })
  //             );
  //           }
  //         });
  //       }

  //       !buttonLoading && saveApplication(updatedProfiles, updatedRemoveImage);
  //     })

  //     .catch((err) => {
  //       console.log("err: ", err);
  //       const errorText =
  //         document.getElementsByClassName("ant-form-item-explain-error")?.[0] ||
  //         null;
  //       if (errorText) {
  //         errorText.scrollIntoView({
  //           behavior: "smooth",
  //           block: "center",
  //           inline: "center",
  //         });
  //         return;
  //       }
  //     });
  // }, [form, dispatch, index, saveApplication, buttonLoading]);

  const navigateRestrive = () => {
    return navigate(`${PATH.RESTRIVE_INFO}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // disable save cache if in update flow
    if (authToken) return;

    const save = () => {
      const data = form.getFieldsValue();
      saveCache(data, index as string);
    };

    save();
    setPhone(authPhone);
    setCurrentPage(index as string);

    ref.current = setInterval(save, ONE_MINUTE);

    return () => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    };
  }, [form, index, authPhone, authToken]);

  useEffect(() => {
    if (is_present) return;
    const list: string[] = [];
    profiles.forEach((item) => {
      const resi = getStringFromAddress(item.address_info?.resident || {});
      const tmp = getStringFromAddress(item.address_info?.termporary || {});
      if (resi && !list.includes(resi)) {
        list.push(resi);
      }
      if (tmp && !list.includes(tmp)) {
        list.push(tmp);
      }
    });
    setAddresses(list);
  }, [profiles, form, is_present]);

  useEffect(() => {
    if (singpassToken) {
      setTimeout(() => {
        dispatch(asyncPollMyInfoData({ token: singpassToken })).then((res) => {
          if (res.payload.data) {
            const convertedValue = convertSingpassDataToFormData(
              res.payload.data,
              data
            );
            form.setFieldsValue(convertedValue);
            dispatch(
              updateProfile({
                profile: { ...convertedValue, is_saved: true },
                index: parseInt(index || "0", 10),
              })
            );
          }
        });
      }, 2000);
    }
  }, [dispatch, singpassToken]);
  return (
    <FormContainer>
      <Fixed>
        <Title>{title}</Title>
      </Fixed>
      <Form
        form={form}
        layout="vertical"
        onFinish={beforeSubmit}
        initialValues={{
          ...data,

          resident:
            getStringFromAddress(data?.address_info?.resident || {}) || null,
          termporary:
            getStringFromAddress(data?.address_info?.termporary || {}) || null,
          dob: data?.dob ? dayjs(data.dob) : null,
        }}
      >
        <Container
          gutter={{
            lg: 20,
            md: 18,
            sm: 18,
            xs: 16,
          }}
        >
          <CustomCol lg={8} md={12} xs={24}>
            <TitleInfo>{title}</TitleInfo>
            <Form.Item
              name="patient_relationship"
              label={t("RELATION_WITH_PATIENT")}
              rules={[{ required: true, message: t("PLEASE_INPUT") }]}
              hidden={is_patient}
            >
              <PAPSelect
                options={(is_present ? RELATION_REGISTER : RELATIONS).map(
                  (item) => ({
                    label: t(item.label),
                    value: item.value,
                  })
                )}
                placeholder={t("CHOOSE_PLACEHOLDER")}
              />
            </Form.Item>
            <Form.Item
              name="accept_payment_status"
              label={t("ACCEPT_PAYMENT_STATUS")}
              rules={[{ required: !is_patient, message: t("PLEASE_INPUT") }]}
              hidden={is_patient}
            >
              <PAPSelect
                placeholder={t("CHOOSE_PLACEHOLDER")}
                options={acceptPaymentOptions}
                onChange={(value) => setAcceptPaymentStatus(value)}
              />
            </Form.Item>
            {is_patient && <UploadPrescriptionV2 profileId={data?.id} />}
            {!is_present && (
              <UploadIdCard
                update={(data: any) => {
                  form.setFieldsValue(data);
                  setUpdateResident((i) => i + 1);
                }}
                setCity={setDefaultCity}
                setDistrict={setDefaultDistrict}
                required={required}
                addresses={addresses}
                profileId={data?.id}
                submit_id={data?.pap_submitted_application_id + ""}
              />
            )}

            {is_patient && <HospitalSelect disabled={!!data?.hospital} />}
            <Form.Item
              validateTrigger="onBlur"
              name="full_name"
              label={t("FULLNAME")}
              rules={[
                { required: true, message: t("PLEASE_INPUT") },
                {
                  pattern: PATTERN.FULLNAME,
                  message: t("INVALID_FULLNAME"),
                },
              ]}
            >
              <PAPInput placeholder={t("NAME_PLACEHOLDER")} />
            </Form.Item>
            <Form.Item
              name="phone"
              label={t("PHONE")}
              validateTrigger="onBlur"
              rules={[
                {
                  required: required || is_present,
                  message: t("PLEASE_INPUT"),
                },
                {
                  pattern: PATTERN.PHONE_PREFIX,
                  message: t("INVALID_PHONE"),
                },
              ]}
            >
              <PAPInput
                isTel
                disabled={is_present}
                placeholder={t("PHONE_PLACEHOLDER")}
                onKeyPress={preventWhiteSpace}
                onKeyDown={preventWhiteSpace}
              />
            </Form.Item>
            {is_present && (
              <Form.Item
                name="email"
                label={t("EMAIL")}
                validateTrigger="onBlur"
                rules={[
                  { required: true, message: t("PLEASE_INPUT") },
                  {
                    pattern: PATTERN.EMAIL,
                    message: t("INVALID_EMAIL"),
                  },
                ]}
              >
                <PAPInput placeholder={t("EMAIL_PLACEHOLDER")} />
              </Form.Item>
            )}
            <Form.Item
              name="id_card_number"
              validateTrigger="onBlur"
              label={t("PASSPORD_NUMBER")}
              rules={[
                {
                  required: required || is_present,
                  message: t("PLEASE_INPUT"),
                },
              ]}
            >
              <PAPInput isTel placeholder={t("ID_CARD_PLACEHOLDER")} />
            </Form.Item>
            <Form.Item
              name="dob"
              label={t("DATE_OF_BIRTH_LONG")}
              rules={[
                {
                  required: required || is_present,
                  message: t("PLEASE_INPUT"),
                },
              ]}
            >
              <PAPDatePicker
                format="YYYY/MM/DD"
                showToday={false}
                placeholder={t("DOB_PLACEHOLDER")}
              />
            </Form.Item>
            <Form.Item
              name="gender"
              label={t("GENDER")}
              rules={[
                {
                  required: required || is_present,
                  message: t("PLEASE_INPUT"),
                },
              ]}
            >
              <TwoOptionSelect>
                <Radio value="MALE">{t("MALE")}</Radio>
                <Radio value="FEMALE">{t("FEMALE")}</Radio>
              </TwoOptionSelect>
            </Form.Item>
            <Form.Item
              name="income"
              label={t("INCOME_MONTHLY")}
              rules={[
                { required, message: t("PLEASE_INPUT") },
                () => ({
                  validator(_, value) {
                    if (!value || value >= 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t("VALUE_CAN_NOT_LESS_THEN_0"));
                  },
                }),
              ]}
            >
              <PAPInputNumber />
            </Form.Item>
            <Form.Item
              name="job"
              label={t("CURRENT_JOB")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
            >
              <CommonConfigSelect
                onChange={(e) => {
                  if (["HOUSEWIFE", "RETIREMENT"].includes(e)) {
                    form.setFieldValue("job_title", "NONE_OTHER_POSITION");
                    setJob(false);
                  } else {
                    setJob(true);
                  }
                }}
                name="job"
              />
            </Form.Item>

            {job && (
              <Form.Item
                name="job_title"
                label={t("JOB_TITLE")}
                rules={[{ required, message: t("PLEASE_INPUT") }]}
              >
                <CommonConfigSelect name="job_title" />
              </Form.Item>
            )}
            <Form.Item name="job_description" label={t("JOB_DETAIL")}>
              <PAPInput placeholder={t("JOB_DESCRIPTION_PLACEHOLDER")} />
            </Form.Item>
            <Form.Item name="job_company_name" label={t("COMPANY_NAME")}>
              <PAPInput placeholder={t("COMPANY_NAME_PLACEHOLDER")} />
            </Form.Item>
            <Form.Item name="job_company_address" label={t("COMPANY_ADDRESS")}>
              <PAPInput placeholder={t("COMPANY_ADDRESS_PLACEHOLDER")} />
            </Form.Item>
          </CustomCol>
          <CustomCol lg={8} md={12} xs={24}>
            <Title>{t("RESIDENT_ADDRESS")}</Title>
            {/* <AddressInputs
              name="resident"
              form={form}
              defaultCity={defaultCity}
              defaultDistrict={defaultDistrict}
              required={required}
              addresses={addresses}
              updateResident={updateResident}
              is_present={is_present}
            /> */}
            <Form.Item
              name="address"
              label={t("Address")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
            >
              <PAPInput />
            </Form.Item>
            <Form.Item
              name="house_type"
              label={t("HOUSE_TYPE")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
            >
              <PAPInput />
            </Form.Item>
            <Form.Item
              name={["address_info", "resident", "is_owner"]}
              label={t("HOUSE_OWNER")}
              rules={[{ required, message: t("PLEASE_CHOOSE") }]}
            >
              <TwoOptionSelect>
                <Radio value={1}>{t("YES")}</Radio>
                <Radio value={0}>{t("NO")}</Radio>
              </TwoOptionSelect>
            </Form.Item>
            <Form.Item
              name={["address_info", "resident", "is_living"]}
              label={t("HOUSE_LIVING")}
              rules={[{ required, message: t("PLEASE_CHOOSE") }]}
            >
              <TwoOptionSelect
                onChange={(e) => setResidentLiving(e.target.value)}
              >
                <Radio value={1}>{t("YES")}</Radio>
                <Radio value={0}>{t("NO")}</Radio>
              </TwoOptionSelect>
            </Form.Item>
            {!residentLiving && (
              <>
                <Title>{t("TERMPORARY_ADDRESS")}</Title>
                <AddressInputs
                  name="termporary"
                  form={form}
                  required={required}
                  addresses={addresses}
                  is_present={is_present}
                />
                <Form.Item
                  name={["address_info", "termporary", "type"]}
                  label={t("HOUSE_TYPE")}
                  rules={[{ required, message: t("PLEASE_INPUT") }]}
                >
                  <CommonConfigSelect name="house_type" />
                </Form.Item>
                <Form.Item
                  name={["address_info", "termporary", "is_owner"]}
                  label={t("HOUSE_OWNER")}
                  rules={[{ required, message: t("PLEASE_CHOOSE") }]}
                >
                  <TwoOptionSelect>
                    <Radio value={1}>{t("YES")}</Radio>
                    <Radio value={0}>{t("NO")}</Radio>
                  </TwoOptionSelect>
                </Form.Item>
              </>
            )}
          </CustomCol>
          <CustomCol lg={8} md={12} xs={24}>
            <Title>{t("OTHER_INFO")}</Title>
            <Form.Item
              name="electric_bill"
              label={t("ELECTRIC_BILL_MONTHLY")}
              rules={[
                { required, message: t("PLEASE_INPUT") },
                () => ({
                  validator(_, value) {
                    if (!value || value >= 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t("VALUE_CAN_NOT_LESS_THEN_0"));
                  },
                }),
              ]}
            >
              <PAPInputNumber />
            </Form.Item>
            <Form.Item
              name="electric_users"
              label={t("ELECTRIC_BILL_PERSON")}
              rules={[
                { required, message: t("PLEASE_INPUT") },
                () => ({
                  validator(_, value) {
                    if ((!value && value !== 0) || value >= 1) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t("VALUE_IS_INVALID"));
                  },
                }),
              ]}
            >
              <PAPInputNumber showControls />
            </Form.Item>
            <Form.Item
              name="phone_brand"
              label={t("PHONE_USING_BRAND")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
            >
              <CommonConfigSelect name="phone_brand" />
            </Form.Item>
            <SchoolSelect
              updateLevel={(level: string) =>
                form.setFieldValue("school_level", level)
              }
              required={required}
              hasSchoolDefault={
                data?.private_school ? data?.private_school === YES : false
              }
            />
            <Form.Item
              name="private_insurance"
              label={t("PRIVATE_INSURANCE_OWNER")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
              extra={
                <InsuranceExplain>
                  {t("PRIVATE_INSURANCE_EXPLAIN")}
                </InsuranceExplain>
              }
            >
              <TwoOptionSelect
                onChange={(e) => setPrivateInsurance(e.target.value === YES)}
                options={PRIVATE_INSURANCE.map((item) => ({
                  label: t(item.label),
                  value: item.value,
                }))}
              />
            </Form.Item>
            {privateInsurance && (
              <Form.Item
                name="insurance_description"
                label={t("PRIVATE_INSURANCE_DESCRIPTION")}
                rules={[{ required, message: t("PLEASE_INPUT") }]}
              >
                <PAPInput
                  placeholder={t("PRIVATE_INSURANCE_DESCRIPTION_PLACEHOLDER")}
                />
              </Form.Item>
            )}

            <Form.Item
              name="loan"
              label={t("CREDIT_USING")}
              rules={[{ required, message: t("PLEASE_INPUT") }]}
            >
              <CommonConfigSelect name="loan" />
            </Form.Item>
            <UploadImageExplainContainer>
              <UploadTitle>{t("UPLOAD_FILE")}</UploadTitle>
              <UploadDescription>{t("UPLOAD_DESCRIPTION")}</UploadDescription>
            </UploadImageExplainContainer>
            <UploadSection>
              <UploadSectionHeader required>
                {t("JOB_AND_INCOME")}
              </UploadSectionHeader>
              <UploadUl>
                {UPLOAD_WORKING_STATE_DES.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </UploadUl>
              <Form.Item name="income_document_imgs">
                <PAPUploadFilesV2
                  from={"JOB_AND_INCOME"}
                  profile_id={data?.id}
                  submit_id={data?.pap_submitted_application_id + ""}
                />
              </Form.Item>
            </UploadSection>
            <UploadSection>
              <UploadSectionHeader>{t("LIVING_ADDRESS")}</UploadSectionHeader>
              <UploadUl>
                {UPLOAD_ADDRESS_DES.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </UploadUl>
              <Form.Item
                name={["address_info", "resident", "residence_document_imgs"]}
              >
                <PAPUploadFilesV2
                  from={"LIVING_ADDRESS"}
                  profile_id={data?.id}
                  submit_id={data?.pap_submitted_application_id + ""}
                />
              </Form.Item>
            </UploadSection>
            <UploadSection>
              <UploadSectionHeader>{t("ELECTRIC_BILL")}</UploadSectionHeader>
              <Form.Item name="electric_bill_document_imgs">
                <PAPUploadFilesV2
                  from={"ELECTRIC_BILL"}
                  profile_id={data?.id}
                  submit_id={data?.pap_submitted_application_id + ""}
                />
              </Form.Item>
            </UploadSection>
            <UploadSection>
              <UploadSectionHeader>{t("OTHER_IMAGE")}</UploadSectionHeader>
              <Form.Item name="other_document_imgs">
                <PAPUploadFilesV2
                  from={"OTHER_IMAGE"}
                  profile_id={data?.id}
                  submit_id={data?.pap_submitted_application_id + ""}
                />
              </Form.Item>
            </UploadSection>
          </CustomCol>
          <Form.Item name={["ekyc_info", "extra_dob"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "extra_expired_date"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "extra_full_name"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "extra_gender"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "extra_idcard_number"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "extra_pr_address"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "id_card_kind"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["ekyc_info", "portrait"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["id_card_front"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name={["id_card_back"]} hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name="pc_code" hidden>
            <PAPInput />
          </Form.Item>
          <Form.Item name="is_present" hidden>
            <TwoOptionSelect>
              <Radio value />
              <Radio value={false} />
            </TwoOptionSelect>
          </Form.Item>
          <Form.Item name="done" hidden>
            <TwoOptionSelect>
              <Radio value />
              <Radio value={false} />
            </TwoOptionSelect>
          </Form.Item>
          <Form.Item name="is_new" hidden>
            <TwoOptionSelect>
              <Radio value />
              <Radio value={false} />
            </TwoOptionSelect>
          </Form.Item>
          <Form.Item name="is_saved" hidden>
            <TwoOptionSelect>
              <Radio value />
              <Radio value={false} />
            </TwoOptionSelect>
          </Form.Item>
        </Container>
        {
          <ButtonWrapper>
            <SaveButton onClick={navigateRestrive} loading={buttonLoading}>
              {t("RESTRIVE_INFO")}
            </SaveButton>
            <HalfWidthButton onClick={validateAndSubmit} type="primary">
              {t("CONTINUE")}
            </HalfWidthButton>
          </ButtonWrapper>
        }
      </Form>
      <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
        <ModalContainer>
          <Title>{t("SAVE_APPLICATION")}</Title>
          <Description>{t("SAVE_APPLICATION_SUCCESS")}</Description>
        </ModalContainer>
      </Modal>
      <PhoneBtnContainer>
        <PhoneBtn href={`tel:${HOTLINE}`}>
          <HotlineComponent />
        </PhoneBtn>
      </PhoneBtnContainer>
    </FormContainer>
  );
}

const FormContainer = styled.div`
  margin-bottom: 6rem;
  padding-top: 1rem;
`;

const Container = styled(Row)`
  width: 100%;
  padding-inline: 8rem;
  padding-top: 1rem;
  margin-left: 0 !important;
  margin-right: 0 !important;

  @media screen and (max-width: 1208px) {
    padding-inline: 4rem;
  }

  @media screen and (max-width: 1208px) {
    padding-inline: 2rem;
  }

  @media screen and (max-width: 921px) {
    padding-inline: 1rem;
    padding-top: 0;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
`;

const TitleInfo = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;

  @media screen and (max-width: 540px) {
    visibility: hidden;
  }
`;

const TwoOptionSelect = styled(Radio.Group)`
  display: flex;
  gap: 40px;
`;

const UploadImageExplainContainer = styled.div`
  margin-block: 1.5rem;
`;

const UploadTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-block: 0;
`;

const UploadDescription = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: ${(props) => props.theme.grey6};
`;

const UploadUl = styled.ul`
  color: ${(props) => props.theme.grey6};
  font-size: 0.75rem;
  font-weight: 400;
  margin-block: 0 0.5rem;
  padding-inline-start: 20px;
`;

const CustomCol = styled(Col)`
  padding-inline: 3rem !important;

  @media screen and (max-width: 1440px) {
    padding-inline: 1.5rem !important;
  }

  @media screen and (max-width: 540px) {
    padding-inline: 0rem !important;
  }
`;

const Fixed = styled.div`
  display: none;
  @media screen and (max-width: 540px) {
    display: block;
    position: fixed;
    background: white;
    z-index: 3;
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    box-shadow: ${(props) => props.theme.boxShadow};
    padding-left: 16px;
    top: 55px;
  }
`;

const PhoneBtn = styled.a`
  width: fit-content;
`;

const UploadSection = styled.div`
  margin-block: 1rem;
`;

interface IUploadSectionHeader {
  required?: boolean;
}

const UploadSectionHeader = styled.h3<IUploadSectionHeader>`
  font-weight: 600;
  font-size: 0.75rem;
  margin-block: 0.5rem;

  /* &::before {
    ${(props) =>
    props.required &&
    `
      display: inline-block;
      margin-inline-end: 4px;
      color: #e52e63;
      font-size: 14px;
      font-family: SimSun,sans-serif;
      line-height: 1;
      content: "*";
  `}
  } */
`;

const PhoneBtnContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: right;
`;

const InsuranceExplain = styled.span`
  font-size: 0.625rem;
  font-style: italic;
  color: ${(props) => props.theme.grey6};
`;

const HalfWidthButton = styled(PAPButton)`
  width: 200px;
  min-width: fit-content;
  outline: none !important;

  @media screen and (max-width: 768px) {
    width: 50%;
  }
`;

const SaveButton = styled(HalfWidthButton)`
  background-color: #e37a04;
  color: #fae8c6;
  &:hover {
    color: #fae8c6 !important;
  }
`;

const ButtonWrapper = styled(ButtonContainer)`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  @media screen and (max-width: 768px) {
    justify-content: center;
  }
`;

const ModalContainer = styled.div`
  text-align: center;
`;
