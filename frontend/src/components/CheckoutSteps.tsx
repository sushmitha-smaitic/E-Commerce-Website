import { Col, Row } from "react-bootstrap";

export default function CheckoutSteps(props: {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
  step4?: boolean;
  step5?: boolean;
}) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? "active" : " "}>Sign In</Col>
      <Col className={props.step2 ? "active" : " "}>Shipping</Col>
      <Col className={props.step3 ? "active" : " "}>Delivery</Col>
      <Col className={props.step4 ? "active" : " "}>Payment</Col>
      <Col className={props.step5 ? "active" : " "}>Place Order</Col>
    </Row>
  );
}
