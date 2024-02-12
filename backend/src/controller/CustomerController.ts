import { SignInRequest } from "../model/UserModel/signIn.request";
import { signInResponse } from "../model/UserModel/signIn.response";
import { customerService } from "../service/customer.service";

export class CustomerController {
  readonly customerService: customerService;
  constructor(customerService: customerService) {
    this.customerService = customerService;
  }

  public signIn(req: SignInRequest, res: signInResponse) {
    let request = req as SignInRequest;

    let response = res as signInResponse;
  }
}
