import {useState, useEffect} from "react";
import useAxios from "../utils/useAxios";
import ProductList from "../Shop/ProductList";
import {jwtDecode, jwtDecode as jwt_decode} from "jwt-decode";
import { Link } from "react-router-dom";
import { useCart } from '../context/CartContext';

function Dashboard() {

      const [res, setRes] = useState("")
      const api = useAxios();
      const token = localStorage.getItem("authTokens")
      const { cartItems } = useCart();  // Add this line to get cartItems from context

      if (token) {
        const decode = jwt_decode(token)
        var user_id = decode.user_id
        var username = decode.username
        var full_name = decode.full_name
        var image = decode.image

      } else {
      console.error("Token is not defined or invalid.");
      }

      useEffect(() => {
        const fetchData = async () => {
          try{
            const response = await api.get("/test/")
            setRes(response.data.response)
          } catch (error) {
            console.log(error);
            setRes("Something went wrong")
          }
        }
        fetchData()
      }, [])


      useEffect(() => {
        const fetchPostData = async () => {
          try{
            const response = await api.post("/test/")
            setRes(response.data.response)
          } catch (error) {
            console.log(error);
            setRes("Something went wrong")
          }
        }
        fetchPostData()
      }, [])

    return (
          <div className="container-fluid" style={{ paddingTop: "100px" }}>
      <div className="row">
        <nav className="col-md-2 d-none d-md-block bg-light sidebar mt-4">
          <div className="sidebar-sticky">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <i className="fas fa-home me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/orders">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  <i className="fas fa-box me-2"></i>
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/address">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Addresses
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/notifications">
                  <i className="fas fa-bell me-2"></i>
                  Notifications
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/wishlist">
                  <i className="fas fa-heart me-2"></i>
                  Wishlist
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-users me-2"></i>
                  Customers
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-chart-bar me-2"></i>
                  Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-puzzle-piece me-2"></i>
                  Integrations
                </Link>
              </li>
            </ul>
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
              <span>Saved reports</span>
              <Link className="d-flex align-items-center text-muted" to="#">
                <i className="fas fa-plus-circle"></i>
              </Link>
            </h6>
            <ul className="nav flex-column mb-2">
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-file-alt me-2"></i>
                  Current month
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-file-alt me-2"></i>
                  Last quarter
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-share-alt me-2"></i>
                  Social engagement
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">
                  <i className="fas fa-tag me-2"></i>
                  Year-end sale
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
            <h1 className="h2">My Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group mr-2">
                <button className="btn btn-sm btn-outline-secondary">Share</button>
                <button className="btn btn-sm btn-outline-secondary">Export</button>
              </div>
              <button className="btn btn-sm btn-outline-secondary dropdown-toggle">
                <span data-feather="calendar" />
                This week
              </button>
            </div>
          </div>
          {/*<canvas className="my-4" id="myChart" width={900} height={380} />*/}
          <div className='alert alert-success'>
            <strong>{res}</strong>
          </div>
          <h2>Section title</h2>
          <ProductList />
          <div className="table-responsive">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Header</th>
                  <th>Header</th>
                  <th>Header</th>
                  <th>Header</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1,001</td>
                  <td>Lorem</td>
                  <td>ipsum</td>
                  <td>dolor</td>
                  <td>sit</td>
                </tr>
                <tr>
                  <td>1,002</td>
                  <td>amet</td>
                  <td>consectetur</td>
                  <td>adipiscing</td>
                  <td>elit</td>
                </tr>
                <tr>
                  <td>1,003</td>
                  <td>Integer</td>
                  <td>nec</td>
                  <td>odio</td>
                  <td>Praesent</td>
                </tr>
                <tr>
                  <td>1,003</td>
                  <td>libero</td>
                  <td>Sed</td>
                  <td>cursus</td>
                  <td>ante</td>
                </tr>
                <tr>
                  <td>1,004</td>
                  <td>dapibus</td>
                  <td>diam</td>
                  <td>Sed</td>
                  <td>nisi</td>
                </tr>
                <tr>
                  <td>1,005</td>
                  <td>Nulla</td>
                  <td>quis</td>
                  <td>sem</td>
                  <td>at</td>
                </tr>
                <tr>
                  <td>1,006</td>
                  <td>nibh</td>
                  <td>elementum</td>
                  <td>imperdiet</td>
                  <td>Duis</td>
                </tr>
                <tr>
                  <td>1,007</td>
                  <td>sagittis</td>
                  <td>ipsum</td>
                  <td>Praesent</td>
                  <td>mauris</td>
                </tr>
                <tr>
                  <td>1,008</td>
                  <td>Fusce</td>
                  <td>nec</td>
                  <td>tellus</td>
                  <td>sed</td>
                </tr>
                <tr>
                  <td>1,009</td>
                  <td>augue</td>
                  <td>semper</td>
                  <td>porta</td>
                  <td>Mauris</td>
                </tr>
                <tr>
                  <td>1,010</td>
                  <td>massa</td>
                  <td>Vestibulum</td>
                  <td>lacinia</td>
                  <td>arcu</td>
                </tr>
                <tr>
                  <td>1,011</td>
                  <td>eget</td>
                  <td>nulla</td>
                  <td>Class</td>
                  <td>aptent</td>
                </tr>
                <tr>
                  <td>1,012</td>
                  <td>taciti</td>
                  <td>sociosqu</td>
                  <td>ad</td>
                  <td>litora</td>
                </tr>
                <tr>
                  <td>1,013</td>
                  <td>torquent</td>
                  <td>per</td>
                  <td>conubia</td>
                  <td>nostra</td>
                </tr>
                <tr>
                  <td>1,014</td>
                  <td>per</td>
                  <td>inceptos</td>
                  <td>himenaeos</td>
                  <td>Curabitur</td>
                </tr>
                <tr>
                  <td>1,015</td>
                  <td>sodales</td>
                  <td>ligula</td>
                  <td>in</td>
                  <td>libero</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
    )

}


export default Dashboard