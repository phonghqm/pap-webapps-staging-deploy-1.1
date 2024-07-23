import API from 'common/API';
import request from 'utils/request';
import { CreateUserDeviceReq } from './type';

const apis = {
  createUserDevice: (data: CreateUserDeviceReq) =>
    request({
      url: API.CREATE_USER_DEVICE_LOG,
      method: 'post',
      data,
    }),
};

export default apis;
