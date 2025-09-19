import React from "react";
import { Routes, Route } from 'react-router';
import Tests from "./Tests";
import Test from "./Test";
import Result from "./Result";
import AdminProfileHome from "./AdminProfileHome";
import UserResults from "./UserResults";

const AdminProfile = () => {
    const testUrl = [
        "/tests/1/1",
        "/tests/1/2",
        "/tests/1/3",
        "/tests/1/4",
        "/tests/1/5",
        "/tests/2/1",
        "/tests/2/2",
        "/tests/2/3",
        "/tests/2/4",
        "/tests/2/5",
        "/tests/3/1",
        "/tests/3/2",
        "/tests/3/3",
        "/tests/3/4",
        "/tests/3/5",
        "/tests/4/1",
        "/tests/4/2",
        "/tests/4/3",
        "/tests/4/4",
        "/tests/4/5",
    ];

    return (
        <Routes>
            <Route path="/" element={<AdminProfileHome />} />
            <Route path="/tests" element={<Tests />} />
            {testUrl.map((urlvar, index) => {
            return <Route key={index} path={urlvar} element={<Test />} />;
            })}
            {testUrl.map((urlvar, index) => {
            return (
                <Route key={index} path={`${urlvar}/result`} element={<Result />} />
            );
            })}
            <Route path="/user-results" element={<UserResults />} />
        </Routes>
    );
}

export default AdminProfile;