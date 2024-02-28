export type Product = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  image: string;
  banner: string;
  category: string;
  brand: string;
  price: number;
  countInStock: number;
  description: string;
  reviews: Review[];
  rating: number;
  numReviews: number;
  discount: number;
  maxQuantity: number;
};

export type Review = {
  _id: string;
  createdAt: string;
  name: string;
  rating: number;
  comment: string;
};
