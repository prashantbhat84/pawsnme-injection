const xlsx = require("xlsx")
const Axios = require("axios")


const read = xlsx.readFile("otp.xlsx", { cellDates: true })
const worksheet = read.Sheets["Sheet1"]

const result = xlsx.utils.sheet_to_json(worksheet)


const headers = {
    headers: {
        'Authorization': " Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbF9pZCI6InNoYXJhbkBwYXdzbm1lLmNvbSIsInBob25lX25vIjoiOTg4MDg1ODc0NCIsInNhbHQiOjE2MTE4MTY5NzU2NjIsInNlc3Npb25faWQiOiJVY1MxT1JURm8xMFBTR1h6RnJzY2JNLUlYOWthUExGViIsInVzZXJfdHlwZSI6IkRvY3RvciJ9.KEYuN540TxD4m4xCWbasWiRiMGWIb2pELrTjVuHLlVI",
        Cookie: "connect.sid=s%3AUcS1ORTFo10PSGXzFrscbM-IX9kaPLFV.rWvpR9576I2CDHvEU1YzQWfUa%2BxOgZCu%2FypQHREIAEg"
    }
}

const details = {
    "mobile_number": []
}

result.map(res => {
    details.mobile_number.push(res.mobile_no)
})


const verifyOtp = (phone_no, otp_id) => {
    Axios.put("https://prod.pawsnme.com/api/v1/doctor/otp/verifyOtp", {
        "phone_no": phone_no,
        "otp": "111111",
        "otp_id": `${otp_id}`
    }, headers)
        .then(res => { console.log(res) })
        .catch(err => console.log(err))
}


const sendOtp = () => {
    for (let index = 0; index < details.mobile_number.length; index++) {
        Axios.post("https://prod.pawsnme.com/api/v1/doctor/otp/generateOtp", {
            "phone_no": `${details.mobile_number[index]}`
        }, headers)
            .then(res => {
                let otp = res.data.result.otp_id;
                let ph_no = `${details.mobile_number[index]}`;
                verifyOtp(ph_no, otp)
            })
            .catch(err => console.log(err))
    }
}

sendOtp();