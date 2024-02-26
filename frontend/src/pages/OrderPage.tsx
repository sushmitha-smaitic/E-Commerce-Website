import {
  PayPalButtons, PayPalButtonsComponentProps, SCRIPT_LOADING_STATE, usePayPalScriptReducer
} from '@paypal/react-paypal-js'
import { useContext, useEffect } from 'react'
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Store } from '../Store'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import {
  //useDeliveredOrderMutation,
  useGetOrderDetailsQuery, useGetPaypalClientIdQuery, usePayOrderMutation
} from '../hooks/orderHooks'
import { ApiError } from '../types/ApiError'
import { getError } from '../utils'
  
  export default function OrderPage() {
    const { state } = useContext(Store)
    const { userInfo } = state
  
    const params = useParams()
    const { id: orderId } = params

    
  
    const {
      data: order,
      isPending,
      error,
      refetch,
    } = useGetOrderDetailsQuery(orderId!)
  
    const { mutateAsync: payOrder, isPending: loadingPay } = usePayOrderMutation()
    //const {mutateAsync: deliverOrder, isPending:loadingDelivered }=useDeliveredOrderMutation()
  
    const testPayHandler = async () => {
      await payOrder({ orderId: orderId! })
      refetch()
      toast.success('Order is paid')
    }
  
    const [{ isRejected }, paypalDispatch] = usePayPalScriptReducer()
  
    const { data: paypalConfig } = useGetPaypalClientIdQuery()
  
    useEffect(() => {
      if (paypalConfig && paypalConfig.clientId) {
        const loadPaypalScript = async () => {
          paypalDispatch({
            type: 'resetOptions',
            value: {
              clientId: paypalConfig!.clientId,
              currency: 'INR',
            },
          })
          paypalDispatch({
            type: 'setLoadingStatus',
            value: SCRIPT_LOADING_STATE.PENDING,
          })
        }
        loadPaypalScript()
      }
    }, [paypalConfig])
  
    const paypalbuttonTransactionProps: PayPalButtonsComponentProps = {
      style: { layout: 'vertical' },
      createOrder(data, actions) {
        return actions.order
          .create({
            purchase_units: [
              {
                amount: {
                  value: order!.totalPrice.toString(),
                },
              },
            ],
          })
          .then((orderID: string) => {
            return orderID
          })
      },
      onApprove(data, actions){
        return actions.order!.capture().then(async (details) => {
          try {
            await payOrder({ orderId: orderId!, ...details })
            refetch()
            toast.success('Order is paid successfully')
          } catch (err) {
            toast.error(getError(err as ApiError))
          }
        })
      },
      onError: (err) => {
        toast.error(getError(err as ApiError))
      },
    }

    // const deliverOrderHandler=async()=>{
    //   if (!orderId) {
    //     toast.error('orderId is undefined')
    //     return;
    //   }
    //   try{
    //     await deliverOrder({orderId});
    //     refetch();
    //     toast.success('Order Delivered')
    //   }catch(err){
    //     getError(err as unknown as ApiError)
    //   }
    // }
  
    return isPending ? (
      <LoadingBox></LoadingBox>
    ) : error ? (
      <MessageBox variant="danger">{getError(error as unknown as ApiError)}</MessageBox>
    ) : !order ? (
      <MessageBox variant="danger">Order Not Found</MessageBox>
    ) : (
      <div>
        <Helmet>
          <title>Order {orderId}</title>
        </Helmet>
        <h1 className="my-3">Order {orderId}</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {order.shippingAddress.address},
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  ,{order.shippingAddress.country}
                </Card.Text>
                {order.isDelivered ? (
                  <MessageBox variant="success">
                    Delivered at {order.deliveredAt}
                  </MessageBox>
                ) : (
                  <MessageBox variant="warning">Not Delivered</MessageBox>
                )}
              </Card.Body>
            </Card>
  
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong> {order.paymentMethod}
                </Card.Text>
                {order.isPaid ? (
                  <MessageBox variant="success">
                    Paid at {order.paidAt}
                  </MessageBox>
                ) : (
                  <MessageBox variant="warning">Not Paid</MessageBox>
                )}
              </Card.Body>
            </Card>
  
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {order.orderItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded thumbnail"
                          ></img>{' '}
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
                        </Col>
                        <Col md={3}>
                          <span>{item.quantity}</span>
                        </Col>
                        <Col md={3}><span>&#8377;</span>{item.price}</Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col><span>&#8377;</span>{order.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col><span>&#8377;</span>{order.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax</Col>
                      <Col><span>&#8377;</span>{order.taxPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong> Order Total</strong>
                      </Col>
                      <Col>
                        <strong><span>&#8377;</span>{order.totalPrice.toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {!order.isPaid && (
                    <ListGroup.Item>
                      {isPending ? (
                        <LoadingBox />
                      ) : isRejected ? (
                        <MessageBox variant="danger">
                          Error in connecting to PayPal
                        </MessageBox>
                      ) : (
                        <div>
                          <PayPalButtons
                            {...paypalbuttonTransactionProps}
                          ></PayPalButtons>
                          <Button onClick={testPayHandler}>Test Pay</Button>
                        </div>
                      )}
                      {loadingPay && <LoadingBox></LoadingBox>}
                    </ListGroup.Item>
                  )}

                  {/* {loadingDelivered && <LoadingBox/>}
                  {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered &&(
                    <ListGroup.Item>
                      <Button type='button' className='btn btn-block' onClick={deliverOrderHandler}>Mark as Delivered</Button>
                    </ListGroup.Item>
                  )} */}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }