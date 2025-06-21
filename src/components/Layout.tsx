
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main 
        className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden"
        role="main"
        id="main-content"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
