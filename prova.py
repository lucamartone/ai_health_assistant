from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Usa il modello ChatDoctor
model_name = "ChatDoctor/ChatDoctor-LLaMA-7B"

# Caricamento tokenizer e modello
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, device_map="auto")

# Prompt di esempio (dialogo medico)
prompt = """###Patient:
Ho mal di testa da due giorni e la luce mi dà fastidio.
###Doctor:"""

# Tokenizza input
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

# Genera la risposta
output = model.generate(
    **inputs,
    max_new_tokens=150,
    do_sample=True,
    temperature=0.7,
    top_p=0.9
)

# Decodifica output
response = tokenizer.decode(output[0], skip_special_tokens=True)
print("\n🧑 ChatDoctor:\n")
print(response.replace("###Patient:", "\n🧑 Paziente:\n").replace("###Doctor:", "\n🩺 Medico:\n"))
