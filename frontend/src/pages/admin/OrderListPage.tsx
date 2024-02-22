import { Button, Table } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import LoadingBox from "../../components/LoadingBox";
import MessageBox from "../../components/MessageBox";
import { useGetOrdersQuery } from "../../hooks/orderHooks";
import { ApiError } from "../../types/ApiError";
import { getError } from "../../utils";
const OrderListPage = () => {
    const {data:orders, isLoading, error}=useGetOrdersQuery();
    console.log(orders);
    
    
  return <>
  <h1>Orders</h1>{isLoading?<LoadingBox/>:error?<MessageBox variant="danger">{getError(error as unknown as ApiError)}</MessageBox>:(
    <Table striped hover responsive className='table-sm'>
        <thead>
            <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
          {orders?.map((order)=>(<tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.user && order.user.name}</td>
            <td>{order.createdAt?.substring(0,10)}</td>
            <td><span>&#8377;</span>{order.totalPrice}</td>
            <td>{order.isPaid?(order.paidAt):(<FaTimes style={{color:'red'}}/>)}</td>
            <td>{order.isDelivered?(order.deliveredAt):(<FaTimes style={{color:'red'}}/>)}</td>
            <td><LinkContainer to={`/order/${order._id}`}>
              <Button variant="light" className="btn-sm">Details</Button></LinkContainer></td>
          </tr>))}
           
        </tbody>
    </Table>
  )}</>
}

export default OrderListPage