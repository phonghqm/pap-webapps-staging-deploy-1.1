import API from 'common/API';
import request from 'utils/request';
import {
  ListProfilesResponse,
  SubmitUpdateApplicationRequest,
  SubmitResponse,
  UpdateSubmitResponse,
  UserUpdateFileActionLogRequest,
} from './type';

const apis = {
  submit: (data: SubmitUpdateApplicationRequest) =>
    request.post<SubmitResponse>(API.SUBMIT, data),
  updateSubmit: (data: SubmitUpdateApplicationRequest) =>
    request.put<UpdateSubmitResponse>(API.UPDATE_SUBMIT, data),
  getProfiles: () => request.get<ListProfilesResponse>(API.LIST_PROFILES),

  debug: (data: any) => request.post('/debug', data),

  logUserUpdateFileAction: (data: UserUpdateFileActionLogRequest) =>
    request.put('/profiles/user-update-file', data),
  getGuildeDocumentNeeded: () => request.get(API.DOCUMENT_NEEDED),
  saveApplication: (data: SubmitUpdateApplicationRequest) =>
    request.put<any>(API.SAVE_APPLICATION, data),
  saveCreatingProfile: (data: SubmitUpdateApplicationRequest) =>
    request.post<any>(API.SAVE_APPLICATION, data),
  getEkycImage: () => request.get(API.GET_EKYC),
};

export default apis;
