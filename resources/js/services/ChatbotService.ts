import { GlobalHelper } from "@/helpers/GlobalHelper";

const BASEURL = 'http://127.0.0.1:8000'

export const Chat = async (req: string) => {
    const response = await fetch(`${BASEURL}/chatbot/c`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN' : GlobalHelper.getCsrfToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({message: req})
    })

    var res = response.json()
    console.log(res);
    
    return res;
}