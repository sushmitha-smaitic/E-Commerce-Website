import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Chart from 'react-google-charts'
import LoadingBox from '../../components/LoadingBox'
import MessageBox from '../../components/MessageBox'
import { useGetOrderSummaryQuery } from '../../hooks/orderHooks'
import { ApiError } from '../../types/ApiError'
import { getError } from '../../utils'

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useGetOrderSummaryQuery()

  return (
    <div>
      <h1>Dashboard</h1>
      {isLoading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{getError(error as unknown as ApiError)}</MessageBox>
      ) : !summary ? (
        <MessageBox variant="danger">Summary not found</MessageBox>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                  <Card.Text> Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text> Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    <span>&#8377;</span>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text> Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="my-3">
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map(
                    (x: { _id: string; sales: number }) => [x._id, x.sales]
                  ),
                ]}
              ></Chart>
            )}
          </div>
          <div className="my-3">
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map(
                    (x: { _id: string; count: number }) => [x._id, x.count]
                  ),
                ]}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  )
}