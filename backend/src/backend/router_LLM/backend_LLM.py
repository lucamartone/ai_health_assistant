from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import  requests


app = FastAPI()
MODEL = 'gemma3:1b'
URL = 'http://ollama_docker:11434'

class ollama_message (BaseModel):
    role:str
    content:str

class ollama_body_answere (BaseModel):
    model:str
    messages: List[ollama_message]
    stream: bool


class answer (BaseModel):
    answer:str


@app.post('/ask')
def ask (question:str):
    oll_mess = ollama_message(role='user',content=question)
    ollama_body_ans = ollama_body_answere(
        model=MODEL,
        messages = [oll_mess],
        stream=False
    )
    ollama_body_ans
    print(ollama_body_ans)
    body_js = { 'model' : f'{MODEL}', 'messages':[{'role':'user','content':f'{question}'}], 'stream': False}
    print(body_js)
    res = requests.post(f'{URL}/api/chat' ,json=body_js )  #json=ollama_body_ans.dict()
    
    res.raise_for_status()
    res_js = res.json()
    print(res_js)
    response = res_js['message']['content']

    return response