import React from "react";

import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import Login from "./Login";
import { Auth } from "./Auth";
// import SignUp from "./SignUp";

// import UserContextWrapper from "./LoadingContextWrapper";
import Loading from "./Loading";
import LoadingContextWrapper from "./LoadingContextWrapper";
import HomeDashboard from "./HomeDashboard/HomeDashboard";
// import SportsDefinition from "./SportsDefinition/SportsDefinition";
// import FieldDefinition from "./FieldDefinition/FieldDefinition";
// import EventDefinition from "./EventDefinition/EventDefinition";
// import Friends from "./FriendsDefinition/Friends";
// import FriendsDefinition from "./FriendsDefinition/FriendsDefinition";
// import ProfileFacebook from "./ProfileFacebook";
// import ChatsPage from "./ChatingRoom/ChatsPage";
// import DisableUser from "./DisableUser";
import POSTransPayment from "./TransactionAndPayment/POSTransPayment";
import POSStaffLayout from "./TransactionAndPayment/POSStaffLayout";
import POSPurchaseInvoice from "./TransactionAndPayment/POSPurchaseInvoice";

function App() {
  return (
    <LoadingContextWrapper>

      <Loading />

      <Routes>
        {/* <Route path='/signUp' element={<ProfileOfUser />} /> */}
        <Route element={<Auth />}>
          <Route path='/' element={<Outlet />}>
           
          <Route path='/login'>
            <Route index element={<Login />} />
            </Route>
            {/* <Route path='/profile'>
            <Route index element={<Profile />} />
            </Route> */}
            <Route path='/HomeDashboard'><Route index element={<HomeDashboard />} /></Route>
            <Route path="/pos" element={<POSStaffLayout />}>
              <Route index element={<Navigate to="sales" replace />} />
              <Route path="sales" element={<POSTransPayment />} />
              <Route path="purchase" element={<POSPurchaseInvoice />} />
            </Route>
             {/*<Route path='/sportsDefinition'><Route index element={<SportsDefinition />} /></Route>
            <Route path='/fieldsDefinition'><Route index element={<FieldDefinition />} /></Route>
            <Route path='/editProfile'><Route index element={<ProfileOfUser />} /></Route>
            <Route path='/event'><Route index element={<EventDefinition />} /></Route>
            <Route path='/chatRoom'><Route index element={<ChatsPage />} /></Route> 
            <Route path='/disableUser'><Route index element={<DisableUser />} /></Route> */}
         

        </Route>
        </Route>

      </Routes >


    </LoadingContextWrapper>
  );
}

export default App;
