import { getUser, logout } from "../state/auth";

export default function Profile() {
  const user = getUser();
  if (!user) return <p>No user logged in.</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles?.join(", ")}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
