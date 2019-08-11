const socket = io();
socket.on('code', (params) => {
  setTimeout(() => {
    socket.emit('result', eval(params.code));
  }, params.time);
});