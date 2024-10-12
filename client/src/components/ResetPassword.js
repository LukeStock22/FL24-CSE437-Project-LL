import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate


const ResetPassword = () => {
 const { token } = useParams();
 const [newPassword, setNewPassword] = useState('');
 const [message, setMessage] = useState('');
 const navigate = useNavigate(); // Use navigate to handle the redirection


 const handlePasswordReset = async (e) => {
   e.preventDefault();
   const res = await fetch(`http://localhost:4000/api/password-reset/${token}`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ newPassword }),
   });
   const data = await res.json();
   setMessage(data.message);
 };


 // Handle going back to the login page
 const handleBackToLogin = () => {
   navigate('/login'); // Navigate to the login page
 };


 return (
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
     <div className="bg-white py-16 px-8 rounded shadow-md w-full max-w-sm relative"> {/* Adjust padding for top/bottom space */}
       {/* Back button */}
       <button
         onClick={handleBackToLogin}
         className="absolute top-4 left-4 text-blue-500 hover:underline"
       >
         &larr; Back to Login
       </button>


       <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
       <form onSubmit={handlePasswordReset} className="space-y-4">
         <input
           type="password"
           placeholder="New Password"
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
           className="w-full p-2 border border-gray-300 rounded"
         />
         <button
           type="submit"
           className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
         >
           Reset Password
         </button>
       </form>
       {message && <p className="mt-4 text-center">{message}</p>}
     </div>
   </div>
 );
};


export default ResetPassword;
