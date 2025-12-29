#!/usr/bin/env python3
"""
PDF to Text MCP Server - SimStudio.ai Ready
Deploy → Get URL → Paste in SimStudio.ai
"""
import fitz
import base64
import tempfile
import os
import json
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

@app.post("/mcp")
async def mcp_handler(request: Request):
    data = await request.json()
    
    if data.get("method") == "initialize":
        return {"jsonrpc": "2.0", "id": data["id"], "result": {"protocolVersion": "2025-03-26"}}
    
    if data.get("method") == "tools/list":
        return {"jsonrpc": "2.0", "id": data["id"], "result": {
            "tools": [{
                "name": "pdf_to_text",
                "description": "Convert PDF to text",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pdf_data": {"type": "string", "description": "Base64 PDF"},
                        "pages": {"type": "array", "items": {"type": "integer"}}
                    },
                    "required": ["pdf_data"]
                }
            }]
        }}
    
    if data.get("method") == "tools/call":
        name = data["params"]["name"]
        args = data["params"]["arguments"]
        if name == "pdf_to_text":
            result = pdf_to_text(args)
            return {"jsonrpc": "2.0", "id": data["id"], "result": result}
    
    raise HTTPException(400, "Invalid method")

def pdf_to_text(args):
    try:
        pdf_bytes = base64.b64decode(args["pdf_data"])
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(pdf_bytes)
            path = f.name
        
        doc = fitz.open(path)
        text = ""
        for page in doc:
            text += f"=== Page {page.number + 1} ===\n{page.get_text()}\n\n"
        doc.close()
        os.unlink(path)
        
        return [{"type": "text", "text": text}]
    except Exception as e:
        return [{"type": "text", "text": f"Error: {str(e)}"}]

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

