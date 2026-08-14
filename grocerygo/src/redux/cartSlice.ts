import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IGrocery {
  _id?: string
  name: string
  category: string
  price: string
  unit: string
  quantity: number
  image: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface ICartSlice {
  cartData: IGrocery[]
}

const initialState: ICartSlice = {
  cartData: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      const existingItem = state.cartData.find(item => item._id === action.payload._id)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.cartData.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter(item => item._id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ _id: string; quantity: number }>) => {
      const existingItem = state.cartData.find(item => item._id === action.payload._id)
      if (existingItem) {
        existingItem.quantity = action.payload.quantity
        if (existingItem.quantity <= 0) {
          state.cartData = state.cartData.filter(item => item._id !== action.payload._id)
        }
      }
    },
    clearCart: (state) => {
      state.cartData = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
