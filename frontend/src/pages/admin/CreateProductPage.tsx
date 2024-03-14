import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../../components/LoadingBox";
import MessageBox from "../../components/MessageBox";
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useUploadProductMutation,
} from "../../hooks/productHooks";
import { ApiError } from "../../types/ApiError";
import { getError } from "../../utils";

export default function CreateProductPage() {
  const navigate = useNavigate();
  //const params = useParams()
  //const { id: productId } = params

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [countInStock, setCountInStock] = useState(0);
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { mutateAsync: createProduct, isPending: loadingCreate } =
    useCreateProductMutation();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        // _id: productId!,
        name,
        slug,
        price,
        image,
        images,
        category: selectedCategory,
        brand,
        //rating,
        discount,
        countInStock,
        description,
      });
      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(getError(err as ApiError));
    }
  };

  const { mutateAsync: uploadProduct, isPending: loadingUpload } =
    useUploadProductMutation();

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  const uploadFileHandler = async (
    e: React.FormEvent<HTMLInputElement>,
    forImages: boolean = false
  ) => {
    const file = e.currentTarget.files![0];
    const bodyFormData = new FormData();
    bodyFormData.append("image", file);

    try {
      const data = await uploadProduct(bodyFormData);

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success("Image uploaded successfully. click Update to apply it");
    } catch (err) {
      toast.error(getError(err as ApiError));
    }
  };

  const deleteFileHandler = async (fileName: string) => {
    setImages(images.filter((x) => x !== fileName));
    toast.success("Image removed successfully. click Update to apply it");
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Create Product</title>
      </Helmet>
      <h1>Create Product</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="slug">
          <Form.Label>Slug</Form.Label>
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Price</Form.Label>
          <Form.Control
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Image File</Form.Label>
          <Form.Control
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="imageFile">
          <Form.Label>Upload Image</Form.Label>
          <input type="file" onChange={uploadFileHandler}></input>
          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="additionalImage">
          <Form.Label>Additional Images</Form.Label>
          {images.length === 0 && <MessageBox>No image</MessageBox>}
          <ListGroup variant="flush">
            {images.map((x) => (
              <ListGroup.Item key={x}>
                {x}
                <Button variant="light" onClick={() => deleteFileHandler(x)}>
                  <i className="fa fa-times-circle"></i>
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>
        <Form.Group className="mb-3" controlId="additionalImageFile">
          <Form.Label>Upload Additional Image</Form.Label>

          <input
            type="file"
            onChange={(e) => uploadFileHandler(e, true)}
          ></input>

          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>
        <div>
          <label>Selected category:</label>
          <input type="text" value={selectedCategory} readOnly />
        </div>
        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categoriesLoading ? (
              <option disabled>Loading categories...</option>
            ) : (
              categories &&
              categories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            )}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="brand">
          <Form.Label>Brand</Form.Label>
          <Form.Control
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="countInStock">
          <Form.Label>Count In Stock</Form.Label>
          <Form.Control
            value={countInStock}
            onChange={(e) => setCountInStock(Number(e.target.value))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="discount">
          <Form.Label>Discount</Form.Label>
          <Form.Control
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            required
          />
        </Form.Group>
        <div className="mb-3">
          <Button disabled={loadingCreate} type="submit">
            Create
          </Button>
          {loadingCreate && <LoadingBox></LoadingBox>}
        </div>
      </Form>
      {/* )} */}
    </Container>
  );
}
