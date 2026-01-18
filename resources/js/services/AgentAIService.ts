import { GlobalHelper } from "@/helpers/GlobalHelper";

const BASEURL = 'http://127.0.0.1:8000'

export const AgentTask = async (req: string) => {
     const response = await fetch(`${BASEURL}/api/vizra-adk/interact`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN' : GlobalHelper.getCsrfToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({agent_name: 'crud_assistant',input: req})
        })
    
        var res = response.json()
        console.log(res);
        
        return res;
}