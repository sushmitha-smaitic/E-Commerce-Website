import bcrypt from "bcryptjs";
import { Product } from "./models/productModel";
import { User } from "./models/userModel";

export const sampleProducts: Product[] = [
  {
    name: "Nike Slim Shirt",
    slug: "nike-slim-shirt",
    category: "Shirts",
    image: "../images/img1.jpg",
    price: 120,
    countInStock: 10,
    brand: "Nike",
    rating: 4.5,
    numReviews: 10,
    description: "high quality shirt",
    discount: 12,
  },
  {
    name: "Adidas Fit Shirt",
    slug: "adidas-fit-shirt",
    category: "Shirts",
    image: "../images/img2.jpg",
    price: 540,
    countInStock: 0,
    brand: "Adidas",
    rating: 4.0,
    numReviews: 6,
    description: "high quality shirt",
    discount: 10,
  },
  {
    name: "Lacoste Free Pants",
    slug: "lacoste-free-pant",
    category: "Pants",
    image: "../images/img3.jpg",
    price: 300,
    countInStock: 7,
    brand: "Lacoste",
    rating: 3.0,
    numReviews: 32,
    description: "high quality pant",
    discount: 15,
  },
  {
    name: "Nike Slim Pant",
    slug: "nike-slim-pant",
    category: "Pants",
    image: "../images/img4.jpg",
    price: 200,
    countInStock: 20,
    brand: "Nike",
    rating: 4.3,
    numReviews: 9,
    description: "high quality shirt",
    discount: 12,
  },
];

export const sampleUsers: User[] = [
  {
    name: "Michael",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456"),
    isAdmin: true,
  },
  {
    name: "Andrew",
    email: "user@example.com",
    password: bcrypt.hashSync("123456"),
    isAdmin: false,
  },
];
