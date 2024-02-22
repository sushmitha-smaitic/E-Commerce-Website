import axios from 'axios';
import { useEffect, useReducer, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet-async';
//import LinkContainer from 'react-router-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/ProductItem';
import Rating from '../components/Rating';
import { ApiError } from '../types/ApiError';
import { getError } from '../utils';

interface Product {
  _id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  countInStock:number;
  description:string;
  rating: number;
  numReviews:number;
  discount:number;
  maxQuantity: number
  // Define other properties of Product interface as per your data structure
}

interface Filter {
  page?: number;
  category?: string;
  query?: string;
  rating?: string|number;
  price?: string;
  order?: string;
}

interface State {
  loading: boolean;
  error: string;
  products: Product[];
  pages: number;
  countProducts: number;
}

type Action =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: { products: Product[]; page: number; pages: number; countProducts: number } }
  | { type: 'FETCH_FAIL'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const prices = [
  {
    name: 'Rs.1 to Rs.50',
    value: '1-50',
  },
  {
    name: 'Rs.51 to Rs.200',
    value: '51-200',
  },
  {
    name: 'Rs.201 to Rs.1000',
    value: '201-1000',
  },
];

const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search); // /search?category=Shirts
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || '1';

  const [{ loading, error, products, pages, countProducts }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
    pages: 0,
    countProducts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/search?query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err as unknown as ApiError) });
      }
    };
    fetchData();
  }, [category, error, order, page, price, query, rating]);

  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err as unknown as ApiError));
      }
    };
    fetchCategories();
  }, []);

  const getFilterUrl = (filter: Filter, skipPathname?: boolean): string => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    return `${skipPathname ? '' : '/search?'}category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h3>Department</h3>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </li>
              {Array.isArray(categories) && categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Price</h3>
            <ul>
              <li>
                <Link
                  className={'all' === price ? 'text-bold' : ''}
                  to={getFilterUrl({ price: 'all' })}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={p.value === price ? 'text-bold' : ''}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Avg. Customer Review</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : ''}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div>
                    {countProducts === 0 ? 'No' : countProducts} Results
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {price !== 'all' && ' : Price ' + price}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Sort by{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                    <option value="toprated">Avg. Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {products&&products.length === 0 && (
                <MessageBox>No Product Found</MessageBox>
              )}

              <Row>
                {products&&products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>

              <div>
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer key={x + 1} className="mx-1" to={{pathname:'/search',search:getFilterUrl({ page: x + 1 }, true),}}>
                  <Button
                    
                    className={Number(page) === x + 1 ? 'text-bold' : ''}
                    variant="light"
                  >
                    {x + 1}
                  </Button>
                  </LinkContainer>
                  // <LinkContainer
                  //   key={x + 1}
                  //   className="mx-1"
                  //   to={{
                  //     pathname: '/search',
                  //     seacrh: getFilterUrl({ page: x + 1 }, true),
                  //   }}
                  // >
                  //   <Button
                  //     className={Number(page) === x + 1 ? 'text-bold' : ''}
                  //     variant="light"
                  //   >
                  //     {x + 1}
                  //   </Button>
                  // </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}
