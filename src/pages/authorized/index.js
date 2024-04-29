import { useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

import SessionUserContext from "../../contexts/SessionUserContext";
import { getUser } from "../../api/user";

const Authorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  const idToken = new URLSearchParams(location.search).get("user");
  const { setUser } = useContext(SessionUserContext);
  const userID = jwtDecode(idToken);

  useEffect(() => {
    if (userID && token) {
      Cookies.set("userToken", token);
      Cookies.set("userID", userID.sub);

      getUser(
        {
          token: token,
          id: userID.sub,
        },
        (response) => {
          setUser(response?.data);
          navigate("/");
        }
      );
    }
  }, [token, userID, navigate, setUser]);

  return null;
};

export default Authorized;
