// src/modules/auth/model/interfaces/auth-response.interface.ts
export interface IAuthResponse {
  user: {
    _id: string;
    email: string;
  };
  accessToken: string;
  refreshToken?: string;
}