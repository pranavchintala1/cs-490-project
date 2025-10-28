import { jwtDecode } from "jwt-decode";







export const OAuth = (Signature) => {


// apply backend function to verify signature here. If that returns bad, return "error".
// Then, apply get function to user using jwtDecode
let token = "temp";
// const key = jwtDecode(Signature.credentials)
// token = backend(key);



return token;





};