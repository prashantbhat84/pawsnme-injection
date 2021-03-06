const xlsx = require("xlsx")
const Axios = require("axios")



const read = xlsx.readFile('register.xlsx', { cellDates: true })
const worksheet = read.Sheets["Sheet1"]

console.log(worksheet);


const ClinicId = "5fe0ceabdfc8443a8846eed7";
// const ClinicId = "5f8af90f7c3a0a17f1d50b7e";
const DoctorId = "5fe0ceabdfc8443a8846eed6";
// const DoctorId = "5f8af90f7c3a0a17f1d50b7d";
const baseurl = "https://api.dev.pawsnme.com"
const doctorPIN = 6973

const result = xlsx.utils.sheet_to_json(worksheet)
console.log({ result });




const headers = {
    // headers: {
    //     'Authorization': " Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbF9pZCI6InNoYXJhbkBwYXdzbm1lLmNvbSIsInBob25lX25vIjoiOTg4MDg1ODc0NCIsInNhbHQiOjE2MTI2MDAwMjEwNTcsInNlc3Npb25faWQiOiIwal9hcWdCVXdINHVucS1fdnQwOU02aXQtVnNuZV82MSIsInVzZXJfdHlwZSI6IkRvY3RvciJ9.4_lSjI49PnYibOPWS433QALJU7ij68ouqRToiBM8m5M"
    //     // Cookie: "connect.sid=s%3A0j_aqgBUwH4unq-_vt09M6it-Vsne_61.wutuglvdEPlRcNeOx2mBtj1oRDaUVrdnan4usEHoQDk"
    // }
    headers: {
        'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbF9pZCI6InByYXNoYW50LndvcmsuMTk4NEBnbWFpbC5jb20iLCJzYWx0IjoxNjE0NzAxODk5MzEyLCJzZXNzaW9uX2lkIjoic2E1TUFtT0Ruc3NqbjdjR1l3blJuRHdkMlVFVXZ5V3ciLCJ1c2VyX3R5cGUiOiJEb2N0b3IifQ.iNWhmScMdh9MH_cItzSUMO5NFNns0Lcv6BdIJUjIPwk",
        Cookie: "connect.sid=s%3Asa5MAmODnssjn7cGYwnRnDwd2UEUvyWw.%2F6uSOeOqQa0PYuyU0gnmOAfAiTgKTIeVELg39X%2BL8yY"
    }

}

function convertdate(time) {
    console.log('inside convertdate');
    console.log(time)
    if (time !== undefined) {
        const [year, month, day] = JSON.stringify(time).slice(1, 11).split("-");
        return day + "-" + month + "-" + year
    }
    else {

        return null
    }


}

function vaclogic(str, date) {
    console.log("inside vac logic")
    console.log(str);
    if (str !== undefined) {
        if (JSON.stringify(str).includes(";")) {

            return str.split(";")
        }
        else {
            if (date == 1) {
                let conDate = convertdate(str);
                return [conDate]
            }
            else {
                return [str];
            }
        }

    } else {
        return undefined
    }

}



const submitCheckupData = {
    "check_in_date": [],
    "check_out_date": [],
    "next_vaccination_name": [],
    "next_vaccination_drug": [],
    "next_vaccination_date": [],
    "remarks": [],
    "consultation_fee": [],
    "veterinary_service_charges": [],
    "discount": [],
    "discount_name": [],
    "total": [],
    "next_checkup": [],
    "vaccinations": []

}

result.map(res => {
    console.log('inside map');
    submitCheckupData.check_in_date.push(convertdate(res.check_in_date));
    submitCheckupData.check_out_date.push(convertdate(res.check_out_date));
    submitCheckupData.next_vaccination_name.push(vaclogic(res.next_vaccination_name));
    submitCheckupData.next_vaccination_drug.push(vaclogic(res.next_vaccination_drug));
    submitCheckupData.next_vaccination_date.push(vaclogic('3/4/12', 1));
    submitCheckupData.remarks.push(vaclogic(res.remarks));
    submitCheckupData.consultation_fee.push(res.consultation_fee);
    submitCheckupData.veterinary_service_charges.push(res.veterinary_service_charges);
    submitCheckupData.discount.push(res.discount);
    submitCheckupData.discount_name.push(res.discount_name);
    submitCheckupData.total.push(res.total);
    // submitCheckupData.next_checkup.push(convertdate(res.next_checkup))
    submitCheckupData.next_checkup.push(convertdate(res.checkup_date))
    submitCheckupData.vaccinations.push(vaclogic(res.vaccinations))

})



// vacitnation logic

let temp = []
let newobj = []

for (let i = 0; i < submitCheckupData.next_vaccination_name.length; i++) {
    console.log('inside for');
    let vacarr = ['']
    let vacDrugId = ['']
    let vacDate = ['']
    let vacVaccine = ['']


    temp = []
    vacarr = submitCheckupData.next_vaccination_name[i]
    vacDrugId = submitCheckupData.next_vaccination_drug[i]
    vacDate = submitCheckupData.next_vaccination_date[i]
    vacVaccine = submitCheckupData.vaccinations[i];

    if (vacarr !== undefined) {
        for (let index1 = 0; index1 < vacarr.length; index1++) {

            var obj = {}
            obj["name"] = vacarr[index1];
            obj["drug_id"] = vacDrugId === undefined ? null : vacDrugId[index1];
            obj["date"] = vacDate[index1];


            temp.push(obj);
        }
        newobj.push(temp);
    }

}
console.log('newobj', newobj)




