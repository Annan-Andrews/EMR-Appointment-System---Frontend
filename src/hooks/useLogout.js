// src/hooks/useLogout.js
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "../store/authSlice";
import { logoutApi } from "../api/authApi";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // silent fail — clear local state regardless
    } finally {
      dispatch(clearCredentials());
      navigate("/login");
    }
  };

  return logout;
};

export default useLogout;
