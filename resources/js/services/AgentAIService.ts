import { GlobalHelper } from "@/helpers/GlobalHelper";

const BASEURL = 'http://localhost:8000'

export const AgentTask = async (req: string) => {
     const response = await fetch(`${BASEURL}/api/vizra-adk/chat/completions`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN' : GlobalHelper.getCsrfToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "pdf_assistant",
                messages: [
                    {
                        role: "user",
                        content: req
                    }
                ]
            })
        })
        console.log(response);
        
    
        var res = response.json()
        console.log(res);
        
        return res;
}