

const url = process.env.REACT_APP_API_URL

export const sendData = async (data,endpoint) => {

    // returns null if it cannot connect to the endpoint, undefined if the key doesn't exist.

    

    try{
        const data = await connection(
            {
            method:"POST", 
            headers: {'Content-Type': 'application/json', }, // Indicate that the body is JSON}, 
            body:JSON.stringify(data)
            },
            `${url}/${endpoint}`);

        return data;
    }
    catch{
        return null;
    }

};

export const getData = async(token,endpoint) =>{

    try{
        const data = await connection(
            {
            method:"GET", 
            headers: {'Content-Type': 'application/json'}, // Indicate that the body is JSON}, 
            },
            `${url}/${endpoint}?token=${token}`);

        return data;
    }
    catch{
        return null;
    }


};

export const updateData = async(token,endpoint) =>{ // this could be merged into the senddata function, but meh

    try{
        const data = await connection(
            {
            method:"PUT", 
            headers: {'Content-Type': 'application/json'}, // Indicate that the body is JSON}, 
            body:JSON.stringify(data)
            },
            `${url}/${endpoint}`);

        return data;
    }
    catch{
        return null;
    }



};

const connection = async (request,endpoint) => {
    
    let response;

    try{
    response = fetch(endpoint,request);

    }
    catch{
        throw new Error("Could not connect to endpoint.");
    }

   

    return response;


};

