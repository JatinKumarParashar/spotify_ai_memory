import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./views/login";
import SignUp from "./views/signUp";
import Layout, {
  AuthProvider,
  ProtectedRoute,
  PublicOnlyRoute,
  UnknownRoute,
} from "./views/layout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />} />
          </Route>
          <Route path="*" element={<UnknownRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
