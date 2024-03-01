import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { Helmet } from 'react-helmet-async'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Link } from 'react-router-dom'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import ProductItem from '../components/ProductItem'
import { useGetProductsQuery } from '../hooks/productHooks'
import { ApiError } from '../types/ApiError'
import { Product } from '../types/Product'
import { getError } from '../utils'

function HomePage() {
  const { data, isLoading, error } = useGetProductsQuery()

  return (
    <div>
      <Helmet>
        <title>Indian Bazaar</title>
      </Helmet>
      {isLoading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{getError(error as unknown as ApiError)}</MessageBox>
      ) : (
        <>
          <Carousel showThumbs={false} autoPlay>
            {data!.featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="flex"
              >
                <div>
                  <img src={product.banner} alt={product.name} />
                </div>
              </Link>
            ))}
          </Carousel>

          <h1>Latest Products</h1>
          <div className="products">
            <Row>
              {data!.latestProducts.map((product: Product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                  <ProductItem product={product}></ProductItem>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  )
}
export default HomePage