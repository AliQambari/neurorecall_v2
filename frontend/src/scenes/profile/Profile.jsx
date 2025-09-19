import React, { useContext, Fragment } from "react";
import "../../styles/Profile.css";
import { AuthContext } from "../../components/AuthContext";
import AdminProfile from "./AdminProfile";
import UserProfile from "./UserProfile";

export default function Profile() {
  const { logged, isAdmin, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }    
  return (
    <Fragment>
      {logged ? 
      (isAdmin ? <AdminProfile /> : <UserProfile />)
        : <p>You are not logged in!</p>
      }
    </Fragment>
  );
}
