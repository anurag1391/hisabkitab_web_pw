
export async function getRandomParty(request){

const res=await request.get('/api/party/random');

const body=await res.json();

return body.name;

}
