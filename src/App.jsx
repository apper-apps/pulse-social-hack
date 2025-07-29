import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/pages/Layout";
import HomeFeed from "@/components/pages/HomeFeed";
import ExplorePage from "@/components/pages/ExplorePage";
import ProfilePage from "@/components/pages/ProfilePage";
import PostDetailPage from "@/components/pages/PostDetailPage";
import MessagesPage from "@/components/pages/MessagesPage";
import NotificationsPage from "@/components/pages/NotificationsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeFeed />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="post/:postId" element={<PostDetailPage />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-50"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;