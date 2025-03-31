import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../service/authService';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getCurrent = async () => {
            try {
                const userData = await authService.getCurrent();
                if (!userData.error) {
                    setUser(userData);
                } else {
                    console.log("User not logged in.");
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        getCurrent();
    }, []);

    return (
        <div className='flex items-center h-screen  flex-col '>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome {user ? user.name : "Guest"}!</h1>

                {user ? (
                    <p className="text-green-600">You are logged in as {user.email}.</p>
                ) : (
                    <p className="text-red-600">
                        You are not logged in. <Link to="/login" className="text-blue-500 underline">Login here</Link>
                    </p>
                )}
            </div>

            <div className=''>
                List of users

            </div>
        </div>

    );
};

export default Home;
