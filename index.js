const {ApolloServer,gql}=require("apollo-server")
let {user,qoutes}=require("./fakeDb/db")
const {MONGODB_URL}=require("./config")
const mongoose=require('mongoose')
//const MONGODB_URL="mongodb+srv://Mrsunil12345:<password>@cluster0.obaigop.mongodb.net/?retryWrites=true&w=majority"
console.log(MONGODB_URL)

mongoose.connect(MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.on("connected",()=>{
    console.log("database connected")
})

mongoose.connection.on("error",(error)=>{
    console.log("Something went wrong",error)
})

const UserModel=require('./models/users')
const Qoutes=require('./models/qoutes')
const { compareSync } = require("bcrypt")




const typeDefs=gql`
type User{
    _id:ID
    name:String
    age:String
    email:String
    quotes:[Qoutes]

}

type Query{
    name:String
    user:[User]
    quotes:[Qoutes]
    users(_id:ID!):[User]
    
}
type Qoutes{
    Qname:String
    by:String
}

type Mutation {
    createUser(_id:ID,name:String,age:String,email:String):User
    updateUser(email:String!):User
 }

`
const resolvers={
    Query:{
        name:()=>"Hello Sunil ",
        user:async()=>{
            console.log("INSIDE USER")
            
          return await UserModel.find({},(err,result)=>{
            if(err){
                console.log("There is an error")
            }
            else{

                console.log("Inside else block")
                console.log("result is ",result)
                return result
            }
          }).clone()
          
        }, 
        quotes:()=>qoutes,
        users:async(_,{_id})=>{
           
            let output= await UserModel.findById(_id,(err,out)=>{
                
                if(err){
                    console.log("Something went wrong")
                }
                else{
                    
                    return out
                }
            }).clone().catch(function(err){ console.log(err)})
            
            // let output=user.find((user)=>user._id==_id)
            // console.log("Output of the ",output)

            console.log("Output of the query is ",output)
            return [output]
        }
        
           
    },
    User:{
        quotes:(parents)=>{
             console.log(parents)
             if(parents._id===qoutes.by)
             return qoutes
        }
    },
    Mutation:{
        createUser:(parent,{_id,name,age,email})=>{
            console.log("inside muation")
            // console.log(newUser)
            const newUser=new UserModel({
                name:name,age:age,email:email
            })
          const output= newUser.save(function (err, doc) {
                if(!err){
                     console.log("user created sucessfully")
                }else{
                    console.log("error",err)
                }
            });

            console.log(output)
 },
 updateUser:async(_,{email})=>{
   return await UserModel.findOneAndUpdate({email:email},{$set:{age:"44"}}).clone()
 }

    }
   
}

const server=new ApolloServer({typeDefs,resolvers})
server.listen(7000,()=>{
    console.log("Server is runing!!!!!!!!!!!!!!! ")
})





