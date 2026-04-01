import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const promptLogout = () => setOpen(true);

  const confirmLogout = () => {
    localStorage.removeItem("ku_current_user");
    setOpen(false);
    navigate("/auth");
  };

  const cancel = () => setOpen(false);

  return { open, promptLogout, confirmLogout, cancel };
}
