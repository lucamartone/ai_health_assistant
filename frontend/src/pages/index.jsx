import { useNavigate } from 'react-router-dom';

function Index() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <header className="w-full flex justify-between items-center p-4 bg-white shadow-md">
                <h1 className="text-3xl font-bold text-blue-600">AI Health Assistant</h1>
                <div className="space-x-4">
                <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Registrati
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Login
                </button>
                </div>
            </header>

            <main className="flex flex-col items-center justify-center flex-grow space-y-6 mt-10">
                <button
                onClick={() => navigate('/chat')}
                className="w-64 py-4 bg-indigo-500 text-white text-xl rounded-xl shadow hover:bg-indigo-600"
                >
                Chat
                </button>
                <button
                onClick={() => navigate('/book')}
                className="w-64 py-4 bg-purple-500 text-white text-xl rounded-xl shadow hover:bg-purple-600"
                >
                Book
                </button>
                <button
                onClick={() => navigate('/profile')}
                className="w-64 py-4 bg-pink-500 text-white text-xl rounded-xl shadow hover:bg-pink-600"
                >
                Profile
                </button>
            </main>
        </div>
    );
}
export default Index;