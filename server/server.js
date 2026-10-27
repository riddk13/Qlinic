require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:clinic', (clinicId) => socket.join(clinicId));
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/tokens', require('./routes/tokens'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT, () =>
    console.log('Qlinic server chal raha hai on port', process.env.PORT)))
  .catch((err) => console.error('DB error:', err));