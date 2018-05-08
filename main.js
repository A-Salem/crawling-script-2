const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const _ = require('underscore');

const dbHost = 'mongodb://localhost:27017/brokers';
mongoose.connect(dbHost);

const officeSchema = new mongoose.Schema({

  }, {
    versionKey: false,
    strict: false
  });

const brokerSchema = new mongoose.Schema({

  }, {
    versionKey: false,
    strict: false
  });

// create mongoose model
const Office = mongoose.model('Office', officeSchema);
const Broker = mongoose.model('Broker', brokerSchema);

let extractBrokers = function(body, officeId){
  if(body.indexOf('<tbody>') > -1){
    let rows = body.split('<tbody>')[1].split('</tbody>')[0].split('<tr role="row">');
    _.each(rows, (row) => {
      let tds = row.replace(/\r\n/g, '').split('</tr>')[0].split('</td>');
      let id, name, phone, mobile, email
      // console.log(tds)
      for(let i = 0; i < tds.length; i++){
        let td;

        td = tds[i]
        td = td.split('>')[1] && td.split('>')[1].trim();
        // console.log(td)

        if(i == 0)
          id = td
        if(i == 1)
          name = td
        if(i == 2)
          phone = td
        if(i == 3)
          mobile = td
        if(i == 4)
          email = td
      }
      console.log(id, name, phone, mobile, email);
      if(id){
        Broker.create({
          Id: id,
          Name: name,
          Phone: phone,
          Mobile: mobile,
          Email: email,
          OfficeId: officeId
        });
      }

    });
  }
}

let callAPi = async function(officeId){
  let res = await new Promise ((resolve, reject) => {
    let url = '';
    request({
      method: 'GET',
      url: `${url}?officeNo=${officeId}`
    }, function(error, response, body){
      resolve({body: body});
    })
  })
  return res
}



Office.find({}, null, {lean: true}, (err, offices) => {
  let ids = offices.map(office => office.Id);
  console.log(ids);
  (function myLoop (i) {
     setTimeout(async function () {
        let index = 1609 - i
        let officeId = ids[index]
        let res = await callAPi(officeId)
        let body = res.body
        extractBrokers(body, officeId);
        console.log(i);
        // console.log(body);
        if (--i) myLoop(i);
     }, 30000)
  })(1609);

})



// console.log(body.split('"NextPageLink" href=')[1].split('>Next')[0].replace(/&#39;/g, "'"));
// if(body.indexOf('"NextPageLink" href=') > -1){
//   NextPageLink = body.split('"NextPageLink" href=')[1].split('>Next')[0];
// }
// console.log(NextPageLink)
// for(){
//
//   if(lastIndex && NextPageLink){
//     callAPi();
//   }
// }

// console.log(res1.body.split('<tbody>')[1].split('<tr role="row">')[1].split('</td>')[0].replace('<td>', '').trim())
// Broker.create({
//   name: 'sdsf',
//   age: 98
// });

// Office.create({
//   name: 'dsfs',
//   age: 98
// });

// fs.appendFile('public/1.html', res1.body, (err) => {
// if(err)
//   console.log('Error happened while saving log');
// });
