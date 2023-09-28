import { useEffect, useRef } from "react";
import io, { ManagerOptions, SocketOptions, Socket } from 'socket.io-client';

export const useSocket = (
  uri: string,
  opts?: Partial<ManagerOptions & SocketOptions> | undefined
): Socket => {
	const { current: socket } = useRef(io(uri, opts));

	/** Socket cleanup if browser closes for example */
	useEffect(() => {
		return () => {
			if (socket)
				socket.close();
		};
	}, [socket]);

	return socket;
};