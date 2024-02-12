import { SignInRequest } from "../model/UserModel/signIn.request";

export interface customerService {
  signIn(request: SignInRequest): string;
}
