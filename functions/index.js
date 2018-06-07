const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp({
    credential: admin.credential.applicationDefault()
  })
  
var db = admin.firestore()

exports.getDiscount = functions.https.onRequest((req, res) => {
    let code = req.query.code
    let getCode = db.collection('promoCode').doc(code).get()
        .then(c => {
            if (c.exists) {
                res.send(c.data())
                db.collection('logs').add({
                    time: new Date(),
                    findCode: code,
                    raw:c.data()})
            } else {
                console.log('No such Code')
                res.send(null)
                db.collection('logs').add({
                    time: new Date(),
                    findCode: code,
                    raw: 'No such Code'})
            }
            return c.data()
        })
        
})

exports.checkOut = functions.https.onRequest((req, res) => {
    let tel = req.query.tel
    let net = req.query.net
    let code = req.query.code
    if(code){
        const getCode = db.collection('promoCode').doc(code).get()
            .then(c => {
                if (c.exists && c.data().status === 'unused') {
                    db.collection('promoCode').doc(code).update({
                        status: 'used'
                    })
                    if (c.data().discount_type === 'Baht') {
                        net = net - (c.data().discount_number)
                    }
                } else {
                    console.log('No such Code')
                    res.send(null)
                }
                return c.data()
            })
    }

        let getVip = db.collection('vip').doc(tel).get()
            .then(c => {
                if (c.exists && net >= 3000) {
                    let generatedCode = genCode()
                    let date = new Date()
                    let data = {
                        create_date: date,
                        discount_number: 300,
                        discount_type: 'Baht',
                        exp_date: date,
                        status: 'unused',
                        type: 'onetime'
                    }
                    db.collection('promoCode').doc(generatedCode).set(data);
                    res.send(generatedCode)
                } else {
                    console.log('No such Tel')
                    res.send(null)              
                }
                return c.data()
            })
})

function genCode() {
    var code = ''
    var message = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    for (var i = 0; i < 5; i++)
      code += message.charAt(Math.floor(Math.random() * message.length))
    return code
  }