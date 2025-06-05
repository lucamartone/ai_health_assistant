import { useNavigate } from 'react-router-dom';

function Index() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center justify-center min-h-screen bg-gray-100 p-4 gap-4">
            <header className="w-full flex justify-between items-center p-4 bg-white shadow-md">
                <h1 className="text-3xl font-bold text-blue-600">Il tuo assistente per la salute</h1>
            </header>

            <main className="flex flex-row items-center justify-center flex-grow space-y-6 mt-10">
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