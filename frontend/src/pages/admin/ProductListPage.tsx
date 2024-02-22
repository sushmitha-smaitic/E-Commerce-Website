import { Button, Col, Row, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { toast } from "react-toastify";
import LoadingBox from "../../components/LoadingBox";
import MessageBox from "../../components/MessageBox";
import { useCreateProductMutation, useGetProductsQuery } from "../../hooks/productHooks";
import { ApiError } from "../../types/ApiError";
import { getError } from "../../utils";
export default function ProductListPage() {
    const {data:products ,isLoading, error,refetch}=useGetProductsQuery()
    const createProductMutation = useCreateProductMutation();
    console.log(products);

    const deleteHandler= (id:string)=>{
        console.log('delete',id)
    }

    const createProductHandler=async()=>{
        if(window.confirm('Are you sure you want to create a new Product?')){
            try {
                await createProductMutation.mutate({
                    _id:"12345",
                    name: "Sample Name",
                    slug: "sample Product-slug",
                    image: "../../../frontend/public/images/Sample.jpg",
                    category: "Shirt",
                    brand: "Sample Brand",
                    price: 0,
                    countInStock: 0,
                    description: "Sample Description",
                    rating: 4.5,
                    numReviews: 0,
                    discount: 10,
                });
                refetch()
            } catch (err) {
                toast.error(getError(err as unknown as ApiError));
            }
        }
    }
  return (
    <>
    <Row className="align-items-center">
        <Col><h1>Products</h1></Col>
        <Col className="text-end">
            <Button className="btn-sm m-3" onClick={createProductHandler}><FaEdit/>Create Product</Button>
        </Col>
    </Row>
    {isLoading?<LoadingBox/>:error?<MessageBox variant="danger">{getError(error as unknown as ApiError)}</MessageBox>:(
        <>
        <Table striped hover responsive className="table-sm">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>BRAND</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {products&&products.map((product)=>(
                    <tr key={product._id}>
                        <td>{product._id}</td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.brand}</td>
                        <td><LinkContainer to={`/admin/product/${product._id}/edit`}>
                            <Button variant="light" className="btn-sm mx-2">
                                <FaEdit/></Button></LinkContainer>
                            <Button variant="danger" style={{color:"white"}} className="btn-sm" onClick={()=>deleteHandler(product._id)}><FaTrash/></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
        </>
    )}
    </>
  )
}

