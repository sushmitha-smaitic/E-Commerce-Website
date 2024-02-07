import React from "react";
import { Cart, cartItem } from './types/Cart';
import { UserInfo } from "./types/UserInfo";
type AppState = {
  mode: string;
  cart: Cart;
  userInfo?: UserInfo
};

const initialState: AppState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')!)
    :null,

  mode: localStorage.getItem("mode")
    ? localStorage.getItem("mode")!
    : window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
  cart:{
    cartItems:localStorage.getItem('cartItems')
              ? JSON.parse(localStorage.getItem('cartItems')!)
              :[],
    shippingAddress:localStorage.getItem('shippingAddress')
                    ?JSON.parse(localStorage.getItem('shippingAddress')!)
                    :{},
    paymentMethod: localStorage.getItem('paymentMethod')
                  ?localStorage.getItem('paymentMethod')!
                  :'PayPal',
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0
  }
};

type Action =
| { type: "SWITCH_MODE" } | { type: "CART_ADD_ITEM"; payload: cartItem}
| {type: "USER_SIGNIN"; payload: UserInfo};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_MODE":
      return { ...state, mode: state.mode === "dark" ? "light" : "dark" };
    case "CART_ADD_ITEM":{
      const newItem = action.payload
      const existItem = state.cart.cartItems.find(
      (item: cartItem)=>item._id===newItem._id
      )
      const cartItems = existItem
      ? state.cart.cartItems.map((item: cartItem)=>
        item._id === existItem._id ? newItem : item
      )
      : [...state.cart.cartItems, newItem]

      localStorage.setItem('cartItems',JSON.stringify(cartItems))

      return { ...state, cart: { ...state.cart, cartItems}}
    }
    case "USER_SIGNIN":
      return {...state, userInfo: action.payload}
      default:
        return state;
  }   
}

const defaultDispatch: React.Dispatch<Action> = () => initialState

const Store= React.createContext({
    state:initialState,
    dispatch: defaultDispatch,
})

function StoreProvider(props: React.PropsWithChildren<object>){
    const [state, dispatch]= React.useReducer<React.Reducer<AppState,Action>>(
        reducer,
        initialState
    )
    return <Store.Provider value={{state,dispatch}}{...props}/>
}
export { Store, StoreProvider };

