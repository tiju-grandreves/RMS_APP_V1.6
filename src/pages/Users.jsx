import { useState, useEffect } from "react";
import { Shield, Wrench, Settings, Receipt, Plus, Pencil, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import httpService from "../services/httpService";
import AddUser from "./AddUser";
import DeleteUser from "../components/common/DeleteUser";
import DataTable from "../components/common/DataTable";
import TableFilter from "../components/common/TableFilter";
import Pagination from "../components/common/Pagination";
import { showEventToast } from "../components/common/toastHelper";
 
const ROLE_META = {
  1: { label: "Admin", icon: Settings, bg: "#F1EBFC", text: "#7C3AED" },
  3: { label: "Service Officer", icon: Wrench, bg: "#EEF1F3", text: "#395062" },
  2: { label: "Receptionist", icon: Shield, bg: "#E3F6F6", text: "#0E9594" },
  4: { label: "Accountant", icon: Receipt, bg: "#FDEEDF", text: "#E8821E" },
};
 
const AVATAR_COLORS = ["#0E9594", "#395062", "#7C3AED", "#E8821E"];
 
const RoleBadge = ({ roleId }) => {
  const meta = ROLE_META[roleId] || ROLE_META[1];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      <Icon size={12} className="shrink-0" />
      {meta.label}
    </span>
  );
};
 
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
 
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // const response = await httpService.get("/user");
      const response = await httpService.get("/user", { page: 1, take: 200 });
      const fetched = response?.data?.rows || [];
      setUsers(fetched);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
      showEventToast("error", "Failed to Load Users", "We couldn't load the user list. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const getShopId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      return userData?.user?.shopId ?? userData?.shopId ?? null;
    } catch {
      return null;
    }
  };
 
  const fetchRoles = async () => {
    try {
      const shopId = getShopId();
      const params = { page: 1, take: 200, ...(shopId && { shopId }) };
      const res = await httpService.get("/user-role", params);
      const rows = res?.data?.rows ?? [];
      const activeRoles = rows.filter((r) => r.isActive);
      setRoles(activeRoles);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };
 
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);
 
  const handleEdit = async (user) => {
    try {
      const response = await httpService.get(`/user/${user.id}`);
      const userData = response?.data ?? response;
      setEditUser(userData);
    } catch (err) {
      console.error("Error fetching user by id:", err);
       showEventToast("error", "Failed to Load User", "We couldn't load this user's details. Please try again.");
    }
  };
 
  const handleDelete = (user) => {
    setDeleteUser(user);
  };
 
  const handleConfirmDelete = async (user) => {
    try {
      await httpService.remove(`/user/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteUser(null);
      showEventToast("delete", "User Deleted", `${user.name || "The user"} has been permanently removed.`);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
       showEventToast("error", "Failed to Delete User", "Something went wrong while deleting this user. Please try again.");
    }
  };
 
  const ROLE_FILTER_OPTIONS = ["All", ...roles.map((r) => r.name)];
 
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.phoneNumber || "").toLowerCase().includes(term);
 
    if (roleFilter === "All") return matchesSearch;
 
    const matchedRole = roles.find((r) => r.name === roleFilter);
    const matchesRole = matchedRole ? u.roleId === matchedRole.id : true;
 
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
 
  return (
    <Layout 
 showSearch={false} breadcrumbs={[{ label: "User Listing" }]}>
 
       <div className="-mt-2 px-3 sm:px-6 pt-4 sm:pt-5">

     
<div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2">

 
  <div className="flex-1 min-w-0" />

 
  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

  
    {/* <div className="flex-1 sm:flex-none"> */}
            <TableFilter
              search={search}
              onSearchChange={setSearch}
              filterValue={roleFilter}
              onFilterChange={setRoleFilter}
              searchPlaceholder="Search by name, email or phone"
              filterOptions={ROLE_FILTER_OPTIONS}
            />
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
              style={{ background: "#395062" }}
            >
              <Plus size={16} />
              Add User
            </button>
          {/* </div> */}
        </div>
 </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
 
        {loading ? (
          <div className="text-center py-16 text-text/50">Loading users...</div>
        ) : (
          <>
            <DataTable
              data={paginatedUsers}
              columns={[
                {
                  key: "no", title: "No.",
                   minWidth: "50px",
                  render: (_, idx) => (
                    <span className="text-xs font-medium" style={{ color: "#5a7585" }}>
                      {String((currentPage - 1) * pageSize + idx + 1).padStart(2, "0")}
                    </span>
                  ),
                },
                {
                  key: "name", title: "Name",
                  render: (row, idx) => (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                      >
                        {row.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-xs" style={{ color: "#1a2e38" }}>{row.name}</span>
                    </div>
                  ),
                },
                {
                  key: "email", title: "Email",
                  render: (row) => (
                    <span className="text-xs" style={{ color: "#5a7585" }}>{row.email}</span>
                  ),
                },
                {
                  key: "email", title: "Phone Number",
                  render: (row) => (
                    <span className="text-xs" style={{ color: "#5a7585" }}>{row.phoneNumber}</span>
                  ),
                },
                // {
                //   key: "email", title: "Password",
                //   render: (row) => (
                //     <span className="text-sm" style={{ color: "#5a7585" }}>{row.password}</span>
                //   ),
                // },
                {
                  key: "roleId", title: "Role",
                  render: (row) => <RoleBadge roleId={row.roleId} />,
                },
                {
                  key: "actions", title: "Action",
                  render: (row) => (
                   <div className="flex items-center gap-2" >
                     
                         <button
                           onClick={() => handleEdit(row)}
                           className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
                           style={{ background: "#fffbf0", color: "#d97706" }}
                           title="Edit"
                           >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      <button
                        onClick={() => handleDelete(row)}
                         className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                        style={{ background: "#fff5f5", color: "#d4183d" }}
                         title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ),
                },
              ]}
            />

            <Pagination
              totalRecords={filteredUsers.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
 
      <AddUser
        isOpen={drawerOpen || !!editUser}
        onClose={() => { setDrawerOpen(false); setEditUser(null); }}
        onSubmit={() => {
          fetchUsers();
        }}
        user={editUser}
      />
 
      <DeleteUser
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        user={deleteUser}
      />
    </Layout>
  );
};
 
export default Users;