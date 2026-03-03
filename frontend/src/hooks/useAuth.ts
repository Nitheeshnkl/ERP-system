import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../app/store'
import { logout } from '../features/auth/authSlice'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)

  const handleLogout = async () => {
    await dispatch(logout())
  }

  return {
    ...auth,
    logout: handleLogout,
  }
}
