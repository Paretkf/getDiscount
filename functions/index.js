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
                setLog (c.data(), 'findCode', code)
            } else {
                console.log('No such Code')
                res.send(null)
                setLog ('No such Code', 'findCode', code)
            }
            return c.data()
        })
        
})

exports.checkOut = functions.https.onRequest((req, res) => {
    let tel = req.query.tel
    let net = req.query.net
    let code = req.query.code
    if (req.query.code) {
        const getCode = db.collection('promoCode').doc(code).get()
            .then(c => {
                if (c.exists && c.data().status === 'unused') {
                    db.collection('promoCode').doc(code).update({
                        status: 'used'
                    })
                    if (c.data().discount_type === 'Baht') {
                        setLog (c.data(), 'useCode', code)
                        net = net - (c.data().discount_number)
                    } else if (c.data().discount_type === '%') {
                        setLog (c.data(), 'useCode', code)
                        net = net - ((net * c.data().discount_number) / 100)
                    }
                } else {
                    setLog ('No such Code or Code Used', 'useCode', code)
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
                let dateExp = new Date(date.getFullYear(), date.getMonth()+3, date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds())
                let newCode = {
                    create_date: date,
                    discount_number: 300,
                    discount_type: 'Baht',
                    exp_date: dateExp,
                    status: 'unused',
                    type: 'onetime'
                }
                db.collection('promoCode').doc(generatedCode).set(newCode)
                res.send(generatedCode)
                setLog (newCode, 'genCode', generatedCode)
            } else {
                console.log('No such Tel or Net < 3000')
                res.send(null)
                setLog ('No such Tel or Net < 3000', 'genCode', null)
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

  function setLog (raw, state, code) {
    db.collection('logs').add({
        time: new Date(),
        state: state,
        code: code,
        raw: raw
    })
  }