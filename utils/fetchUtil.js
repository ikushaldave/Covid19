export default async function stateWise(q){
    const response = await fetch(q);
    const data = await response.json();

    return data
}