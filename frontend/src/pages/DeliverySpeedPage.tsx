import { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Store } from "../Store";
import CheckoutSteps from '../components/CheckoutSteps';

export default function DeliverySpeedPage(){
    const navigate=useNavigate()
    const {state, dispatch}= useContext(Store);
    const{
        cart:{
            shippingAddress, deliverySpeed},
    }= state
    const [deliverySpeedName, setDeliverySpeed]=useState(
        deliverySpeed||'Standard Delivery'
)
useEffect(()=>{
    if(!shippingAddress.address){
        navigate('/shipping')
    }
},[shippingAddress,navigate])
    const submitHandler = (e:React.SyntheticEvent)=>{
        e.preventDefault();
        dispatch({type:'SAVE_DELIVERY_SPEED', payload:deliverySpeedName})
        localStorage.setItem('deliverySpeed',deliverySpeedName)
        navigate('/payment')
    }

  return (
    
    <div>
        <CheckoutSteps step1 step2 step3></CheckoutSteps>
        <div className="container small-container"> 
                    <Helmet>
                        <title>Delivery Speed</title>
                    </Helmet>
                    <h1 className="my-3">Delivery Speed</h1>
                     <Form >
                     <div className="mb-3">
                            <Form.Check type="radio" id="StandardDelivery" label="Standard Delivery" value="Standard Delivery" checked={deliverySpeedName==='Standard Delivery'} onChange={(e)=>setDeliverySpeed(e.target.value)}/>
                    </div>
                        <div className="mb-3">
                            <Form.Check type="radio" id="OneDayDelivery" label="One Day Delivery" value="One Day Delivery" checked={deliverySpeedName==='One Day Delivery'} onChange={(e)=>setDeliverySpeed(e.target.value)}/>
                        </div>
                        <div className="mb-3">
                            <Form.Check type="radio" id="TwoDayDelivery" label="Two Day Delivery" value="Two Day Delivery" checked={deliverySpeedName==='Two Day Delivery'} onChange={(e)=>setDeliverySpeed(e.target.value)}/>
                        </div>
                        <div className="mb-3">
                            <Form.Check type="radio" id="SameDayDelivery" label="Same Day Delivery" value="Same Day Delivery"checked={deliverySpeedName==='Same Day Delivery'} onChange={(e)=>setDeliverySpeed(e.target.value)}/>
                        </div>
                        <div className="mb-3">
                            <Button type="submit" onClick={submitHandler}>
                                Continue
                            </Button>
                        </div>
                    </Form>
        </div>
    </div>
  )
}