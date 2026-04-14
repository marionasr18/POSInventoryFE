import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUserRole, clearAuthSession } from "../authRole";
import "./POSStaffLayout.css";

export default function POSStaffLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (getUserRole() !== "pos") {
      navigate("/HomeDashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pos-staff-root">
      <div className="pos-staff-bar">
        <div className="pos-staff-bar__links">
          <NavLink
            to="/pos/sales"
            className={({ isActive }) =>
              `pos-staff-bar__link${isActive ? " pos-staff-bar__link--active" : ""}`
            }
            end
          >
            Transaction &amp; payment
          </NavLink>
          <NavLink
            to="/pos/purchase"
            className={({ isActive }) =>
              `pos-staff-bar__link${isActive ? " pos-staff-bar__link--active" : ""}`
            }
          >
            Purchase invoice
          </NavLink>
        </div>
        <button type="button" className="pos-staff-bar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <Outlet />
    </div>
  );
}
