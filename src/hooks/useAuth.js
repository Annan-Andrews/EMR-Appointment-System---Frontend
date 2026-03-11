// src/hooks/useAuth.js
import { useSelector } from "react-redux";
import { selectUser, selectToken, selectLoading } from "../store/authSlice";

const useAuth = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const loading = useSelector(selectLoading);

  return { user, token, loading };
};

export default useAuth;
