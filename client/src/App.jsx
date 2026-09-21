import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Adoption from "./pages/Adoption.jsx";
/*import AnimalDetails from "./pages/AnimalDetails.jsx";*/
import Rescue from "./pages/Rescue.jsx";
import Navbar from "./components/Navbar.jsx";
import Account from "./pages/Account.jsx";
import Login from "./pages/Login.jsx";
import AddAnimal from "./pages/AddAnimal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adoption" element={<Adoption />} />
         <Route path="/rescue" element={<Rescue />} />
         <Route path="/account" element={<Account/>}></Route>
         <Route path="/login" element={<Login />} />
         <Route path="/signup" element={<Signup />} />
         
         <Route
            path="/adoption/add"
            element={
            <ProtectedRoute>
                <AddAnimal />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
