import { useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Product } from '../../../backend/src/types/Product';
import { Store } from '../Store';
import { cartItem } from '../types/Cart';
import { convertProductToCartItem } from '../utils';
import Rating from './Rating';
function ProductItem({product}:{product: Product}){
    const {state, dispatch} = useContext(Store)

    const  {
        cart: {cartItems},
    }= state

    const addToCartHandler = async(item: cartItem) =>{
        const existItem = cartItems.find((x)=>x._id===product._id)
        const quantity = existItem ? existItem.quantity + 1:1
        if(product.countInStock<quantity){
            alert('Sorry, Product is out of stock')
            return
        }
        dispatch({
            type: 'CART_ADD_ITEM',
            payload: {...item,quantity},
        })
        toast.success('Product added to the cart')
    }
    return <Card>
        <Link to={`/product/${product.slug}`}>
            <img src={product.image} className='card-img-top' alt={product.name}/>
        </Link>
        <Card.Body>
            <Link to={`/product/${product.slug}`}>
                <Card.Title>{product.name}</Card.Title>
            </Link>
            <Rating rating={product.rating} numReviews={product.numReviews}/>
            <Card.Text><span>&#8377;</span>{product.price}</Card.Text>
            {
                product.countInStock===0?(
                    <Button variant='light' disabled>Out Of Stock</Button>
                ):(
                    <Button onClick={()=>addToCartHandler(convertProductToCartItem(product))}>Add To Cart</Button>
                )
            }
        </Card.Body>
    </Card>
}
export default ProductItem