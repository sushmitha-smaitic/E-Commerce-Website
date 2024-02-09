import { AddProductToCartRequest } from "../model/CartModel/addProductToCart.request";
import { RemoveProductFromCartRequest } from "../model/CartModel/removeProductFromCart.request";
import { UpdateProductInCartRequest } from "../model/CartModel/updateProductInCart.request";

export interface cartService {
  addProductToCart(request: AddProductToCartRequest): string;
  removeProductFromCart(request: RemoveProductFromCartRequest): string;
  updateProductInCart(request: UpdateProductInCartRequest): string;
  viewCart(): object;
}
