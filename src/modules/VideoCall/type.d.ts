export type CreateUserDeviceReq = {
  micro_permission?: string;
  camera_permission?: string;
  geo_permission?: string;
  user_agent?: string;
  pap_submitted_application_id?: number;
};
