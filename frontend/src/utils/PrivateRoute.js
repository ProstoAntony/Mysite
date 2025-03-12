import { Route, Redirect } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const PrivateRoute = ({ component: Component, allowGuest, ...rest }) => {
    const { user } = useContext(AuthContext)

    return (
        <Route
            {...rest}
            render={props => {
                if (allowGuest) {
                    return <Component {...props} />
                }
                return user ? <Component {...props} /> : <Redirect to="/login" />
            }}
        />
    )
}

export default PrivateRoute