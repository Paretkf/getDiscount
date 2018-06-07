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
            if (!c.exists) {
                console.log('No such Code')
                res.send(null)
            } else {
                res.send(c.data())
            }
            return c.data()
        })
})