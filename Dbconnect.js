const mongoose=require('mongoose')
async function connection(){
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/Park')
        console.log('Database is connected')
    }
    catch(error){
        console.log(error)
    }
}
connection()

