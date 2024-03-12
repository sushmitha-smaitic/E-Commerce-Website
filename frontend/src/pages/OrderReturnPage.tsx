import React, { useContext, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { useGetOrderDetailsQuery } from "../hooks/orderHooks";
import { ApiError } from "../types/ApiError";
import { getError } from "../utils";

const OrderReturnPage = () => {
  const params = useParams();
  const { state, dispatch } = useContext(Store);
  //const navigate = useNavigate();
  const { id: orderId } = params;
  const {
    returnOrder: { returnReason, returnMethod },
  } = state;
  const [ReturnReason, setReturnReason] = useState(
    returnReason || "Damaged Product"
  );

  const [ReturnMethod, setReturnMethod] = useState(
    returnMethod || "Replace Item"
  );
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId!);

  const submitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch({ type: "SAVE_RETURN_REASON", payload: returnReason });
    localStorage.setItem("returnReason", ReturnReason);
    dispatch({ type: "SAVE_RETURN_METHOD", payload: returnMethod });
    localStorage.setItem("returnMethod", ReturnMethod);
  };

  return isLoading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">
      {getError(error as unknown as ApiError)}
    </MessageBox>
  ) : order ? (
    <div>
      <Helmet>
        <title>Return Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Return Order {orderId}</h1>
      <div className="my-3">
        <h2>Why do you want to Return?</h2>
      </div>
      <Form onSubmit={submitHandler}>
        <div className="mb-3">
          <Form.Check
            type="radio"
            id="Damaged Product"
            label="Damaged Product"
            value="Damaged Product"
            checked={ReturnReason === "Damaged Product"}
            onChange={(e) => setReturnReason(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Form.Check
            type="radio"
            id="Quality Defect"
            label="Quality Defect"
            value="Quality Defect"
            checked={ReturnReason === "Quality Defect"}
            onChange={(e) => setReturnReason(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Form.Check
            type="radio"
            id="Bought by mistake"
            label="Bought by mistake"
            value="Bought by mistake"
            checked={ReturnReason === "Bought by mistake"}
            onChange={(e) => setReturnReason(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Form.Check
            type="radio"
            id="Incompatible or Not Useful"
            label="Incompatible or Not Useful"
            value="Incompatible or Not Useful"
            checked={ReturnReason === "Incompatible or Not Useful"}
            onChange={(e) => setReturnReason(e.target.value)}
          />
        </div>
      </Form>
      <Card className="pt-3 ps-3">
        <Card.Title>
          <h2>Return / Replace Items</h2>
          <h3 className="mt-3">What do you want to do?</h3>
        </Card.Title>
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Check
              type="checkbox"
              label="Return Item and Refund the amount"
              value={"Refund Amount"}
              checked={ReturnMethod === "Refund Amount"}
              onChange={(e) => setReturnMethod(e.target.value)}
            />
            <Form.Check
              type="checkbox"
              label="Replace an Item"
              value={"Replace Item"}
              checked={ReturnMethod === "Replace Item"}
              onChange={(e) => setReturnMethod(e.target.value)}
            />
          </Form>
        </Card.Body>
      </Card>
      <div className="mb-3">
        <Button
          className="btn btn-primary mt-3"
          type="submit"
          onClick={submitHandler}
        >
          Proceed
        </Button>
      </div>
    </div>
  ) : (
    <div>no order data</div>
  );
};

export default OrderReturnPage;
