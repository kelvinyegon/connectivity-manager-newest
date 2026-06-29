import { useState } from "react";
import { usersSeed } from "../data";
import { UserPlus, Shield, Eye, ToggleLeft, ToggleRight } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("nrcm-users") || "null") || usersSeed);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({name:"",email:"",role:"user"});

  const persist = next => { setUsers(next); localStorage.setItem("nrcm-users", JSON.stringify(next)); };
  const add = e => {
    e.preventDefault();
    persist([...users, {...form,id:Date.now(),active:true}]);
    setForm({name:"",email:"",role:"user"}); setShow(false);
  };
  const toggle = id => persist(users.map(x => x.id === id ? {...x,active:!x.active} : x));

  return (
    <>
      <div className="page-heading"><div><h2>User Management</h2><p>Manage administrators and read-only portal users.</p></div><button className="primary-btn" onClick={() => setShow(true)}><UserPlus size={17}/> Add user</button></div>
      <div className="panel">
        <div className="user-list">
          {users.map(user => (
            <div className="user-row" key={user.id}>
              <div className="avatar large">{user.name[0]}</div>
              <div className="user-main"><strong>{user.name}</strong><span>{user.email}</span></div>
              <span className={`role-badge ${user.role}`}>{user.role === "admin" ? <Shield size={15}/> : <Eye size={15}/>} {user.role}</span>
              <span className={user.active ? "active-text" : "inactive-text"}>{user.active ? "Active" : "Disabled"}</span>
              <button className="icon-btn" onClick={() => toggle(user.id)}>{user.active ? <ToggleRight size={25}/> : <ToggleLeft size={25}/>}</button>
            </div>
          ))}
        </div>
      </div>
      {show && (
        <div className="modal-backdrop"><form className="modal small" onSubmit={add}>
          <div className="modal-heading"><div><h3>Add portal user</h3><p>Create an admin or read-only account.</p></div><button type="button" onClick={() => setShow(false)}>×</button></div>
          <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label>
          <label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">Read-only user</option><option value="admin">Administrator</option></select></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShow(false)}>Cancel</button><button className="primary-btn">Add user</button></div>
        </form></div>
      )}
    </>
  );
}
