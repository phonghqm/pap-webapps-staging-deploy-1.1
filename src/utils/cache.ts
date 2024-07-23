import { encodeText } from './helpers';
import { removeOneCache, setData } from './localStorage';

export const saveCache = (value: any, index: string) => {
  const str = encodeText(JSON.stringify({ ...value, index }));
  setData(str, index);
};

export const removeCache = (index: string) => {
  removeOneCache(index);
};