const submit = async (checkupID, index1) => {
    const drugid = (newobj[index1]);

    console.log("inside submit")
    const ids = [];
    const vaccine = (submitCheckupData.remarks[index1]);
    let remark
    if (vaccine !== undefined) {
        remark = vaccine.join(" ")
        await Promise.all(vaccine.map(async (item, index) => {

            const vacc = await Axios.post(`${baseurl}/api/v1/doctor/checkup/${checkupID}/vaccination`, {
                "category": "VACCINATION-DEWORMING",
                "clinicId": ClinicId,
                "doctorId": DoctorId,
                "name": item,
                "drugId": null,
                "price": 0,
                "qty": 1,
                "total_price": 100

            }, headers);
            ids.push(vacc.data.result[0]._id)
        }))
    }

    try {
        const save1 = await Axios.patch(`${baseurl}/api/v1/doctor/checkup/${checkupID}/save`, {
            "next_vaccinations": newobj,
            "check_in_date": submitCheckupData.check_in_date[index1],
            "check_out_date": submitCheckupData.check_out_date[index1],
            "clinicId": ClinicId,
            "doctorId": DoctorId,
            "discount_name": submitCheckupData.discount_name[index1],
            "channel": "CLINIC",
            "type": "IPD"

        }, headers);

    } catch (error) {
        console.log('inside save next vacc error');
        console.log(error.response.data)
    }

    // console.log('vacc', vacc.data.result[0]._id)

    console.log('obj1', newobj[index1]);
    console.log('obj2', submitCheckupData);
    await Axios.put(`${baseurl}/api/v1/doctor/checkup/${checkupID}/submit`, {
        "channel": "CLINIC",
        "type": "IPD",
        "check_in_date": submitCheckupData.check_in_date[index1],
        "check_out_date": submitCheckupData.check_out_date[index1],
        "next_vaccinations": newobj[index1],
        "next_checkup_date": submitCheckupData.next_checkup[index1],
        "remarks": submitCheckupData.remarks[index1],
        "consultation_fee": 100,
        "veterinary_service_charges": 0,
        "discount": 100,
        "discount_name": submitCheckupData.discount_name[index1],
        "total_price": submitCheckupData.total[index1],
        "clinicId": ClinicId,
        "doctorId": DoctorId,
        "vaccinations": ids,
        "remarks": remark
    }, headers)
        .then(res => console.log('res2', res.config.data))
        .catch(err => {
            console.log('err1', err.response.data)
            // console.log('err1', err.response.data)
        })

    await Axios.post(`${baseurl}/api/v1/doctor/5f8af90f7c3a0a17f1d50b7d/clinic/5f8af90f7c3a0a17f1d50b7e/checkup/${checkupID}/invoice`,
        {
            "clinicId": ClinicId,
            "vetinary_charge": 25,
            "consumables": [],
            "discount": 100,
            "disposables": [],
            "doctorId": DoctorId,
            "doctorPIN": doctorPIN,
            "injectables": [],
            "labs": [],
            "medicines": [],
            "other_services": [],
            "surgeries": [],
            "total_price": 0,
            "vaccinations": [],
            "veterinary_service_charges": 25
        }, headers)
        .then(res => {
            console.log("invoice done")
            console.log(res);
        })
        .catch(err => console.log('err2', err.response.data))

}





async function initializeCheckup(coustomer_id, pet_id, index1) {

    console.log("inside initialize checkup")

    let initializeCheckupUrl = `${baseurl}/api/v1/doctor/checkup/initialize`;
    Axios.post(initializeCheckupUrl, {
        "clinicId": ClinicId,
        "doctorId": DoctorId,
        "petId": pet_id,
        "customerId": coustomer_id
    }, headers)
        .then(res => {
            submit(res.data.result.checkupId, index1)
        })
        .catch(err => {
            console.log('initialize checkup error');
            console.log(err.response.data);
        })




}



function registerCustomer() {
    console.log("inside register customer")

    let base_url = `${baseurl}/api/v1/doctor/registerCustomer`

    const data =
    {
        "mobile_number": [],
        "email_id": [],
        "first_name": [],
        "last_name": [],
        "address": [],
        "pets": [{
            "pet_name": [],
            "species": [],
            "sex": [],
            "dob": [],
            "breed": []
        }]
    }
    console.log(data.pets);

    result.map(key => {
        data.mobile_number.push(key.mobile_number);
        data.email_id.push(key.email_id);
        data.first_name.push(key.first_name);
        data.last_name.push(key.last_name);
        data.address.push(key.address);
        data.pets[0].pet_name.push(key.pet_name);
        data.pets[0].species.push(key.species);
        data.pets[0].sex.push(key.sex);
        data.pets[0].dob.push(key.dob);
        data.pets[0].breed.push(key.breed);
    })
    console.log({ data });
    for (let index1 = 0; index1 < data.mobile_number.length; index1++) {
        console.log('data', data.address[index1]);

        Axios.post(base_url, {

            "mobile_number": data.mobile_number[index1],
            "email_id": data.email_id[index1],
            "first_name": data.first_name[index1],
            "last_name": data.last_name[index1],
            "address": data.address[index1],
            "pets": [{
                "pet_name": data.pets[0].pet_name[index1],
                "species": data.pets[0].species[index1],
                // "sex": data.pets[0].sex[index1],
                "dob": convertdate(data.pets[0].dob[index1]),
                "breed": data.pets[0].breed[index1]
            }]

        }, headers)
            .then((res) => {
                initializeCheckup(res.data.result._id,
                    res.data.result.addedPets[0]._id, index1)
            })
            .catch((error) => {
                console.log("customer initialization error");
                console.log(error.response.data)
            })
    }
}
registerCustomer()