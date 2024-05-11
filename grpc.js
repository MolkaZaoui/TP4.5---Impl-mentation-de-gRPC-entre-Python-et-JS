// grpc.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// charge le service gRPC et le fichier.proto
const PROTO_PATH = __dirname + '/my-service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

// Paramètres de connexion à la base de données MySQL
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'molka',
  password: 'molka',
  database: 'db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Définit le service gRPC
const myService = {
  getRecord: (call, callback) => {
    const id = call.request.id;

    // Requête à la base de données pour obtenir le record avec l'ID spécifié
    connection.query('SELECT * FROM records WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
      // Renvoie les données au client
      const record = results[0];
      callback(null, { record: record.id });
    });
  },
};

// Démarre le serveur gRPC
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, myService);
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => { 
  console.log('listening on port 50051');
  server.start();
});
