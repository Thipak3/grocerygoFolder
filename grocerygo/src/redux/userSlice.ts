import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IUser {
    _id: string
    name: string
    email: string
    mobile?: string
    role: "user" | "deliveryBoy" | "admin"
    image?: string
}
interface IUserState {
    userData:IUser | null
}


const initialState:IUserState = {
  userData: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUser>) => {
      state.userData = action.payload
    },
  },
})

export const { setUserData } = userSlice.actions
export default userSlice.reducer