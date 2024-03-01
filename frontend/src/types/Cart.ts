export type cartItem = {
  image: string | undefined;
  name: string;
  slug: string;
  quantity: number;
  countInStock: number;
  price: number;
  _id: string;
};

export type Location = {
  lat: number;
  lng: number;
};

export type shippingAddress = {
  fullName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  //location: Location;
};

export type Cart = {
  cartItems: cartItem[];
  shippingAddress: shippingAddress;
  paymentMethod: string;
  deliverySpeed: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};
