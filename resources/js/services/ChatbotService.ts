const LOCALHOST = 'http://127.0.0.1:8000'
const getCsrfToken = (): string => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

export const Chat = async (req: string) => {
    const response = await fetch(`${LOCALHOST}/chatbot/c`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN' : getCsrfToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({message: req})
    })

    var res = response.json()
    console.log(res);
    

    return res;
}