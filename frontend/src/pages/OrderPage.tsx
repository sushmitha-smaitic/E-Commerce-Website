import {
  PayPalButtons,
  PayPalButtonsComponentProps,
  SCRIPT_LOADING_STATE,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { Elements } from "@stripe/react-stripe-js";
import { Stripe, StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import StripeCheckoutForm from "../components/StripeCheckoutForm";
import {
  useCreateStripePaymentIntentMutation,
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  useGetStripePublishableKeyQuery,
  usePackedOrderMutation,
  usePayOrderMutation,
  //usePickedUpOrderMutation,
  //useReturnOrderMutation,
  useShippedOrderMutation,
} from "../hooks/orderHooks";
import { ApiError } from "../types/ApiError";
import { getError } from "../utils";

export default function OrderPage() {
  const { state } = useContext(Store);
  const {
    userInfo,
    cart: { paymentMethod },
  } = state;

  const params = useParams();
  const { id: orderId } = params;

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(orderId!);

  const { mutateAsync: packOrder, isPending: loadingPacked } =
    usePackedOrderMutation();

  const { mutateAsync: shipOrder, isPending: loadingShipped } =
    useShippedOrderMutation();

  const { mutateAsync: deliverOrder, isPending: loadingDeliver } =
    useDeliverOrderMutation();

  // const { mutateAsync: initiateReturn, isPending: loadingReturn } =
  //   useReturnOrderMutation();

  // const { mutateAsync: pickOrder, isPending: loadingPickup } =
  //   usePickedUpOrderMutation();

  const navigate = useNavigate();
  async function returnHandler() {
    navigate(`/order/${orderId}/return`);
  }

  async function deliverOrderHandler() {
    try {
      await deliverOrder(orderId!);
      refetch();
      toast.success("Order is delivered");
    } catch (err) {
      toast.error(getError(err as ApiError));
    }
  }

  async function shipOrderHandler() {
    try {
      await shipOrder(orderId!);
      refetch();
      toast.success("Order is shipped");
    } catch (err) {
      toast.error(getError(err as ApiError));
    }
  }

  async function packOrderHandler() {
    try {
      await packOrder(orderId!);
      refetch();
      toast.success("Order is packed");
    } catch (err) {
      toast.error(getError(err as ApiError));
    }
  }

  const testPayHandler = async () => {
    await payOrder({ orderId: orderId! });
    refetch();
    toast.success("Order is paid");
  };

  // async function initiateReturnHandler() {
  //   try {
  //     await initiateReturn(orderId!);
  //     refetch();
  //     toast.success("Return is initiated");
  //   } catch (err) {
  //     toast.error(getError(err as ApiError));
  //   }
  // }

  // async function pickUpOrderHandler() {
  //   try {
  //     await pickOrder(orderId!);
  //     refetch();
  //     toast.success("Order is Picked Up");
  //   } catch (err) {
  //     toast.error(getError(err as ApiError));
  //   }
  // }
  const paypalbuttonTransactionProps: PayPalButtonsComponentProps = {
    style: { layout: "vertical" },
    async createOrder(data, actions) {
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
          return orderID;
        });
    },
    async onApprove(data, actions) {
      return actions.order!.capture().then(async (details) => {
        try {
          payOrder({ orderId: orderId!, ...details });
          refetch();
          toast.success("Order is paid");
        } catch (err) {
          toast.error(getError(err as ApiError));
        }
      });
    },
    onError: (err) => {
      toast.error(getError(err as ApiError));
    },
  };
  const [{ isPending, isRejected }, paypalDispatch] = usePayPalScriptReducer();
  const { refetch: fetchPayPalClientId } = useGetPaypalClientIdQuery();
  const { refetch: fetchStripePublishableKey } =
    useGetStripePublishableKeyQuery();
  const { mutateAsync: createIntent } = useCreateStripePaymentIntentMutation();
  const [stripePromise, setStripePromise] =
    useState<PromiseLike<Stripe | null> | null>(null);
  const [stripeOptions, setStripeOptions] = useState<StripeElementsOptions>({
    clientSecret: "",
  });
  useEffect(() => {
    const loadScript = async () => {
      if (order) {
        if (paymentMethod === "PayPal") {
          const { data } = await fetchPayPalClientId();
          paypalDispatch({
            type: "resetOptions",
            value: {
              clientId: data!.clientId,
              currency: "usd",
            },
          });
          paypalDispatch({
            type: "setLoadingStatus",
            value: SCRIPT_LOADING_STATE.PENDING,
          });
        } else if (paymentMethod === "Stripe") {
          const paymentIntent = await createIntent(orderId!);
          setStripeOptions({ clientSecret: paymentIntent.clientSecret });
          const { data } = await fetchStripePublishableKey();
          setStripePromise(loadStripe(data!.key));
        }
      }
    };
    loadScript();
  }, [order]);
  const { mutateAsync: payOrder, isPending: loadingPay } =
    usePayOrderMutation();

  return isLoading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">
      {getError(error as unknown as ApiError)}
    </MessageBox>
  ) : order ? (
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
                <strong>Name:</strong> {order!.shippingAddress.fullName} <br />
                <strong>Address: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                ,{order.shippingAddress.country}
                &nbsp;
              </Card.Text>
              {order.isPacked ? (
                <MessageBox variant="success">
                  Packed at {order.packedAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Not Yet Packed</MessageBox>
              )}
              {order.isShipped ? (
                <MessageBox variant="success">
                  Shipped at {order.shippedAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Not Yet Shipped</MessageBox>
              )}
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Not Delivered</MessageBox>
              )}
              {/* {order.isDelivered && order.isReturned ? (
                <MessageBox variant="success">Return Initiated</MessageBox>
              ) : (
                <MessageBox variant="warning">Return Not Accepted</MessageBox>
              )}
              {order.isPickedUp ? (
                <MessageBox variant="success">
                  Picked Up at {order.PickedUpAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Not Yet Picked Up</MessageBox>
              )} */}
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
                        ></img>
                        <br />
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>
                        <span>&#8377;</span>
                        {item.price}
                      </Col>
                    </Row>
                    <div>
                      <Button
                        id="ret-btn"
                        className="btn btn-primary mt-3"
                        type="button"
                        onClick={returnHandler}
                        hidden={
                          order.isDelivered == false ||
                          userInfo?.isAdmin == true
                        }
                        disabled={
                          (Date.now() - Date.parse(order.deliveredAt)) /
                            (1000 * 60 * 60 * 24) >
                          7
                        }
                      >
                        Return
                      </Button>
                    </div>
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
                    <Col>
                      <span>&#8377;</span>
                      {order.itemsPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>
                      <span>&#8377;</span>
                      {order.shippingPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>
                      <span>&#8377;</span>
                      {order.taxPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>
                        <span>&#8377;</span>
                        {order.totalPrice.toFixed(2)}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>{" "}
                {loadingPay && <LoadingBox></LoadingBox>}
                {!order.isPaid && order.paymentMethod !== "CashOnDelivery" && (
                  <ListGroup.Item>
                    {paymentMethod === "PayPal" ? (
                      isPending ? (
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
                      )
                    ) : (
                      <div>
                        <Elements
                          stripe={stripePromise!}
                          options={stripeOptions}
                        >
                          <StripeCheckoutForm
                            options={stripeOptions}
                            refetch={refetch}
                            orderId={orderId!}
                            payOrder={payOrder}
                          />
                        </Elements>
                      </div>
                    )}
                  </ListGroup.Item>
                )}
                {userInfo!.isAdmin && (
                  <ListGroup.Item>
                    {order.paymentMethod === "CashOnDelivery" &&
                      !order.isPaid &&
                      !order.isPacked && (
                        <>
                          {loadingPacked && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={packOrderHandler}>
                              Pack Order
                            </Button>
                          </div>
                        </>
                      )}
                    {(order.paymentMethod === "PayPal" ||
                      order.paymentMethod === "Stripe") &&
                      order.isPaid &&
                      !order.isPacked && (
                        <>
                          {loadingPacked && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={packOrderHandler}>
                              Pack Order
                            </Button>
                          </div>
                        </>
                      )}
                  </ListGroup.Item>
                )}
                {/* {userInfo!.isAdmin &&
                  !order.isPaid &&
                  order.paymentMethod === "CashOnDelivery" &&
                  !order.isPacked && (
                    <ListGroup.Item>
                      {loadingPacked && <LoadingBox></LoadingBox>}
                      <div className="d-grid">
                        <Button type="button" onClick={packOrderHandler}>
                          Pack Order
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )} */}
                {userInfo!.isAdmin && (
                  <ListGroup.Item>
                    {order.paymentMethod === "CashOnDelivery" &&
                      !order.isPaid &&
                      order.isPacked &&
                      !order.isShipped && (
                        <>
                          {loadingShipped && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={shipOrderHandler}>
                              Ship Order
                            </Button>
                          </div>
                        </>
                      )}
                    {(order.paymentMethod === "PayPal" ||
                      order.paymentMethod === "Stripe") &&
                      order.isPaid &&
                      order.isPacked &&
                      !order.isShipped && (
                        <>
                          {loadingShipped && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={shipOrderHandler}>
                              Ship Order
                            </Button>
                          </div>
                        </>
                      )}
                  </ListGroup.Item>
                )}
                {userInfo!.isAdmin && (
                  <ListGroup.Item>
                    {order.paymentMethod === "CashOnDelivery" &&
                      !order.isPaid &&
                      order.isPacked &&
                      order.isShipped &&
                      !order.isDelivered && (
                        <>
                          {loadingDeliver && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={deliverOrderHandler}>
                              Deliver Order
                            </Button>
                          </div>
                        </>
                      )}
                    {(order.paymentMethod === "PayPal" ||
                      order.paymentMethod === "Stripe") &&
                      order.isPaid &&
                      order.isPacked &&
                      order.isShipped &&
                      !order.isDelivered && (
                        <>
                          {loadingDeliver && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={deliverOrderHandler}>
                              Deliver Order
                            </Button>
                          </div>
                        </>
                      )}
                  </ListGroup.Item>
                )}
                {/* {userInfo!.isAdmin && (
                  <ListGroup.Item>
                    {order.paymentMethod === "CashOnDelivery" &&
                      !order.isPaid &&
                      order.isPacked && 
                      !order.isShipped &&(
                        <>
                          {loadingPacked && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={shipOrderHandler}>
                              Ship Order
                            </Button>
                          </div>
                        </>
                      )}
                    {(order.paymentMethod === "PayPal" ||
                      order.paymentMethod === "Stripe") &&
                      order.isPaid &&
                      order.isPacked && 
                      !order.isShipped &&(
                        <>
                          {loadingPacked && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={shipOrderHandler}>
                              Ship Order
                            </Button>
                          </div>
                        </>
                      )}
                  </ListGroup.Item>
                )}
                {userInfo!.isAdmin &&
                  order.isPaid &&
                  order.isPacked &&
                  order.isShipped &&
                  !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox></LoadingBox>}
                      <div className="d-grid">
                        <Button type="button" onClick={deliverOrderHandler}>
                          Deliver Order
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )} */}
              </ListGroup>
            </Card.Body>
          </Card>
          {userInfo!.isAdmin &&
            order.isPacked &&
            order.isShipped &&
            order.isDelivered &&
            !order.isReturned && (
              <ListGroup.Item>
                {/* {loadingReturn && <LoadingBox></LoadingBox>}
                <div className="d-grid">
                  <Button type="button" onClick={initiateReturnHandler}>
                    Initiate Return
                  </Button>
                </div> */}
              </ListGroup.Item>
            )}
          {userInfo!.isAdmin &&
            order.isPacked &&
            order.isShipped &&
            order.isDelivered &&
            order.isReturned &&
            !order.isPickedUp && (
              <ListGroup.Item>
                {/* {loadingPickup && <LoadingBox></LoadingBox>}
                <div className="d-grid">
                  <Button type="button" onClick={pickUpOrderHandler}>
                    PickUp Return
                  </Button>
                </div> */}
              </ListGroup.Item>
            )}
        </Col>
      </Row>
    </div>
  ) : (
    <div>no order data</div>
  );
}
