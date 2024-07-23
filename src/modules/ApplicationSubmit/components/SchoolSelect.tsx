import { Form, Radio } from 'antd';
import { useAppDispatch, useAppSelector } from 'appRedux';
import {
  DEFAULT_SCHOOL_LEVEL,
  PRIVATE_SCHOOL,
  SCHOOL_MAPPING,
  YES,
} from 'common/data';
import { AntSelect } from 'core/pures/PAPInput';
import { asyncLoadSchool, getListSchool } from 'modules/Config/slice';
import { SchoolLevel, SchoolLevelOptions } from 'modules/Config/type';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import styled from 'styled-components';

type SchoolOptions = {
  value: string;
  label: string;
};

function getLevels(levels: SchoolLevel[]): SchoolLevelOptions[] {
  return levels.map((item) => ({
    label: SCHOOL_MAPPING[item],
    value: item,
  }));
}

function getLevelDefault(name: string) {
  if (!name) return null;
  if (name.match(/Purely ES/gi)) return 'Only elementary education';
  if (name.match(/JHS/gi)) return 'Junior high school';
  if (name.match(/SHS/gi)) return 'Senior high school';
  if (name.match(/All offerings (K to 12)/gi))
    return 'From kindergarten to grade 12';
  return null;
}

function SchoolSelect({
  updateLevel,
  required,
  hasSchoolDefault,
}: {
  updateLevel: (level: string) => void;
  required: boolean;
  hasSchoolDefault?: boolean;
}): JSX.Element {
  const { t } = useTranslation();

  const { data, is_loaded, list, loading } = useAppSelector(
    (state) => state.config.schools,
    shallowEqual
  );
  const listOptConst = useMemo(
    () =>
      list.map((item) => ({
        label: item,
        value: item,
      })),
    [list]
  );
  const [searchTextTimeout, setSearchTextTimeout] = useState<any>();

  const [schools, setSchools] = useState<SchoolOptions[]>([]);
  const [level, setLevel] = useState<SchoolLevelOptions[]>(
    DEFAULT_SCHOOL_LEVEL.map((item) => ({
      label: t(item.label),
      value: item.value,
    }))
  );
  const [hasSchool, setHasSchool] = useState(hasSchoolDefault ?? true);

  const dispatch = useAppDispatch();

  const handleSearch = (value: string) => {
    if (searchTextTimeout) {
      clearTimeout(searchTextTimeout);
    }

    setSearchTextTimeout(
      setTimeout(() => {
        getListSchool(value).then((resp) => {
          if (resp.data.length > 0)
            setSchools(
              resp.data.map((item: any) => ({
                label: item.name,
                value: item.name,
              }))
            );
          else setSchools((state) => [...state, { label: value, value }]);
        });
      }, 200)
    );
  };

  const handleUpdateSchool = (value: string) => {
    setSchools(listOptConst);
    const find = data.filter((item) => item.name === value);
    if (!find?.length) {
      const levelDefault = getLevelDefault(value);
      if (levelDefault) updateLevel(levelDefault);
      setLevel(
        DEFAULT_SCHOOL_LEVEL.map((item) => ({
          value: item.value,
          label: t(item.label),
        }))
      );
      return;
    }
    if (find.length <= 1) {
      updateLevel(find[0].level);
    }
    setLevel(getLevels(find.map((item) => item.level)));
  };

  const handleFocus = () => {
    setSchools(listOptConst);
  };

  // const handleBlur = () => {
  //   setSchools(listOptConst);
  // };

  useEffect(() => {
    return () => clearTimeout(searchTextTimeout);
  }, [searchTextTimeout]);

  useEffect(() => {
    if (!is_loaded) {
      dispatch(asyncLoadSchool());
    } else {
      setSchools(
        list.map((item) => ({
          label: item,
          value: item,
        }))
      );
    }
  }, [is_loaded, list, dispatch, t]);

  useEffect(() => {
    setLevel(
      DEFAULT_SCHOOL_LEVEL.map((item) => ({
        label: t(item.label),
        value: item.value,
      }))
    );
  }, [t]);

  return (
    <>
      <Form.Item
        name='private_school'
        label={t('PRIVATE_SCHOOL')}
        rules={[{ required, message: t('PLEASE_INPUT') }]}
      >
        <TwoOptionSelect
          options={PRIVATE_SCHOOL.map((item) => ({
            label: t(item.label),
            value: item.value,
          }))}
          onChange={(e) => setHasSchool(e.target.value === YES)}
        />
      </Form.Item>
      {hasSchool && (
        <>
          <Form.Item
            name='school_name'
            label={t('SCHOOL_NAME')}
            rules={[{ required, message: t('PLEASE_INPUT') }]}
          >
            <AntSelect
              style={{ width: '100%' }}
              showSearch
              onSearch={handleSearch}
              onFocus={handleFocus}
              onChange={handleUpdateSchool}
              // onBlur={handleBlur}
              options={schools}
              loading={loading}
              placeholder={t('INPUT_OR_CHOOSE_FROM_LIST')}
            />
          </Form.Item>
          <Form.Item
            name='school_level'
            label={t('SCHOOL_LEVEL')}
            rules={[{ required, message: t('PLEASE_INPUT') }]}
            hidden={level?.length <= 1}
          >
            <AntSelect options={level} placeholder={t('CHOOSE_PLACEHOLDER')} />
          </Form.Item>
        </>
      )}
    </>
  );
}

export default SchoolSelect;

const TwoOptionSelect = styled(Radio.Group)`
  display: flex;
  gap: 40px;
`;
