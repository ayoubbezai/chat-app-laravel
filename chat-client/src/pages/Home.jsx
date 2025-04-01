import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../service/authService';
import { userService } from '../service/userService';

const Home = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);

    // Fetch the current logged-in user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await authService.getCurrent();
                if (!userData.error) {
                    setUser(userData); // Correctly setting user data
                } else {
                    console.log("User not logged in.");
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const usersData = await userService.getAllUsers();
                if (!usersData.error) {
                    setUsers(usersData.users); // Ensuring correct data structure
                    console.log("Users List:", usersData.users);
                } else {
                    console.log("No users found.");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchAllUsers();
    }, []);

    return (
        <div className="flex items-center flex-col w-full  h-screen p-6 bg-gray-100">
            {/* User Greeting */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">
                    Welcome {user ? user.name : "Guest"}!
                </h1>
                {user ? (
                    <p className="text-green-600">You are logged in as {user.email}.</p>
                ) : (
                    <p className="text-red-600">
                        You are not logged in. <Link to="/login" className="text-blue-500 underline">Login here</Link>
                    </p>
                )}
            </div>

            {/* User List */}
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">List of Users</h2>
                {users.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                        {users.map((u) => (
                            <li key={u.id} className="text-gray-700">
                                <span className="font-semibold"><Link to={`/chat/${u.id}`}>{u.name}</Link></span> ({u.email})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No users found.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
