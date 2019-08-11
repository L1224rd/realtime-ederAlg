const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socket = require('socket.io')(http);

const path = require('path');
require('dotenv').config();

const db = require('./providers/firebase').ref(process.env.FIREBASE_ACCESS_TOKEN);
const Config = db.child('config');
const Result = db.child('results');

const config = {};
const results = [];

Config.on('value', (data) => {
  config.numOfLoops = data.val().numOfLoops;
  config.numSize = data.val().numSize;
  config.time = data.val().time;
  config.chunck = data.val().chunck;
});

app.use('/static', express.static('./static'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const sendCode = (client) => {
  client.emit('code', {
    time: config.time || 100,
    code: `"use strict";(function(){var a=new Date;var e=${config.numSize || 100};var r=${config.numOfLoops || 200};var f=0;var i=0;var n=function a(){var n=[];var r=[];var t=0;var v=function a(){t++;var r=Math.floor(Math.random()*e+1);if(n.indexOf(r)<0)n.push(r)};while(n.length<e){v()}i+=t;if(t>f)f=t};for(var t=0;t<r;t++){n()}return{tc:i,mc:f,t:new Date-a,nl:r,ns:e}})();`,
  });
}

const saveResults = (result) => {
  console.log(result.ns, results.length);
  results.push(result);
  if (results.length >= (config.chunck || 500)) {
    const myResults = [...results];
    results.length = 0;
    numSizeArray = [...new Set(myResults.map(a => a.ns))];
    numSizeArray.forEach(async (ns) => {
      const nsObj = (await Result.child(ns).once('value')).val() || {
        averageCount: 0,
        numOfLoops: 0,
        averageTime: 0,
        maxCount: 0,
      };

      let totalCount = 0;
      let numOfLoops = 0;
      let totalTime = 0;
      let { maxCount } = nsObj;

      myResults.filter(result => +result.ns === +ns).forEach((result) => {
        totalCount += +result.tc;
        numOfLoops += +result.nl;
        totalTime += +result.t;
        if (!maxCount || result.mc > maxCount) maxCount = result.mc;
      });

      const totalCountNsObj = nsObj.averageCount * nsObj.numOfLoops;
      const averageCount = (totalCount + totalCountNsObj) / (numOfLoops + nsObj.numOfLoops);

      const totalTimeNsObj = nsObj.averageTime * nsObj.numOfLoops;
      const averageTime = (totalTime + totalTimeNsObj) / (numOfLoops + nsObj.numOfLoops);

      numOfLoops += nsObj.numOfLoops;

      Result.child(ns).set({
        averageCount,
        numOfLoops,
        averageTime,
        maxCount,
      });
    });
  }
};

socket.on('connection', (client) => {
  console.log(`${client.id} connected`);

  client.on('disconnect', () => {
    console.log(`${client.id} disconnected`);
  });

  client.on('chat_message', (msg) => {
    socket.emit('chat_message', `${client.id} => ${msg}`);
  });

  client.on('result', (result) => {
    saveResults(result);
    sendCode(client);
  });

  Config.once('value', (data) => {
    if (!data.val().numOfLoops || !data.val().numSize) {
      config.numOfLoops = data.val().numOfLoops;
      config.numSize = data.val().numSize;
    }
    sendCode(client);
  });
});

http.listen(3000, () => {
  console.log('READY');
});