
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import {
    Route,
    RouterProvider,
    createBrowserRouter,
    createRoutesFromElements,
} from "react-router-dom";
import App from './App.tsx';
import { StoreProvider } from './Store.tsx';
import AdminRoute from './components/Admin Route.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './index.css';
import CartPage from './pages/CartPage.tsx';
import HomePage from './pages/HomePage.tsx';
import OrderHistoryPage from './pages/OrderHistoryPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import PaymentMethodPage from './pages/PaymentMethodPage.tsx';
import PlaceOrderPage from './pages/PlaceOrder.tsx';
import ProductPage from './pages/ProductPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SearchPage from './pages/SearchPage.tsx';
import ShippingAddressPage from './pages/ShippingAddressPage.tsx';
import SignInPage from './pages/SignInPage.tsx';
import SignupPage from './pages/SignUpPage';
import DashboardPage from './pages/admin/DashboardPage.tsx';
import OrderListPage from './pages/admin/OrderListPage.tsx';
import ProductEditPage from './pages/admin/ProductEditPage.tsx';
import ProductListPage from './pages/admin/ProductListPage.tsx';
import UserEditPage from './pages/admin/UserEditPage.tsx';
import UserListPage from './pages/admin/UserListPage.tsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index = {true} element={<HomePage/>}/>
      <Route path="product/:slug" element={<ProductPage/>}/>
      <Route path="/cart" element={<CartPage/>}/>
      <Route path="/signin" element={<SignInPage/>}/>
      <Route path="/search" element={<SearchPage/>}/>
      <Route path='/signup' element={<SignupPage/>}/>

      {/* Normal Users */}
      <Route path='' element={<ProtectedRoute/>}>
        <Route path='/admin' element={<AdminRoute/>}/>
        <Route path='/shipping' element={<ShippingAddressPage/>}/>
        <Route path='/payment' element={<PaymentMethodPage/>}/>
        <Route path='/placeorder' element={<PlaceOrderPage/>}/>
        <Route path='/order/:id' element={<OrderPage/>}/>
        <Route path='/orderhistory' element={<OrderHistoryPage/>}/>
        <Route path="/profile" element={<ProfilePage/>} />

      </Route>

      {/* Admin Users */}
      <Route path='' element={<AdminRoute/>}>
        <Route path='/admin/orders' element={<OrderListPage/>}/>
        <Route path='/admin/dashboard' element={<DashboardPage/>}/>
        <Route path='/admin/products' element={<ProductListPage/>}/>
        <Route path="/admin/product/:id" element={<ProductEditPage />} />
        <Route path="/admin/users" element={<UserListPage />} />
        <Route path="/admin/user/:id" element={<UserEditPage />} />
      </Route>
      {/* <Route path="dashboard" element={<Dashboard />} /> */}
      {/* ... etc. */}
    </Route>
  )
);

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <PayPalScriptProvider options={{'clientId':'sb'}}
       deferLoading={true}>
        <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false}/>
     </QueryClientProvider>
    </HelmetProvider>

      </PayPalScriptProvider>
    
    </StoreProvider>
  </React.StrictMode>,
)
