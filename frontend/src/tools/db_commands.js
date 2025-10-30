

const url = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"

export const sendData = async (data,endpoint,auth=null) => {

    // returns null if it cannot connect to the endpoint, undefined if the key doesn't exist.

    const headers = auth
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${auth}` }
    : { "Content-Type": "application/json" };

    try{
        const msg = await connection(
            {
            method:"POST", 
            headers: headers,  
            body:JSON.stringify(data)
            },
            `${url}${endpoint}`);

        return msg;
    }
    catch(err){
        console.error("WHYYYYYYY",err)
        return null;
    }

};

export const getData = async(token,endpoint,auth=null) =>{
    const headers = auth
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${auth}` }
    : { "Content-Type": "application/json" };

    try{

        console.log(`${url}${endpoint}?token=${token}`)

        const data = await connection(
            {
            method:"GET", 
            headers: headers }
            ,
            `${url}${endpoint}?token=${token}`);
            return data;
        }

    
    catch{
        return null;
    }


};

export const updateData = async(data,endpoint,auth=null) =>{ // this could be merged into the senddata function, but meh
    const headers = auth
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${auth}` }
    : { "Content-Type": "application/json" };
    try{
        const msg = await connection(
            {
            method:"PUT", 
            headers: headers, 
            body:JSON.stringify(data)
            },
            `${url}${endpoint}`);

        return msg;
    }
    catch{
        return null;
    }



};

const connection = async (request,endpoint) => {
    
    let response;

    try{
    response = await fetch(endpoint,request);

    }
    catch{
        throw new Error("Could not connect to endpoint.");
    }

   

    return response;


};

