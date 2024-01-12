import { useState } from 'react';
import {useNavigate} from 'react-router-dom';


function Home() {

    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () =>  {
        console.log("here");
        navigate(`/meeting/${roomId}`);
    }
    console.log("hey");
    return (
        <div class="grid grid-cols-3 gap-4">
            <div class="mb-6">
                <input type="text" onChange={(e) => setRoomId(e.target.value)} id="room-id" placeholder="Enter room id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                <br/>
                <button onClick={handleSubmit} type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Join existing room</button>
            </div>
        </div>
    )
}

export default Home;