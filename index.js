const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x2r2l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(express.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 4000;








app.get('/', (req, res) => {
  res.send("hello its working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appoientments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  // console.log(err)
  

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    // console.log(date.date);
    doctorCollection.find({email: email})
    .toArray((err, doctors) => {
      // console.log(err);
      const filter = {date: date.date}
if(doctors.length === 0) {
  filter.email = email;
}

appointmentCollection.find(filter)
.toArray((err, documents) => {
  // console.log(err);
res.send(documents);
})
    })



  });

  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
      })

      app.post("/addDoctor", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email, file);
        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, err => {
          if(err){
            console.log(err);
            res.status(500).send({msg: 'Failed to upload Image'})
          }

          const newImg = fs.readFileSync(filePath)
const encImg = newImg.toString('base64');

var image = {
  contentType: req.files.file.mimetype,
  size: req.files.file.size,
  img: Buffer(encImg, 'base64')
}
          doctorCollection.insertOne({name, email, image})
          .then(result => {
            fs.remove(filePath, error => {
              if (error) {
                console.log(error)
                res.status(500).send({msg: 'Failed to upload Image'})
              }
              res.send(result.insertedCount > 0)
            })
            
          })
          // return res.send({name: file.name, path: `/${file.name}`})
        })
        // appointmentCollection.insertOne(appointment)
        // .then(result => {
        //   res.send(result.insertedCount > 0)
        // })
      });

      app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post("/isDoctor", (req, res) => {
      const email = req.body.email;
      // console.log(date.date);
      doctorCollection.find({email: email})
      .toArray((err, doctors) => {
res.send(doctors.length > 0);
  

      })
  
  
  
    });
  

});


app.listen(process.env.PORT || port)