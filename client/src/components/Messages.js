import React from 'react';
import { Link } from 'react-router-dom';

const Messages = () => {
    return (
        <div>
            <h2>Messages</h2>
            <Link to="/home">
                <button>Home</button>
            </Link>
        </div>
    )
}

export default Messages;