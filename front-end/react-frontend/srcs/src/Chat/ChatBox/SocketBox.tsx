import { useContext } from 'react';
import SocketContext from '../../Contexts/ChatSocket/Context';

export function SocketBox() {
	const { socket, uid, users } = useContext(SocketContext).SocketState;

	return (
		<div>
			<h2>Testing Sockets:</h2>
			<p>
				My user ID: <strong>{uid}</strong>
				<br />
				Users online: <strong>{users.length}</strong>
				<br />
				My socket ID: <strong>{socket?.id}</strong>
				<br />
			</p>
		</div>
	)
}